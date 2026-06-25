import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Calendar, Clock, User, Eye, Tag,
  Share2, Twitter, Linkedin, Mail, Copy, Check,
  Edit3, Trash2, BarChart3, Search,
  Home, BookOpen, MessageCircle, Bell, CheckCircle
} from 'lucide-react';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/lib/supabase';

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin' ||
    (user?.email && [
      'bellaj.khalid@gmail.com',
      'kssitech@gmail.com',
      'kssitech@gmail.com',
      'kssitech@gmail.com'
    ].includes(user.email.toLowerCase()));

  useEffect(() => {
    if (slug) {
      loadPost();
      loadRecentPosts();
    }
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await blogService.getPostBySlug(slug);
      if (error || !data) {
        setError('Post not found');
      } else {
        setPost(data);
        // Increment view count
        await blogService.incrementViewCount(data.id);
        // Load related posts from same category
        if (data.category_id) {
          loadRelatedPosts(data.category_id, data.id);
        }
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async (categoryId: string, currentPostId: string) => {
    try {
      const { data } = await blogService.getAllPosts({
        status: 'published',
        category: categoryId,
        limit: 4
      });
      if (data) {
        // Filter out current post and limit to 3
        const filtered = data.filter(p => p.id !== currentPostId).slice(0, 3);
        setRelatedPosts(filtered);
      }
    } catch (err) {
      console.error('Error loading related posts:', err);
    }
  };

  const loadRecentPosts = async () => {
    try {
      const { data } = await blogService.getAllPosts({
        status: 'published',
        limit: 5
      });
      if (data) {
        setRecentPosts(data);
      }
    } catch (err) {
      console.error('Error loading recent posts:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || 'KSSI TECH Blog Post';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDelete = async () => {
    if (!post || !isAdmin) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogService.deletePost(post.id);
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const renderContent = (content: string) => {
    // Enhanced HTML/Markdown rendering
    return content
      .split('\n')
      .map((paragraph, index) => {
        // Handle HTML tags
        if (paragraph.trim().startsWith('<h2>')) {
          return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} className={`text-3xl font-bold mb-6 mt-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />;
        }
        if (paragraph.trim().startsWith('<h3>')) {
          return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} className={`text-2xl font-bold mb-4 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />;
        }
        if (paragraph.trim().startsWith('<ul>') || paragraph.trim().startsWith('<ol>')) {
          return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} className={`mb-4 ml-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />;
        }
        if (paragraph.trim().startsWith('<p>')) {
          return <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} className={`mb-4 leading-relaxed text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />;
        }

        // Handle Markdown-style headers
        if (paragraph.startsWith('# ')) {
          return <h1 key={index} className={`text-4xl font-bold mb-6 mt-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>{paragraph.slice(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={index} className={`text-3xl font-bold mb-6 mt-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>{paragraph.slice(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className={`text-2xl font-bold mb-4 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{paragraph.slice(4)}</h3>;
        }
        if (paragraph.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className={`mb-4 leading-relaxed text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{paragraph}</p>;
      });
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <Navigation />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className={`h-8 rounded w-1/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-12 rounded w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-6 rounded w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-64 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className="space-y-4">
                  <div className={`h-4 rounded w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded w-4/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 error state
  if (error || !post) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <Helmet>
          <title>Article Not Found | KSSI TECH Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <Navigation />

        {/* Hero section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* 404 Icon */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm">
                  <BookOpen className="w-12 h-12 text-khwarizmia-teal" />
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Article Not Found
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                The article you're looking for doesn't exist or has been removed.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/blog')}
                  className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Posts Suggestions - White Background Section with Glass Cards */}
        {recentPosts.length > 0 && (
          <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
                    Browse Our Latest Articles
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recentPosts.slice(0, 3).map((recentPost, index) => (
                      <motion.div
                        key={recentPost.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${
                          isDark
                            ? 'bg-gray-700/80 backdrop-blur-lg border-white/10 hover:border-khwarizmia-teal shadow-lg'
                            : 'bg-gray-50/80 backdrop-blur-lg border-white/20 hover:border-khwarizmia-teal shadow-[0_8px_32px_0_rgba(10,31,68,0.1)] hover:shadow-[0_12px_48px_0_rgba(10,31,68,0.15)]'
                        }`}
                        onClick={() => navigate(`/blog/${recentPost.slug}`)}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                            style={{ backgroundColor: recentPost.blog_categories?.color || '#0A1F44' }}
                          >
                            {recentPost.blog_categories?.name}
                          </span>
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
                          {recentPost.title}
                        </h3>
                        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {recentPost.excerpt}
                        </p>
                        <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recentPost.read_time_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {recentPost.view_count}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Helmet>
        <title>{post.meta_title || post.title} | KSSI TECH Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || blogService.extractExcerpt(post.content)} />
        <meta name="keywords" content={post.meta_keywords || 'solutions industrielles et tertiaires, KSSI TECH, market models, risk'} />
        <link rel="canonical" href={`https://kssi-tech.com/blog/${post.slug}`} />

        {/* Open Graph tags */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || blogService.extractExcerpt(post.content)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://kssi-tech.com/blog/${post.slug}`} />
        <meta property="og:site_name" content="KSSI TECH" />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
        {post.profiles?.full_name && <meta property="article:author" content={post.profiles.full_name} />}

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || blogService.extractExcerpt(post.content)} />
        {post.featured_image_url && <meta name="twitter:image" content={post.featured_image_url} />}
      </Helmet>

      <Navigation />

      {/* Admin Floating Action Button */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-8 right-8 z-50 flex flex-col gap-3"
        >
          <Button
            onClick={() => navigate(`/blog/edit/${post.slug}`)}
            className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white rounded-full w-14 h-14 shadow-lg"
            title="Edit Post"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="rounded-full w-14 h-14 shadow-lg"
            title="Delete Post"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Hero section with gradient */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: post.blog_categories?.color || '#00BFC4' }}
                >
                  {post.blog_categories?.name || 'Uncategorized'}
                </span>
                {post.featured && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-khwarizmia-teal text-white">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl mb-8 leading-relaxed text-blue-100">
                  {post.excerpt}
                </p>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/20">
                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.full_name || 'Author'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-khwarizmia-teal"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-khwarizmia-teal flex items-center justify-center text-white font-semibold">
                    {(post.profiles?.full_name || 'X')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white">
                    {post.profiles?.full_name || 'KSSI TECH Team'}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.read_time_minutes} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-100">
                  Share:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="text-white hover:text-khwarizmia-teal hover:bg-white/10"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="text-white hover:text-khwarizmia-teal hover:bg-white/10"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('email')}
                  className="text-white hover:text-khwarizmia-teal hover:bg-white/10"
                  title="Share via Email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="text-white hover:text-khwarizmia-teal hover:bg-white/10"
                  title={copied ? 'Copied!' : 'Copy Link'}
                >
                  {copied ? <Check className="w-4 h-4 text-khwarizmia-teal" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </motion.header>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {post.featured_image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12 -mt-24 relative z-10"
              >
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-64 lg:h-96 object-cover rounded-xl shadow-2xl"
                />
              </motion.div>
            )}

            {/* Article Content - Crystal/Glass Card Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mb-12 p-8 lg:p-12 rounded-2xl border shadow-xl ${
                isDark
                  ? 'bg-gray-800/80 backdrop-blur-lg border-white/10'
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-[0_8px_32px_0_rgba(10,31,68,0.1)]'
              }`}
              style={{
                maxWidth: '800px',
                margin: '0 auto 3rem',
                lineHeight: '1.8',
                fontSize: '1.125rem'
              }}
            >
              <div className={`prose prose-lg max-w-none ${
                isDark
                  ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300'
                  : 'prose-headings:text-khwarizmia-navy prose-p:text-gray-700 prose-strong:text-khwarizmia-navy prose-li:text-gray-700'
              }`}>
                {renderContent(post.content)}
              </div>
            </motion.div>

            {/* Tags & Engagement - Crystal/Glass Card Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mb-12 p-6 rounded-2xl border ${
                isDark
                  ? 'bg-gray-800/80 backdrop-blur-lg border-white/10'
                  : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-[0_8px_32px_0_rgba(10,31,68,0.1)]'
              }`}
              style={{ maxWidth: '800px', margin: '0 auto 3rem' }}
            >
              {post.blog_post_tags && post.blog_post_tags.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap mb-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <Tag className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-khwarizmia-navy'}`} />
                  {post.blog_post_tags.map((tagRelation: any, index: number) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 backdrop-blur-sm'
                          : 'bg-gray-100/80 text-khwarizmia-navy hover:bg-khwarizmia-teal hover:text-white backdrop-blur-sm'
                      }`}
                    >
                      #{tagRelation.blog_tags?.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Like Button */}
              <div className="flex items-center gap-4">
                <LikeButton
                  postId={post.id}
                  initialLikeCount={post.like_count || 0}
                  size="lg"
                  showCount={true}
                />
              </div>
            </motion.div>

            {/* Comment Section */}
            <CommentSection postId={post.id} />
          </div>
        </div>
      </section>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
                  Related Articles
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        isDark
                          ? 'bg-gray-800/80 backdrop-blur-lg border-white/10 hover:border-khwarizmia-teal shadow-lg'
                          : 'bg-white/80 backdrop-blur-lg border-white/20 hover:border-khwarizmia-teal shadow-[0_8px_32px_0_rgba(10,31,68,0.1)] hover:shadow-[0_12px_48px_0_rgba(10,31,68,0.15)]'
                      }`}
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                          style={{ backgroundColor: relatedPost.blog_categories?.color || '#0A1F44' }}
                        >
                          {relatedPost.blog_categories?.name}
                        </span>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
                        {relatedPost.title}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {relatedPost.excerpt}
                      </p>
                      <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedPost.read_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {relatedPost.view_count}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {!user ? (
              <NewsletterSubscription
                variant="inline"
                title="Stay Updated with KSSI TECH Insights"
                description="Get the latest articles on solutions industrielles et tertiaires, KSSI TECH, and market analysis delivered to your inbox. No account required!"
                className="text-center"
              />
            ) : (
              <div className="p-6 rounded-lg bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-700 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <p className="text-white text-lg">
                  You're already subscribed as a registered user!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to Blog CTA - White Background Section */}
      <section className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={() => navigate('/blog')}
              size="lg"
              className="group bg-khwarizmia-navy hover:bg-khwarizmia-teal text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Continue Reading More Articles
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BlogPostDetail;
