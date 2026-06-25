import { createClient } from '@supabase/supabase-js'

// Environment-aware configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Get the application URL from environment or detect it
const getAppUrl = (): string => {
  // First, try to get from environment variable
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL
  }

  // Fallback to window.location.origin if available (browser environment)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Default fallback for SSR or build time
  return 'http://localhost:5173'
}

const appUrl = getAppUrl()

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use environment-aware redirect URL
    redirectTo: `${appUrl}/contact`,
    // Auto-refresh session
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

// Warn if env variables are missing (helps diagnose infinite-loading issues)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[KSSI TECH] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using placeholder values.');
}

// Log the current environment configuration (only in development)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[KSSI TECH] Environment:', {
    supabaseUrl,
    appUrl,
    redirectTo: `${appUrl}/contact`,
    mode: import.meta.env.MODE
  });
}


// Database types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
}

// Blog-related interfaces
export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  author_id: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  published_at: string | null
  scheduled_at: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  read_time_minutes: number
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  status: 'active' | 'unsubscribed' | 'bounced'
  subscribed_at: string
  unsubscribed_at: string | null
  preferences: any
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
      blog_categories: {
        Row: BlogCategory
        Insert: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'>>
      }
      blog_tags: {
        Row: BlogTag
        Insert: Omit<BlogTag, 'id' | 'created_at'>
        Update: Partial<Omit<BlogTag, 'id' | 'created_at'>>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>
        Update: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>
      }
      blog_comments: {
        Row: BlogComment
        Insert: Omit<BlogComment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlogComment, 'id' | 'created_at' | 'updated_at'>>
      }
      newsletter_subscribers: {
        Row: NewsletterSubscriber
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>
        Update: Partial<Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>>
      }
    }
  }
}
