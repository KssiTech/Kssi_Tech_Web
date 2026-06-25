import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Navigation from '@/components/Navigation'
import {
  Calendar,
  ExternalLink,
  Award,
  Newspaper,
  TrendingUp,
  FileText,
  Globe,
  ArrowRight
} from 'lucide-react'

export default function News() {
  const [activeCategory, setActiveCategory] = useState('all')

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
    { id: 'all', name: 'All News', icon: <Globe className="w-4 h-4" /> },
    { id: 'press-release', name: 'Press Releases', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'research', name: 'Research Papers', icon: <FileText className="w-4 h-4" /> },
    { id: 'industry', name: 'Industry Updates', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'awards', name: 'Awards & Recognition', icon: <Award className="w-4 h-4" /> }
  ]

  const newsItems = [
    {
      id: 1,
      category: 'press-release',
      title: 'KSSI TECH Announces Major Nos clients Bank Deployment',
      excerpt: 'Leading global investment bank successfully implements the KSSI TECH platform across trading desks, achieving a major performance lift in derivatives pricing workflows.',
      date: '2024-08-15',
      image: '/api/placeholder/600/300',
      link: '/blog',
      featured: true
    },
    {
      id: 2,
      category: 'awards',
      title: 'KSSI TECH Wins "Innovation in Solutions Industrielles" Award at QuantMinds 2024',
      excerpt: 'Recognition for KSSI TECH\'s innovations in solutions industrielles et tertiaires and their impact on production trading systems at major institutions.',
      date: '2024-07-22',
      image: '/api/placeholder/600/300',
      link: '/blog',
      featured: false
    },
    {
      id: 3,
      category: 'research',
      title: 'Multi-factor Gaussian Models Calibration: Swaptions and CMS Options',
      excerpt: 'New research paper published in Risk.net introducing the Asymptotic Annuity Method (AAM) with 42x speed improvement and superior accuracy for real-time calibration.',
      date: '2024-06-10',
      image: '/api/placeholder/600/300',
      link: '/resources/risk-net-paper',
      featured: true
    },
    {
      id: 4,
      category: 'industry',
      title: 'Basel III Compliance: KSSI TECH Models Approved for Regulatory Capital',
      excerpt: 'KSSI TECH models receive regulatory approval for use in Basel III capital calculations, marking a significant milestone for the solutions industrielles et tertiaires industry.',
      date: '2024-05-28',
      image: '/api/placeholder/600/300',
      link: '/blog',
      featured: false
    },
    {
      id: 5,
      category: 'press-release',
      title: 'KSSI TECH Expands European Operations with New London Office',
      excerpt: 'Strategic expansion to better serve entreprise industrielles and financial institutions across Europe with KSSI TECH software and solutions industrielles et tertiaires expertise.',
      date: '2024-04-15',
      image: '/api/placeholder/600/300',
      link: '/company/about',
      featured: false
    },
    {
      id: 6,
      category: 'research',
      title: 'KSSI TECH Platform 2.0: Technical Whitepaper Released',
      excerpt: 'Comprehensive technical documentation detailing the next generation of KSSI TECH technology and its applications in complex derivatives portfolios.',
      date: '2024-03-20',
      image: '/api/placeholder/600/300',
      link: '/resources/whitepapers',
      featured: false
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'press-release': return <Newspaper className="w-4 h-4" />
      case 'awards': return <Award className="w-4 h-4" />
      case 'research': return <FileText className="w-4 h-4" />
      case 'industry': return <TrendingUp className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'press-release': return 'Press Release'
      case 'awards': return 'Award'
      case 'research': return 'Research'
      case 'industry': return 'Industry Update'
      default: return 'News'
    }
  }

  const featuredNews = newsItems.filter(item => item.featured)
  const regularNews = newsItems.filter(item => !item.featured)
  const filteredNews = activeCategory === 'all' ? regularNews : regularNews.filter(item => item.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>News & Updates - KSSI TECH | Latest Solutions Industrielles Industry News</title>
        <meta name="description" content="Stay updated with KSSI TECH's latest news, research publications, industry insights, and company developments in solutions industrielles et tertiaires." />
        <meta name="keywords" content="KSSI TECH news, solutions industrielles et tertiaires news, derivatives pricing, entreprise industrielles, research papers, industry updates" />
        <link rel="canonical" href="https://kssi-tech.com/news" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
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
                KSSI TECH <span className="text-khwarizmia-teal">News</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Latest company updates, industry insights, and solutions industrielles et tertiaires news from KSSI TECH.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-khwarizmia-teal text-white shadow-lg'
                      : 'bg-card text-foreground hover:bg-muted border border-border'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Featured News</h2>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="space-y-8"
              >
                {featuredNews.map((item) => (
                  <motion.article
                    key={item.id}
                    variants={fadeInUp}
                    className="bg-gradient-to-r from-khwarizmia-navy to-blue-900 text-white rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="aspect-w-16 aspect-h-9 lg:aspect-none">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="text-khwarizmia-teal">{getCategoryIcon(item.category)}</div>
                          <span className="text-khwarizmia-teal font-semibold text-sm uppercase tracking-wide">
                            {getCategoryName(item.category)}
                          </span>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold mb-4">{item.title}</h3>
                        <p className="text-gray-200 mb-6 leading-relaxed">{item.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          {item.link && item.link !== '#' ? (
                            <motion.a
                              href={item.link.startsWith('http') ? item.link : undefined}
                              onClick={(e) => {
                                if (!item.link.startsWith('http')) {
                                  e.preventDefault();
                                  window.location.href = item.link;
                                }
                              }}
                              target={item.link.startsWith('http') ? '_blank' : '_self'}
                              rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="flex items-center space-x-2 text-khwarizmia-teal hover:text-white transition-colors"
                              whileHover={{ x: 4 }}
                            >
                              <span>Read More</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.a>
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-400 cursor-not-allowed">
                              <span className="text-sm">Coming Soon</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* News Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-8">
                {activeCategory === 'all' ? 'Latest News' : `${categories.find(c => c.id === activeCategory)?.name}`}
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {(activeCategory === 'all' ? regularNews : filteredNews).map((item) => (
                <motion.article
                  key={item.id}
                  variants={fadeInUp}
                  className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-border"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="text-khwarizmia-teal">{getCategoryIcon(item.category)}</div>
                      <span className="text-khwarizmia-teal font-semibold text-xs uppercase tracking-wide">
                        {getCategoryName(item.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{item.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      {item.link && item.link !== '#' ? (
                        <motion.a
                          href={item.link.startsWith('http') ? item.link : undefined}
                          onClick={(e) => {
                            if (!item.link.startsWith('http')) {
                              e.preventDefault();
                              window.location.href = item.link;
                            }
                          }}
                          target={item.link.startsWith('http') ? '_blank' : '_self'}
                          rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center space-x-1 text-khwarizmia-teal hover:text-khwarizmia-gold transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <span className="text-sm font-semibold">Read More</span>
                          <ExternalLink className="w-3 h-3" />
                        </motion.a>
                      ) : (
                        <div className="flex items-center space-x-1 text-muted-foreground cursor-not-allowed">
                          <span className="text-xs">Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
