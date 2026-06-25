import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import {
  BookOpen, Edit3, BarChart3, Calendar, Clock, ArrowRight,
  User, Tag, TrendingUp, Eye, MessageCircle, Share2, ThumbsUp,
  Settings, Plus, Search, Filter, Globe, Target, Mail, CheckCircle
} from "lucide-react";
import BlogAnalytics from "@/components/BlogAnalytics";
import BlogScheduler from "@/components/BlogScheduler";
import BlogManagement from "@/components/BlogManagement";
import BlogPostEditor from "@/components/BlogPostEditor";
import EngagementMetrics from "@/components/EngagementMetrics";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import { blogService } from "@/services/blogService";
import { BlogPost, BlogCategory } from "@/lib/supabase";

function Blog() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("public");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  // Check if user is admin - using Supabase user metadata
  const isAdmin = user?.user_metadata?.role === 'admin' ||
    (user?.email && [
      'bellaj.khalid@gmail.com',
      'kssitech@gmail.com',
      'kssitech@gmail.com',
      'kssitech@gmail.com'
    ].includes(user.email.toLowerCase()));

  useEffect(() => {
    // Safety timeout to avoid indefinite loading UI
    const timeout = setTimeout(() => setLoading(false), 8000);
    loadPosts();
    loadCategories();
    loadSubscriberCount();
    return () => clearTimeout(timeout);
  }, [selectedCategory, searchQuery]);

  const loadPosts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await blogService.getAllPosts({
        status: 'published',
        category: selectedCategory || undefined,
        limit: 20
      });

      if (error) {
        console.error('Supabase getAllPosts error:', error.message || error);
        setErrorMessage(typeof error === 'string' ? error : (error.message || 'Failed to load posts'));
        setPosts([]);
        return;
      }

      if (data) {
        let filteredPosts = data;

        // Apply search filter
        if (searchQuery) {
          filteredPosts = data.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setPosts(filteredPosts);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      setErrorMessage(error?.message || 'Unexpected error while loading posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await blogService.getAllCategories();
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubscriberCount = async () => {
    try {
      const { count, error } = await blogService.getNewsletterSubscriberCount();
      if (!error) {
        setSubscriberCount(count);
      }
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    }
  };

  const handlePostSave = (savedPost: BlogPost) => {
    setShowEditor(false);
    setEditingPost(null);
    loadPosts(); // Reload posts
  };

  const handlePostEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handlePostDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await blogService.deletePost(postId);
      if (error) {
        alert('Failed to delete post: ' + (error.message || error));
        return;
      }
      alert('Post deleted successfully!');
      loadPosts(); // Reload posts
    } catch (error: any) {
      alert('Error deleting post: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleImport = () => {
    alert('Import functionality coming soon! This will allow you to import blog posts from JSON or CSV files.');
  };

  const handleExport = () => {
    alert('Export functionality coming soon! This will allow you to export blog posts to JSON or CSV files.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Professional blog data for KSSI Tech
  const blogData = {
    name: "KSSI Tech Blog",
    title: "Solutions Industrielles Insights & Technical Excellence",
    description: "Articles, research notes, and technical perspectives from KSSI Tech for solutions industrielles et tertiaires teams",
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, post) => sum + post.view_count, 0),
    subscribers: subscriberCount, // Real-time count from newsletter_subscribers table
    avgReadTime: posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + post.read_time_minutes, 0) / posts.length) : 0,
    categories: categories.map(cat => cat.name),
    recentPosts: posts.slice(0, 5)
  };

  if (showEditor) {
    return (
      <BlogPostEditor
        post={editingPost || undefined}
        onSave={handlePostSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Helmet>
        <title>KSSI Tech Blog & Commentary | Solutions Industrielles Insights</title>
        <meta name="description" content="KSSI Tech Blog & Commentary—insights, research, and technical content for solutions industrielles et tertiaires professionals: risk, derivatives, calibration, and the KSSI Tech platform." />
        <meta name="keywords" content="KSSI Tech blog, solutions industrielles et tertiaires, risk management, derivatives, volatility, market models, commentary" />
        <link rel="canonical" href="https://kssi-tech.com/blog" />
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-khwarizmia-teal rounded-xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold">{blogData.name}</h1>
              </div>

              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {blogData.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-khwarizmia-teal">{blogData.totalPosts}</div>
                  <div className="text-sm text-blue-200">Published Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-khwarizmia-teal">{blogData.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-khwarizmia-teal">{blogData.subscribers.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-khwarizmia-teal">{blogData.avgReadTime}</div>
                  <div className="text-sm text-blue-200">Avg Read Time</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setActiveSection("public")}
                  variant={activeSection === "public" ? "default" : "outline"}
                  className="rounded-lg text-khwarizmia-navy"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Blog Posts
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      onClick={() => setActiveSection("analytics")}
                      variant={activeSection === "analytics" ? "default" : "outline"}
                      className="rounded-lg text-khwarizmia-navy"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                    <Button
                      onClick={() => setActiveSection("scheduler")}
                      variant={activeSection === "scheduler" ? "default" : "outline"}
                      className="rounded-lg text-khwarizmia-navy"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduler
                    </Button>
                    <Button
                      onClick={() => setActiveSection("management")}
                      variant={activeSection === "management" ? "default" : "outline"}
                      className="rounded-lg text-khwarizmia-navy"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Management
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-16`}>
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">

            {activeSection === "analytics" && isAdmin ? (
              <BlogAnalytics />
            ) : activeSection === "scheduler" && isAdmin ? (
              <BlogScheduler
                posts={posts}
                categories={categories}
                onEditPost={handlePostEdit}
                onDeletePost={handlePostDelete}
                onNewPost={handleNewPost}
              />
            ) : activeSection === "management" && isAdmin ? (
              <BlogManagement
                posts={posts}
                categories={categories}
                onEditPost={handlePostEdit}
                onDeletePost={handlePostDelete}
                onNewPost={handleNewPost}
              />
            ) : (
              <PublicBlogView
                posts={posts}
                categories={categories}
                loading={loading}
                errorMessage={errorMessage}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onCategoryChange={setSelectedCategory}
                onSearchChange={setSearchQuery}
                onNewPost={() => setShowEditor(true)}
                onEditPost={handlePostEdit}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onSubscribeSuccess={loadSubscriberCount}
              />
            )}

          </div>
        </div>
      </section>
    </div>
  );
}

// Public Blog View Component
interface PublicBlogViewProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  loading: boolean;
  errorMessage?: string | null;
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onNewPost: () => void;
  onEditPost: (post: BlogPost) => void;
  isAdmin: boolean;
  formatDate: (date: string) => string;
  onSubscribeSuccess?: () => void;
}

const PublicBlogView: React.FC<PublicBlogViewProps> = ({
  posts,
  categories,
  loading,
  errorMessage,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onNewPost,
  onEditPost,
  isAdmin,
  formatDate,
  onSubscribeSuccess
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            {isAdmin && (
              <Button
                onClick={onNewPost}
                className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khwarizmia-teal mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading articles...</p>
        </div>
      ) : errorMessage ? (
        <div className="text-center py-12">
          <p className={`mt-4 ${isDark ? 'text-red-300' : 'text-red-600'}`}>Error: {errorMessage}</p>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please check console for details. We will retry automatically.</p>
        </div>
      ) : (
        <>
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Featured Articles
              </h2>
              <div className="grid gap-8">
                {featuredPosts.map((post) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl overflow-hidden shadow-lg ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="md:flex">
                      {post.featured_image_url && (
                        <div className="md:w-1/3">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-64 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className={`p-8 ${post.featured_image_url ? 'md:w-2/3' : 'w-full'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: post.blog_categories?.color || '#0A1F44' }}
                          >
                            {post.blog_categories?.name || 'Uncategorized'}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                        </div>

                        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {post.title}
                        </h3>

                        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {post.excerpt || blogService.extractExcerpt(post.content)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <User className="w-4 h-4" />
                              <span>{post.profiles?.full_name || 'KSSI Tech Team'}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Clock className="w-4 h-4" />
                              <span>{post.read_time_minutes} min read</span>
                            </div>
                            <EngagementMetrics
                              postId={post.id}
                              initialViews={post.view_count}
                              size="sm"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/blog/${post.slug}`)}
                            >
                              Read More
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditPost(post)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts - Dashboard Card Style */}
          {regularPosts.length > 0 && (
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {featuredPosts.length > 0 ? 'Latest Articles' : 'All Articles'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-khwarizmia-teal to-khwarizmia-navy flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: post.blog_categories?.color || '#0A1F44' }}
                        >
                          {post.blog_categories?.name || 'Uncategorized'}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>

                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {post.title}
                      </h3>

                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {post.excerpt || blogService.extractExcerpt(post.content, 120)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{post.read_time_minutes}m</span>
                          </div>
                          <EngagementMetrics
                            postId={post.id}
                            initialViews={post.view_count}
                            size="sm"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/${post.slug}`);
                          }}
                          className="text-khwarizmia-teal hover:text-khwarizmia-navy"
                        >
                          Read More
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No articles found
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Be the first to publish an article!'
                }
              </p>
              {isAdmin && (
                <Button
                  onClick={onNewPost}
                  className="mt-4 bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Newsletter Subscription - Conditional Display */}
      {!user ? (
        <NewsletterSubscription
          variant="default"
          title="Stay Updated with KSSI Tech Insights"
          description="Get the latest KSSI Tech articles on solutions industrielles et tertiaires, the platform, and market insights delivered to your inbox. No account required!"
          onSubscribeSuccess={onSubscribeSuccess}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-xl border ${
            isDark
              ? 'bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-700'
              : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
          } shadow-lg text-center`}
        >
          <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${
            isDark ? 'text-green-400' : 'text-green-600'
          }`} />
          <h3 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            You're Already Connected!
          </h3>
          <p className={`mb-4 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            As a registered KSSI Tech user, you'll automatically receive updates about new articles and platform features.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-khwarizmia-navy hover:bg-khwarizmia-navy/90 text-white"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Blog;