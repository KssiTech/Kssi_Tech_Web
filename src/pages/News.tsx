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
    { id: 'all',         name: 'Toutes les actualités', icon: <Globe className="w-4 h-4" /> },
    { id: 'project',     name: 'Projets réalisés',      icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'award',       name: 'Certifications',        icon: <Award className="w-4 h-4" /> },
    { id: 'partnership', name: 'Partenariats',          icon: <Newspaper className="w-4 h-4" /> },
    { id: 'event',       name: 'Événements',            icon: <FileText className="w-4 h-4" /> },
  ]

  const newsItems = [
    {
      id: 1,
      category: 'award',
      title: 'KSSI TECH renouvelle son agrément ONEE pour les installations BT/MT',
      excerpt: 'KSSI TECH confirme sa qualification auprès de l\'Office National de l\'Électricité et de l\'Eau Potable (ONEE) pour la réalisation d\'installations électriques basse et moyenne tension, renforçant sa position comme acteur de référence dans la région de Safi.',
      date: '2025-03-10',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
      link: '/secteurs/electricite',
      featured: true
    },
    {
      id: 2,
      category: 'project',
      title: 'Déploiement réseau fibre optique pour Maroc Telecom — Safi',
      excerpt: 'KSSI TECH achève avec succès le déploiement d\'une infrastructure réseau fibre optique sur plusieurs sites Maroc Telecom dans la wilaya de Safi, garantissant une connectivité haut débit pour les entreprises et institutions de la région.',
      date: '2025-01-22',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
      link: '/secteurs/reseaux',
      featured: true
    },
    {
      id: 3,
      category: 'project',
      title: 'Installation d\'un système de vidéosurveillance ENSA Safi',
      excerpt: 'KSSI TECH finalise l\'installation d\'un système CCTV complet au sein de l\'École Nationale des Sciences Appliquées de Safi, couvrant l\'ensemble des bâtiments et espaces extérieurs avec des caméras haute définition et un centre de supervision centralisé.',
      date: '2024-12-05',
      image: 'https://images.unsplash.com/photo-1580983559367-0dc2f8934365?w=600&q=80',
      link: '/secteurs/surveillance',
      featured: false
    },
    {
      id: 4,
      category: 'project',
      title: 'Centrale photovoltaïque 50 kWc pour un industriel de Safi',
      excerpt: 'Réalisation d\'une installation solaire de 50 kilowatts-crête pour un client industriel dans la zone industrielle de Safi, permettant une réduction significative de la facture énergétique et une contribution aux objectifs de transition énergétique du Maroc.',
      date: '2024-10-14',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
      link: '/secteurs/energie',
      featured: false
    },
    {
      id: 5,
      category: 'event',
      title: 'KSSI TECH au Salon des Énergies Renouvelables — Casablanca 2025',
      excerpt: 'KSSI TECH participe au Salon International des Énergies Renouvelables et de l\'Efficacité Énergétique à Casablanca, présentant ses solutions photovoltaïques et ses réalisations dans le secteur de l\'énergie propre au Maroc.',
      date: '2025-04-20',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
      link: '/contact-support',
      featured: false
    },
    {
      id: 6,
      category: 'partnership',
      title: 'Contrat de maintenance industrielle avec Lafarge Placo Maroc',
      excerpt: 'KSSI TECH signe un contrat de maintenance préventive et corrective pluriannuel avec Lafarge Placo Maroc, couvrant l\'ensemble des équipements électriques et automatisés de leur site de production dans la région de Safi.',
      date: '2024-09-01',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
      link: '/secteurs/maintenance',
      featured: false
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project':     return <TrendingUp className="w-4 h-4" />
      case 'award':       return <Award className="w-4 h-4" />
      case 'partnership': return <Newspaper className="w-4 h-4" />
      case 'event':       return <FileText className="w-4 h-4" />
      default:            return <Globe className="w-4 h-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'project':     return 'Projet réalisé'
      case 'award':       return 'Certification'
      case 'partnership': return 'Partenariat'
      case 'event':       return 'Événement'
      default:            return 'Actualité'
    }
  }

  const featuredNews = newsItems.filter(item => item.featured)
  const regularNews = newsItems.filter(item => !item.featured)
  const filteredNews = activeCategory === 'all' ? regularNews : regularNews.filter(item => item.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Actualités — KSSI TECH | Projets, Certifications & Événements</title>
        <meta name="description" content="Suivez les dernières actualités de KSSI TECH : projets réalisés, certifications ONEE, partenariats et événements dans le secteur industriel à Safi, Maroc." />
        <meta name="keywords" content="KSSI TECH actualités, projets électricité Safi, certification ONEE, énergie renouvelable Maroc, vidéosurveillance, maintenance industrielle" />
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
                Nos <span className="text-khwarizmia-teal">Actualités</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Projets réalisés, certifications, partenariats et événements — suivez l'actualité de KSSI TECH à Safi et au Maroc.
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
                <h2 className="text-3xl font-bold text-foreground mb-8">À la une</h2>
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
                              <span>Lire la suite</span>
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
                {activeCategory === 'all' ? 'Dernières actualités' : categories.find(c => c.id === activeCategory)?.name}
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
                          <span className="text-sm font-semibold">Lire la suite</span>
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
