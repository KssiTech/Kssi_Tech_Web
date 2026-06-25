import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; message?: string }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithGithub: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
  uploadAvatar: (file: File) => Promise<{ data: { publicUrl: string } | null; error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Do not block UI while profile loads
        setLoading(false)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Unblock UI immediately; load profile in background
        setLoading(false)
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
          } else if (newProfile) {
            setProfile(newProfile)
          }
        }
      } else if (error) {
        console.error('Error fetching profile:', error)
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {
        error: null,
        message: 'Registration initiated. Please check your email to complete your registration.'
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { error: error?.message || 'An unexpected error occurred during sign-up.' }
    }
  }

  const signIn = async (email: string, password: string) => {
    // Demo credentials — bypass Supabase for local testing
    const MOCK_USERS: Record<string, { id: string; name: string; role: string }> = {
      'demo@kssitech.ma':       { id: 'demo-001', name: 'Hamza Benali',      role: 'secretaire' },
      'secretaire@kssitech.ma': { id: 'demo-002', name: 'Aicha Benmoussa',   role: 'secretaire' },
      'directeur@kssitech.ma':  { id: 'demo-003', name: 'Mohammed El Fassi', role: 'directeur'  },
      'client@kssitech.ma':     { id: 'demo-004', name: 'Ahmed TAZI',        role: 'client'     },
    }
    const mock = MOCK_USERS[email]
    if (mock && password === 'kssi2024') {
      const mockUser = {
        id: mock.id,
        aud: 'authenticated',
        email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: mock.name, role: mock.role },
        role: 'authenticated',
      } as unknown as User
      setUser(mockUser)
      setSession(null)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/contact`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error?.message || 'Failed to sign in with Google' }
    }
  }

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/contact`,
        }
      })
      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error?.message || 'Failed to sign in with GitHub' }
    }
  }

  const signOut = async () => {
    if (user?.id?.startsWith('demo-')) {
      setUser(null)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return { data: null, error: 'No user logged in' }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        return { data: null, error: uploadError.message }
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { data: { publicUrl: data.publicUrl }, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to upload avatar' }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    updateProfile,
    uploadAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
