import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Search, Filter, Plus, Edit3, Trash2, Eye,
  BookOpen, Tag, User, Calendar, Clock,
  Settings, Upload, Download, Share2,
  BarChart3, MessageCircle, ThumbsUp
} from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogPost as BlogPostType, BlogCategory } from "@/lib/supabase";

interface BlogManagementProps {
  posts?: BlogPostType[];
  categories?: BlogCategory[];
  onEditPost?: (post: BlogPostType) => void;
  onDeletePost?: (postId: string) => void;
  onNewPost?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

export default function BlogManagement({
  posts: propsPosts,
  categories: propsCategories,
  onEditPost,
  onDeletePost,
  onNewPost,
  onImport,
  onExport
}: BlogManagementProps = {}) {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const handleImport = () => {
    if (onImport) {
      onImport();
    } else {
      alert('Import functionality coming soon! This will allow you to import blog posts from JSON or CSV files.');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      alert('Export functionality coming soon! This will allow you to export blog posts to JSON or CSV files.');
    }
  };

  const handleShare = (post: BlogPostType) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const title = post.title;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: post.excerpt || '',
        url: url
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert(`Share this link: ${url}`);
      });
    }
  };

  // Load real data from database if not provided via props
  useEffect(() => {
    const loadData = async () => {
      if (propsPosts && propsCategories) {
        setPosts(propsPosts);
        setCategories(propsCategories);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [postsResult, categoriesResult] = await Promise.all([
          blogService.getAllPosts({ limit: 50 }),
          blogService.getAllCategories()
        ]);

        if (postsResult.data) setPosts(postsResult.data);
        if (categoriesResult.data) setCategories(categoriesResult.data);
      } catch (error) {
        console.error('Error loading blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propsPosts, propsCategories]);

  // Use real blog posts data
  const categoryNames = ['All', ...categories.map(cat => cat.name)];
  const statuses = ['All', 'draft', 'published', 'archived'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'published': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' ||
                           (post.blog_categories && post.blog_categories.name === selectedCategory);
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const PostRow = ({ post }: { post: BlogPostType }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {post.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>
          
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
            {post.excerpt || blogService.extractExcerpt(post.content, 120)}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.profiles?.full_name || 'KSSI TECH Team'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at || post.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.read_time_minutes || 5} min read
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {post.blog_categories?.name || 'General'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.blog_post_tags && post.blog_post_tags.length > 0 ? (
                post.blog_post_tags.map((tagRelation: any, index: number) => (
                  <span key={index} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    #{tagRelation.blog_tags?.name || 'tag'}
                  </span>
                ))
              ) : (
                <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  #general
                </span>
              )}
            </div>

            {post.status === 'published' && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.view_count?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  0
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  0
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            title="View Post"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditPost && onEditPost(post)}
            title="Edit Post"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleShare(post);
            }}
            title="Share Post"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => onDeletePost && onDeletePost(post.id)}
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Blog Management
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Manage your KSSI TECH blog posts and content
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleImport}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
            onClick={() => onNewPost && onNewPost()}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khwarizmia-teal mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading blog posts...</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
            >
              {categoryNames.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-khwarizmia-teal" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {posts.filter(p => p.status === 'published').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Published</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Edit3 className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {posts.filter(p => p.status === 'draft').length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Drafts</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {posts.reduce((sum, post) => sum + (post.view_count || 0), 0).toLocaleString()}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    0
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Comments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Posts ({filteredPosts.length})
              </h3>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No posts found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
