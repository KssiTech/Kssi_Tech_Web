import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, Plus, Edit3, Trash2, Send,
  BookOpen, Tag, User, Eye, Save, FileText,
  Settings, Target, TrendingUp, Globe
} from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogPost as BlogPostType, BlogCategory } from "@/lib/supabase";
import { commonBlogTags } from "@/data/blogTemplates";

interface BlogSchedulerProps {
  posts?: BlogPostType[];
  categories?: BlogCategory[];
  onEditPost?: (post: BlogPostType) => void;
  onDeletePost?: (postId: string) => void;
  onNewPost?: () => void;
}

export default function BlogScheduler({
  posts: propsPosts,
  categories: propsCategories,
  onEditPost,
  onDeletePost,
  onNewPost
}: BlogSchedulerProps = {}) {
  const { isDark } = useTheme();
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter for scheduled and draft posts
  const scheduledPosts = posts.filter(post =>
    post.status === 'draft' || (post.scheduled_at && new Date(post.scheduled_at) > new Date())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'published': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const PostCard = ({ post }: { post: BlogPostType }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg cursor-pointer`}
      onClick={() => setSelectedPost(post)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {post.title}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            {post.excerpt || blogService.extractExcerpt(post.content, 120)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {post.profiles?.full_name || 'KSSI TECH Team'}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {post.read_time_minutes || 5} min read
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(post.scheduled_at || post.created_at)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {post.blog_post_tags && post.blog_post_tags.length > 0 ? (
            <>
              {post.blog_post_tags.slice(0, 3).map((tagRelation: any, index: number) => (
                <span key={index} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  #{tagRelation.blog_tags?.name || 'tag'}
                </span>
              ))}
              {post.blog_post_tags.length > 3 && (
                <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  +{post.blog_post_tags.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              #general
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditPost && onEditPost(post);
            }}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/blog/${post.slug}`, '_blank');
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khwarizmia-teal mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading scheduled posts...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Blog Scheduler
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                Plan, schedule, and manage your KSSI TECH blog content
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
              <Button
                className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
                onClick={() => onNewPost ? onNewPost() : setIsCreating(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-khwarizmia-teal" />
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
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {scheduledPosts.length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Scheduled</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-green-500" />
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
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {posts.reduce((sum, post) => sum + (post.view_count || 0), 0).toLocaleString()}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scheduled Posts */}
            <div className="lg:col-span-2">
              <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Posts ({scheduledPosts.length})
              </h3>
              {scheduledPosts.length > 0 ? (
                <div className="space-y-6">
                  {scheduledPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled posts yet.</p>
                  <p className="text-sm mt-2">Create a new post and schedule it for publishing.</p>
                </div>
              )}
            </div>

        {/* Content Templates & Tools */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
          >
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Content Templates
            </h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Technical Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Research Paper
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                API Tutorial
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Market Update
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
          >
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonBlogTags.map((tag, index) => (
                <span key={index} className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
          >
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Publishing Schedule
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Monday</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Technical Deep Dive</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Wednesday</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Market Analysis</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Friday</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Research Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
