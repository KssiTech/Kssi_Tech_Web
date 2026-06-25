import { useEffect, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path as the redirect destination
      const redirectTo = encodeURIComponent(location.pathname + location.search)
      navigate(`/login?redirect=${redirectTo}`, { replace: true })
    }
  }, [user, loading, navigate, location])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0A1F44] mx-auto mb-4"></div>
          <div className="text-[#0A1F44] font-medium">
            <h2 className="text-xl font-bold mb-2">KSSI TECH</h2>
            <div className="w-12 h-0.5 bg-[#00BFC4] mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying access...</p>
          </div>
        </div>
      </div>
    )
  }

  // If user is not authenticated, the useEffect will handle the redirect
  // Return null to prevent flash of content
  if (!user) {
    return null
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
