import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { blogService } from '@/services/blogService';

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LikeButton({ 
  postId, 
  initialLikeCount = 0, 
  showCount = true,
  size = 'md' 
}: LikeButtonProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    loadLikeStatus();
  }, [postId, user]);

  const loadLikeStatus = async () => {
    setChecking(true);
    
    // Load like count
    const { count } = await blogService.getLikeCount(postId);
    setLikeCount(count);

    // Check if user has liked
    if (user) {
      const { liked: userLiked } = await blogService.hasUserLiked(postId, user.id);
      setLiked(userLiked);
    }
    
    setChecking(false);
  };

  const handleToggleLike = async () => {
    if (!user) {
      alert('Please sign in to like this post');
      return;
    }

    if (loading) return;

    setLoading(true);
    
    // Optimistic update
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    const { data, error } = await blogService.toggleLike(postId);
    
    if (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      alert('Failed to update like: ' + (error?.message || 'Unknown error'));
    }
    
    setLoading(false);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleToggleLike}
        disabled={loading || checking}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          ${buttonSizeClasses[size]}
          rounded-full transition-colors
          ${liked 
            ? 'bg-red-100 dark:bg-red-900/30' 
            : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          }
          ${loading || checking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={user ? (liked ? 'Unlike' : 'Like') : 'Sign in to like'}
      >
        <motion.div
          animate={liked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`
              ${sizeClasses[size]}
              ${liked ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}
              transition-colors
            `}
          />
        </motion.div>
      </motion.button>
      
      {showCount && (
        <span className={`
          ${textSizeClasses[size]}
          font-medium
          ${isDark ? 'text-gray-300' : 'text-gray-700'}
        `}>
          {checking ? '...' : likeCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}

