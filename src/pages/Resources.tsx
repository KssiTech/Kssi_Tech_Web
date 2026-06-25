import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Navigation from '@/components/Navigation'
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  FileText, 
  Code, 
  Database, 
  Cpu, 
  GraduationCap,
  Search,
  Filter,
  ArrowRight,
  Star,
  Calendar,
  Users
} from 'lucide-react'

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const categories = [
    { id: 'all', name: 'All Resources', icon: <Database className="w-4 h-4" /> },
    { id: 'software', name: 'Software & Tools', icon: <Code className="w-4 h-4" /> }
  ]

  const resources = [
    {
      id: 1,
      category: 'software',
      title: 'GitHub Repository - Hisab',
      description: 'Access the KSSI TECH Hisab repository on GitHub. Explore the source code, contribute to the project, and stay updated with the latest development and releases.',
      type: 'GitHub Repository',
      format: 'Web',
      size: 'Online',
      date: '2024-01-01',
      downloads: 0,
      rating: 5.0,
      href: 'https://github.com/kssi-tech/Hisab',
      external: true,
      featured: true,
      tags: ['GitHub', 'Repository', 'Open Source', 'Development']
    },
    {
      id: 2,
      category: 'software',
      title: 'Installation Guide',
      description: 'Complete installation and setup guide for KSSI TECH. Includes requirements, step-by-step installation instructions, and environment configuration for both Node.js frontend and Python/C++ backend services.',
      type: 'Installation Guide',
      format: 'HTML',
      size: 'Online',
      date: '2024-04-15',
      downloads: 2451,
      rating: 4.9,
      href: '/resources/installation-guide',
      external: false,
      featured: true,
      tags: ['Installation', 'Setup', 'Documentation', 'Getting Started']
    },
    {
      id: 3,
      category: 'software',
      title: 'KSSI TECH Development Tools & Libraries',
      description: 'Essential development tools and libraries for building with KSSI TECH. Includes React components, Tailwind CSS utilities, TypeScript definitions, and integration examples for the KSSI TECH framework.',
      type: 'Development Tools',
      format: 'ZIP',
      size: '15.2 MB',
      date: '2024-04-10',
      downloads: 834,
      rating: 4.8,
      href: '/downloads/dev-tools',
      external: false,
      featured: false,
      tags: ['Development', 'Tools', 'Libraries', 'Integration']
    }
  ]

  const getResourceIcon = (category: string) => {
    switch (category) {
      case 'research': return <FileText className="w-5 h-5" />
      case 'software': return <Code className="w-5 h-5" />
      case 'education': return <GraduationCap className="w-5 h-5" />
      default: return <Database className="w-5 h-5" />
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'pypi': return <Code className="w-4 h-4" />
      case 'html': return <BookOpen className="w-4 h-4" />
      case 'zip': return <Download className="w-4 h-4" />
      case 'interactive': return <Cpu className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredResources = resources.filter(resource => resource.featured)

  return (
    <>
      <Helmet>
        <title>Software & Tools - KSSI TECH | Packages, Libraries & Installation Guide</title>
        <meta name="description" content="Download KSSI TECH packages, libraries, and development tools. Access our GitHub repository, installation guides, and everything needed to get started with the KSSI TECH framework." />
        <meta name="keywords" content="KSSI TECH downloads, software tools, libraries, development tools, installation guide, GitHub repository, packages" />
        <link rel="canonical" href="https://kssi-tech.com/resources" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white py-20 mt-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                KSSI TECH <span className="text-khwarizmia-teal">Software & Tools</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Download KSSI TECH packages, libraries, and development tools. Access our GitHub repository,
                installation guides, and comprehensive resources for getting started with the KSSI TECH framework.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-6 items-center justify-between"
            >
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-khwarizmia-teal focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-khwarizmia-teal text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.icon}
                    <span className="text-sm">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold text-khwarizmia-navy mb-8 flex items-center">
                  <Star className="w-8 h-8 text-khwarizmia-teal mr-3" />
                  Featured Resources
                </h2>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {featuredResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-khwarizmia-navy to-blue-900 text-white rounded-xl p-8 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-khwarizmia-teal/20 p-3 rounded-lg">
                        {getResourceIcon(resource.category)}
                      </div>
                      <span className="bg-khwarizmia-teal px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{resource.title}</h3>
                    <p className="text-gray-200 mb-4 line-clamp-3">{resource.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                    </div>
                    <motion.a
                      href={resource.href}
                      target={resource.external ? '_blank' : '_self'}
                      rel={resource.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between w-full bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Access Resource</span>
                      {resource.external ? <ExternalLink className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </motion.a>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* All Resources Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-khwarizmia-navy mb-4">
                {activeCategory === 'all' ? 'All Resources' : `${categories.find(c => c.id === activeCategory)?.name}`}
              </h2>
              <p className="text-gray-600">
                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={fadeInUp}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-khwarizmia-teal/10 p-2 rounded-lg">
                          {getResourceIcon(resource.category)}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-khwarizmia-teal uppercase tracking-wide">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                      {resource.featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-khwarizmia-navy mb-3 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {resource.description}
                    </p>

                    {/* Resource Details */}
                    <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {getFormatIcon(resource.format)}
                          <span>{resource.format}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="w-3 h-3" />
                          <span>{resource.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(resource.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{resource.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <motion.a
                      href={resource.href}
                      target={resource.external ? '_blank' : '_self'}
                      rel={resource.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-center w-full bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="mr-2">Access Resource</span>
                      {resource.external ? <ExternalLink className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* No Results */}
            {filteredResources.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or category filter to find what you're looking for.
                </p>
                <motion.button
                  onClick={() => {
                    setSearchTerm('')
                    setActiveCategory('all')
                  }}
                  className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-khwarizmia-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Start building with KSSI TECH today. Follow our installation guide, explore our GitHub repository,
                and access the development tools you need for solutions techniques KSSI TECH implementation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/resources/installation-guide"
                  className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Installation Guide
                </motion.a>
                <motion.a
                  href="https://github.com/kssi-tech/Hisab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white hover:bg-white hover:text-khwarizmia-navy text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Visit GitHub Repository
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
