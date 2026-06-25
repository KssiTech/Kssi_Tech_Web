import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileText,
  ExternalLink,
  Mail,
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

interface DownloadPageProps {
  title: string;
  description: string;
  icon: string;
  category: string;
  comingSoon?: boolean;
  downloads?: Array<{
    name: string;
    description: string;
    size?: string;
    format: string;
    url?: string;
    version?: string;
  }>;
  relatedLinks?: Array<{
    title: string;
    href: string;
    description: string;
    external?: boolean;
  }>;
}

const DownloadPage = ({
  title,
  description,
  icon,
  category,
  comingSoon = true,
  downloads = [],
  relatedLinks = []
}: DownloadPageProps) => {
  const navigate = useNavigate();

  // Page animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} - KSSI TECH Resources</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="KSSI TECH, solutions industrielles et tertiaires, research, publications, whitepapers, case studies, Hisab" />
        <link rel="canonical" href={`https://kssi-tech.com/resources/${title.toLowerCase().replace(/\s+/g, '-')}`} />
      </Helmet>

      <Navigation />

      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <a href="/" className="text-khwarizmia-navy hover:text-khwarizmia-teal transition-colors">Home</a>
              <span className="text-gray-400">/</span>
              <a href="/resources" className="text-khwarizmia-navy hover:text-khwarizmia-teal transition-colors">Resources</a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-blue-900 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <span className="text-6xl">{icon}</span>
              </div>
              <div className="bg-khwarizmia-teal/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block mb-4">
                <span className="text-sm font-medium">{category}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {title}
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                {description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

              {comingSoon ? (
                /* Coming Soon Content */
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <Card className="bg-white border border-gray-200 shadow-lg">
                    <CardContent className="p-12">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-khwarizmia-teal/10 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-khwarizmia-teal" />
                      </div>

                      <h2 className="text-3xl font-bold text-khwarizmia-navy mb-4">
                        Coming Soon
                      </h2>

                      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        We're working hard to bring you this resource. It will be available soon as part of the KSSI TECH platform and documentation.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                          className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                          onClick={() => window.open('mailto:info@kssi-tech.com?subject=Request for ' + title, '_blank')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Request Early Access
                        </motion.button>

                        <motion.button
                          className="bg-white border border-khwarizmia-navy text-khwarizmia-navy hover:bg-khwarizmia-navy hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                          onClick={() => navigate('/blog')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Read Our Blog
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* Available Downloads Content */
                <div className="space-y-8">
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                  >
                    <h2 className="text-3xl font-bold text-khwarizmia-navy mb-6">
                      Available Downloads
                    </h2>

                    <div className="grid gap-6">
                      {downloads.map((download, index) => (
                        <Card key={index} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-khwarizmia-navy mb-2">
                                  {download.name}
                                </h3>
                                <p className="text-gray-600 mb-2 leading-relaxed">
                                  {download.description}
                                </p>
                                <div className="flex gap-4 text-sm">
                                  {download.size && (
                                    <span className="text-gray-500">
                                      Size: {download.size}
                                    </span>
                                  )}
                                  <span className="text-gray-500">
                                    Format: {download.format}
                                  </span>
                                  {download.version && (
                                    <span className="text-gray-500">
                                      Version: {download.version}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center ml-4"
                                onClick={() => download.url && window.open(download.url, '_blank')}
                                disabled={!download.url}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

            {/* Related Links */}
            {relatedLinks.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="mt-12"
              >
                <h3 className="text-2xl font-bold text-khwarizmia-navy mb-6">
                  Related Resources
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer p-6 hover:border-khwarizmia-teal/30"
                      onClick={() => {
                        if (link.external) {
                          window.open(link.href, '_blank');
                        } else {
                          navigate(link.href);
                        }
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-khwarizmia-navy text-lg">
                          {link.title}
                        </h4>
                        <ExternalLink className="w-5 h-5 text-khwarizmia-teal flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {link.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gray-50 rounded-lg p-12">
                <h3 className="text-2xl font-bold text-khwarizmia-navy mb-4">
                  Need Help?
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Can't find what you're looking for? Our team is here to help you get the resources you need for your solutions industrielles et tertiaires projects.
                </p>
                <motion.button
                  className="bg-khwarizmia-navy hover:bg-khwarizmia-navy/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                  onClick={() => window.open('mailto:kssitech@gmail.com?subject=Download Support Request', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DownloadPage;
