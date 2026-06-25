import { supabase, BlogPost, BlogCategory, BlogTag, BlogComment, NewsletterSubscriber } from '@/lib/supabase';

export class BlogService {
  // ===== BLOG POSTS =====
  
  async getAllPosts(options?: {
    status?: 'draft' | 'published' | 'archived';
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url),
        blog_categories:category_id(name, slug, color),
        blog_post_tags(blog_tags(name, slug))
      `)
      .order('published_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.category) {
      query = query.eq('blog_categories.slug', options.category);
    }
    
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url),
        blog_categories:category_id(name, slug, color),
        blog_post_tags(blog_tags(name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (data && !error) {
      // Increment view count
      await this.incrementViewCount(data.id);
    }

    return { data, error };
  }

  async createPost(post: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image_url?: string;
    category_id?: string;
    status?: 'draft' | 'published';
    featured?: boolean;
    scheduled_at?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    read_time_minutes?: number;
    tags?: string[];
  }) {
    const { tags, ...postData } = post;

    // Attach current user as author if not provided (required by RLS)
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user && !(postData as any).author_id) {
        (postData as any).author_id = auth.user.id;
      }
    } catch (_) {
      // ignore; insert will fail with RLS if no author_id
    }

    // Clean up empty string values - convert to null for UUID fields
    if ((postData as any).category_id === '') {
      (postData as any).category_id = null;
    }
    if ((postData as any).featured_image_url === '') {
      (postData as any).featured_image_url = null;
    }
    if ((postData as any).scheduled_at === '') {
      (postData as any).scheduled_at = null;
    }
    if ((postData as any).meta_title === '') {
      (postData as any).meta_title = null;
    }
    if ((postData as any).meta_description === '') {
      (postData as any).meta_description = null;
    }
    if ((postData as any).meta_keywords === '') {
      (postData as any).meta_keywords = null;
    }

    // Defaults derived from content
    if (!postData.read_time_minutes && postData.content) {
      (postData as any).read_time_minutes = this.calculateReadTime(postData.content);
    }
    if (!postData.excerpt && postData.content) {
      (postData as any).excerpt = this.extractExcerpt(postData.content);
    }

    // Set published_at if status is published
    if (postData.status === 'published' && !postData.scheduled_at) {
      (postData as any).published_at = new Date().toISOString();
    }

    console.log('Creating blog post with data:', postData);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Blog post creation error:', error);
    }

    if (data && tags && tags.length > 0) {
      await this.addTagsToPost(data.id, tags);
    }

    return { data, error };
  }

  async updatePost(id: string, updates: Partial<BlogPost> & { tags?: string[] }) {
    // Extract tags from updates (they need to be handled separately)
    const { tags, ...postUpdates } = updates as any;

    // Set published_at if status is being changed to published
    if (postUpdates.status === 'published' && !postUpdates.published_at) {
      postUpdates.published_at = new Date().toISOString();
    }

    // Clean up empty string values - convert to null for UUID fields
    if (postUpdates.category_id === '') {
      postUpdates.category_id = null;
    }
    if (postUpdates.featured_image_url === '') {
      postUpdates.featured_image_url = null;
    }
    if (postUpdates.scheduled_at === '') {
      postUpdates.scheduled_at = null;
    }
    if (postUpdates.meta_title === '') {
      postUpdates.meta_title = null;
    }
    if (postUpdates.meta_description === '') {
      postUpdates.meta_description = null;
    }
    if (postUpdates.meta_keywords === '') {
      postUpdates.meta_keywords = null;
    }

    // Update derived fields if content changed
    if (postUpdates.content) {
      if (!postUpdates.read_time_minutes) {
        postUpdates.read_time_minutes = this.calculateReadTime(postUpdates.content);
      }
      if (!postUpdates.excerpt) {
        postUpdates.excerpt = this.extractExcerpt(postUpdates.content);
      }
    }

    console.log('Updating blog post with data:', postUpdates);

    const { data, error } = await supabase
      .from('blog_posts')
      .update(postUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Blog post update error:', error);
      return { data, error };
    }

    // Handle tags update if provided
    if (data && tags !== undefined) {
      // Remove existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', id);

      // Add new tags
      if (tags.length > 0) {
        await this.addTagsToPost(id, tags);
      }
    }

    return { data, error };
  }

  async deletePost(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    return { error };
  }

  async incrementViewCount(postId: string) {
    const { data, error } = await supabase.rpc('increment_view_count', { post_id: postId });
    return { data, error };
  }

  // ===== CATEGORIES =====
  
  async getAllCategories() {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    return { data, error };
  }

  async createCategory(category: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
  }) {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(category)
      .select()
      .single();

    return { data, error };
  }

  // ===== TAGS =====
  
  async getAllTags() {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');

    return { data, error };
  }

  async createTag(tag: { name: string; slug: string }) {
    const { data, error } = await supabase
      .from('blog_tags')
      .insert(tag)
      .select()
      .single();

    return { data, error };
  }

  async addTagsToPost(postId: string, tagSlugs: string[]) {
    // First, get tag IDs from slugs
    const { data: tags } = await supabase
      .from('blog_tags')
      .select('id, slug')
      .in('slug', tagSlugs);

    if (tags) {
      const postTags = tags.map(tag => ({
        post_id: postId,
        tag_id: tag.id
      }));

      const { error } = await supabase
        .from('blog_post_tags')
        .insert(postTags);

      return { error };
    }

    return { error: 'Tags not found' };
  }

  // ===== COMMENTS =====
  
  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    return { data, error };
  }

  async createComment(comment: {
    post_id: string;
    author_name: string;
    author_email: string;
    content: string;
    parent_id?: string;
  }) {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert(comment)
      .select()
      .single();

    return { data, error };
  }

  async moderateComment(commentId: string, status: 'approved' | 'rejected' | 'spam') {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  }

  // ===== NEWSLETTER =====
  
  async subscribeToNewsletter(email: string, name?: string) {
    try {
      // Call the database function instead of direct INSERT
      // This function checks if email belongs to a registered user
      const { data, error } = await supabase
        .rpc('subscribe_to_newsletter', {
          p_email: email,
          p_name: name || null
        });

      if (error) {
        return { data: null, error };
      }

      // Parse the JSON response from the function
      const result = data as {
        success: boolean;
        error_code?: string;
        message: string;
      };

      if (!result.success) {
        // Return error with specific code
        return {
          data: null,
          error: {
            message: result.message,
            code: result.error_code || 'SUBSCRIPTION_FAILED'
          } as any
        };
      }

      // Success
      return { data: result, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to subscribe',
          code: 'UNKNOWN_ERROR'
        } as any
      };
    }
  }

  async unsubscribeFromNewsletter(email: string) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    return { data, error };
  }

  async getNewsletterSubscriberCount() {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return { count: count || 0, error };
  }

  // ===== ANALYTICS =====
  
  async trackPageView(postId: string, metadata?: {
    visitor_ip?: string;
    user_agent?: string;
    referrer?: string;
    country?: string;
    city?: string;
    read_duration?: number;
  }) {
    const { error } = await supabase
      .from('blog_analytics')
      .insert({
        post_id: postId,
        ...metadata
      });

    return { error };
  }

  async getPostAnalytics(postId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('blog_analytics')
      .select('*')
      .eq('post_id', postId)
      .gte('created_at', startDate.toISOString());

    return { data, error };
  }

  // ===== SEARCH =====
  
  async searchPosts(query: string, options?: {
    category?: string;
    tags?: string[];
    limit?: number;
  }) {
    let supabaseQuery = supabase
      .from('blog_posts')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url),
        blog_categories:category_id(name, slug, color),
        blog_post_tags(blog_tags(name, slug))
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false });

    if (options?.category) {
      supabaseQuery = supabaseQuery.eq('blog_categories.slug', options.category);
    }

    if (options?.limit) {
      supabaseQuery = supabaseQuery.limit(options.limit);
    }

    const { data, error } = await supabaseQuery;
    return { data, error };
  }

  // ===== UTILITY FUNCTIONS =====
  
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  extractExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength).trim() + '...'
      : plainText;
  }

  // ===== ENGAGEMENT METRICS =====

  async getViewCount(postId: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('view_count')
      .eq('id', postId)
      .single();
    return { data: data?.view_count || 0, error };
  }

  // Comments
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getCommentCount(postId: string) {
    const { count, error } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    return { count: count || 0, error };
  }

  async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Get user profile to populate author_name and author_email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        author_name: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
        author_email: profile?.email || user.email || '',
        content: content,
        status: 'approved'  // Auto-approve comments from authenticated users
      })
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .single();
    return { data, error };
  }

  async updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .single();
    return { data, error };
  }

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);
    return { error };
  }

  // Likes
  async getLikeCount(postId: string) {
    const { count, error } = await supabase
      .from('blog_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    return { count: count || 0, error };
  }

  async hasUserLiked(postId: string, userId: string) {
    const { data, error } = await supabase
      .from('blog_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return { liked: !!data, error: error?.code === 'PGRST116' ? null : error };
  }

  async toggleLike(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Check if user has already liked
    const { liked } = await this.hasUserLiked(postId, user.id);

    if (liked) {
      // Unlike: delete the like
      const { error } = await supabase
        .from('blog_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      return { data: { liked: false }, error };
    } else {
      // Like: insert a new like
      const { data, error } = await supabase
        .from('blog_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })
        .select()
        .single();
      return { data: { liked: true }, error };
    }
  }

  // Get all engagement metrics for a post
  async getEngagementMetrics(postId: string) {
    const [viewCount, commentCount, likeCount] = await Promise.all([
      this.getViewCount(postId),
      this.getCommentCount(postId),
      this.getLikeCount(postId)
    ]);

    return {
      views: viewCount.data,
      comments: commentCount.count,
      likes: likeCount.count,
      error: viewCount.error || commentCount.error || likeCount.error
    };
  }
}

export const blogService = new BlogService();
