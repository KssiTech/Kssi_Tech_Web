import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Users, Eye, MessageCircle, Share2,
  Calendar, Target, Award, Globe, BarChart3,
  ArrowUp, ArrowDown, RefreshCw, Download,
  BookOpen, Clock, ThumbsUp, Bookmark
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function BlogAnalytics() {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data for KSSI TECH Blog
  const analyticsData = {
    overview: {
      totalViews: { current: 24567, change: 34.2, trend: 'up' },
      uniqueReaders: { current: 8934, change: 28.7, trend: 'up' },
      avgReadTime: { current: 4.2, change: 12.3, trend: 'up' },
      totalPosts: { current: 47, change: 8.5, trend: 'up' },
      subscribers: { current: 1247, change: 15.8, trend: 'up' },
      engagementRate: { current: 12.4, change: -2.1, trend: 'down' }
    },
    
    // Blog traffic over time
    trafficData: [
      { date: '2024-01-01', views: 1200, readers: 890, readTime: 3.8 },
      { date: '2024-01-08', views: 1450, readers: 1020, readTime: 4.1 },
      { date: '2024-01-15', views: 1680, readers: 1180, readTime: 4.3 },
      { date: '2024-01-22', views: 1890, readers: 1340, readTime: 4.5 },
      { date: '2024-01-29', views: 2100, readers: 1520, readTime: 4.2 }
    ],

    // Top performing posts
    topPosts: [
      { title: 'Advanced Volatility Modeling with KSSI TECH', views: 3420, engagement: 18.5 },
      { title: 'Quantitative Risk Management in 2024', views: 2890, engagement: 16.2 },
      { title: 'Machine Learning in Options Pricing', views: 2650, engagement: 14.8 },
      { title: 'Real-time Market Data Processing', views: 2340, engagement: 13.9 },
      { title: 'Algorithmic Trading Strategies', views: 2120, engagement: 12.7 }
    ],

    // Reader demographics
    readerDemographics: [
      { category: 'Quantitative Analysts', value: 35, color: '#0A1F44' },
      { category: 'Risk Managers', value: 28, color: '#00BFC4' },
      { category: 'Portfolio Managers', value: 20, color: '#3B82F6' },
      { category: 'Researchers', value: 12, color: '#A0FF7A' },
      { category: 'Students', value: 5, color: '#C0C0C0' }
    ]
  };

  const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <Icon className="w-6 h-6 text-khwarizmia-teal" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {format === 'percentage' ? `${value}%` : format === 'time' ? `${value}min` : value.toLocaleString()}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Blog Analytics
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Track your KSSI TECH blog performance and reader engagement
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <MetricCard
          title="Total Views"
          value={analyticsData.overview.totalViews.current}
          change={analyticsData.overview.totalViews.change}
          trend={analyticsData.overview.totalViews.trend}
          icon={Eye}
        />
        <MetricCard
          title="Unique Readers"
          value={analyticsData.overview.uniqueReaders.current}
          change={analyticsData.overview.uniqueReaders.change}
          trend={analyticsData.overview.uniqueReaders.trend}
          icon={Users}
        />
        <MetricCard
          title="Avg Read Time"
          value={analyticsData.overview.avgReadTime.current}
          change={analyticsData.overview.avgReadTime.change}
          trend={analyticsData.overview.avgReadTime.trend}
          icon={Clock}
          format="time"
        />
        <MetricCard
          title="Total Posts"
          value={analyticsData.overview.totalPosts.current}
          change={analyticsData.overview.totalPosts.change}
          trend={analyticsData.overview.totalPosts.trend}
          icon={BookOpen}
        />
        <MetricCard
          title="Subscribers"
          value={analyticsData.overview.subscribers.current}
          change={analyticsData.overview.subscribers.change}
          trend={analyticsData.overview.subscribers.trend}
          icon={Users}
        />
        <MetricCard
          title="Engagement Rate"
          value={analyticsData.overview.engagementRate.current}
          change={analyticsData.overview.engagementRate.change}
          trend={analyticsData.overview.engagementRate.trend}
          icon={ThumbsUp}
          format="percentage"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Blog Traffic Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="date" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="views" stackId="1" stroke="#00BFC4" fill="#00BFC4" fillOpacity={0.6} />
              <Area type="monotone" dataKey="readers" stackId="1" stroke="#0A1F44" fill="#0A1F44" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reader Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reader Demographics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.readerDemographics}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ category, value }) => `${category}: ${value}%`}
              >
                {analyticsData.readerDemographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
      >
        <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Top Performing Posts
        </h3>
        <div className="space-y-4">
          {analyticsData.topPosts.map((post, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-khwarizmia-teal text-white' : 'bg-khwarizmia-navy text-white'}`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post.views.toLocaleString()} views • {post.engagement}% engagement
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
