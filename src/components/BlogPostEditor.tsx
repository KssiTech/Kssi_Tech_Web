import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Save, Eye, Calendar, Tag, Image, Settings, 
  ArrowLeft, Upload, X, Plus, Check 
} from 'lucide-react';
import { blogService } from '@/services/blogService';
import { BlogPost, BlogCategory, BlogTag } from '@/lib/supabase';

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featured_image_url: post?.featured_image_url || '',
    category_id: post?.category_id || '',
    status: post?.status || 'draft' as 'draft' | 'published' | 'archived',
    featured: post?.featured || false,
    scheduled_at: post?.scheduled_at || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    meta_keywords: post?.meta_keywords || '',
    read_time_minutes: post?.read_time_minutes || 5
  });

  useEffect(() => {
    loadCategories();
    loadTags();
    if (post) {
      loadPostTags();
    }
  }, [post]);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !post) {
      setFormData(prev => ({
        ...prev,
        slug: blogService.generateSlug(formData.title)
      }));
    }
  }, [formData.title, post]);

  useEffect(() => {
    // Auto-calculate read time from content
    if (formData.content) {
      const readTime = blogService.calculateReadTime(formData.content);
      setFormData(prev => ({
        ...prev,
        read_time_minutes: readTime
      }));
    }
  }, [formData.content]);

  const loadCategories = async () => {
    const { data } = await blogService.getAllCategories();
    if (data) setCategories(data);
  };

  const loadTags = async () => {
    const { data } = await blogService.getAllTags();
    if (data) setTags(data);
  };

  const loadPostTags = async () => {
    if (!post) return;
    // This would need to be implemented in the blog service
    // For now, we'll leave it empty
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    const slug = blogService.generateSlug(newTag);
    const { data, error } = await blogService.createTag({ name: newTag, slug });
    
    if (data && !error) {
      setTags(prev => [...prev, data]);
      setSelectedTags(prev => [...prev, slug]);
      setNewTag('');
    }
  };

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev => 
      prev.includes(tagSlug) 
        ? prev.filter(t => t !== tagSlug)
        : [...prev, tagSlug]
    );
  };

  const handleSave = async (status: 'draft' | 'published') => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        ...formData,
        status,
        tags: selectedTags
      };

      let result;
      if (post) {
        result = await blogService.updatePost(post.id, postData);
      } else {
        result = await blogService.createPost(postData);
      }

      if (result.error) {
        console.error('Error saving post:', result.error);
        setError(typeof result.error === 'string' ? result.error : result.error.message || 'Failed to save post');
        return;
      }

      if (result.data) {
        onSave(result.data);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      setError(error?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab or modal
    const previewData = {
      ...formData,
      tags: selectedTags.map(slug => tags.find(t => t.slug === slug)?.name).filter(Boolean)
    };
    
    // Store in localStorage for preview page
    localStorage.setItem('blog_preview', JSON.stringify(previewData));
    window.open('/blog/preview', '_blank');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Posts</span>
              </Button>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {post ? 'Edit Post' : 'Create New Post'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </Button>
              
              <Button
                onClick={() => handleSave('published')}
                disabled={loading}
                className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Publish</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title..."
                className="mt-1 text-lg font-semibold"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="url-friendly-slug"
                className="mt-1"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief description of the post..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Content Editor */}
            <div>
              <Label htmlFor="content" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here... (Markdown supported)"
                rows={20}
                className="mt-1 font-mono"
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Estimated read time: {formData.read_time_minutes} minutes
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Publish Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Status
                  </Label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`mt-1 w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Category
                  </Label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className={`mt-1 w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured" className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Featured Post
                  </Label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button
                    onClick={handleAddTag}
                    size="sm"
                    className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.slug)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.slug)
                          ? 'bg-khwarizmia-teal text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Meta Title
                  </Label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="SEO title (leave empty to use post title)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Meta Description
                  </Label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="SEO description (leave empty to use excerpt)"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Keywords
                  </Label>
                  <Input
                    value={formData.meta_keywords}
                    onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;
