import { useState, useEffect } from 'react';
import { Eye, MessageCircle, Heart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { blogService } from '@/services/blogService';

interface EngagementMetricsProps {
  postId: string;
  initialViews?: number;
  initialComments?: number;
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export default function EngagementMetrics({
  postId,
  initialViews = 0,
  initialComments = 0,
  initialLikes = 0,
  size = 'sm',
  showLabels = false
}: EngagementMetricsProps) {
  const { isDark } = useTheme();
  const [views, setViews] = useState(initialViews);
  const [comments, setComments] = useState(initialComments);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [postId]);

  const loadMetrics = async () => {
    setLoading(true);
    const metrics = await blogService.getEngagementMetrics(postId);
    if (!metrics.error) {
      setViews(metrics.views);
      setComments(metrics.comments);
      setLikes(metrics.likes);
    }
    setLoading(false);
  };

  const sizeClasses = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-base',
      gap: 'gap-2'
    }
  };

  const currentSize = sizeClasses[size];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`flex items-center ${currentSize.gap} ${currentSize.text} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${currentSize.gap} flex-wrap`}>
      {/* Views */}
      <div className={`flex items-center ${currentSize.gap} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <Eye className={currentSize.icon} />
        <span className={currentSize.text}>
          {formatNumber(views)}
          {showLabels && ` view${views !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Comments */}
      <div className={`flex items-center ${currentSize.gap} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <MessageCircle className={currentSize.icon} />
        <span className={currentSize.text}>
          {formatNumber(comments)}
          {showLabels && ` comment${comments !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Likes */}
      <div className={`flex items-center ${currentSize.gap} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <Heart className={currentSize.icon} />
        <span className={currentSize.text}>
          {formatNumber(likes)}
          {showLabels && ` like${likes !== 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
}

