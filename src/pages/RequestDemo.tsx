import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Mail, ArrowRight, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const RequestDemo: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const demoFeatures = [
    'Live KSSI TECH platform walkthrough',
    'Real-time KSSI TECH Adaptive Volatility (XAV) fitting',
    'Interactive KSSI TECH Volatility Matrix (XVM) construction',
    'Performance benchmarking vs. traditional methods',
    'High-performance C++ & CUDA engine demo',
    'Python SDK (Hisab) walkthrough',
    'Q&A with quantitative analysts'
  ];

  const relatedLinks = [
    {
      title: 'Contact Support',
      href: '/contact-support',
      description: 'Get in touch with our team for immediate assistance',
      external: false
    },
    {
      title: 'Research Publications',
      href: '/resources/publications',
      description: 'Read our Risk.net paper on AAD calibration',
      external: false
    },
    {
      title: 'Products',
      href: '/products/random',
      description: 'Explore our product offerings',
      external: false
    },
    {
      title: 'About KSSI TECH',
      href: '/about',
      description: 'Learn more about KSSI TECH and our platform',
      external: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Request a Demo - Coming Soon | KSSI TECH</title>
        <meta name="description" content="Request a personalized demonstration of KSSI TECH's high-performance quantitative analysis platform. Coming soon — contact us for early access." />
        <meta name="keywords" content="KSSI TECH demo, solutions industrielles et tertiaires, high-performance computing, XAV calibration, Hisab SDK, KSSI TECH platform" />
      </Helmet>

      <Navigation />

      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
              >
                <Calendar className="w-5 h-5 text-khwarizmia-teal" />
                <span className="text-sm font-medium">Coming Soon</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Request a KSSI TECH Demo
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Experience KSSI TECH's high-performance quantitative platform with a personalized walkthrough from our engineering team
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/contact-support')}
                  className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-8 py-6 text-lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact for Early Access
                </Button>
                <Button
                  onClick={() => navigate('/resources')}
                  className="bg-white text-khwarizmia-navy hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  View Resources
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What to Expect Section */}
        <section className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-6">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  What to Expect in the Demo
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Our comprehensive demonstration will showcase the full capabilities of the KSSI TECH platform
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
                {demoFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className={`flex items-start gap-4 p-6 rounded-xl ${
                      isDark ? 'bg-gray-900' : 'bg-white'
                    } shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-khwarizmia-teal/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-khwarizmia-teal" />
                      </div>
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {feature}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-khwarizmia-teal/10 to-khwarizmia-navy/10 rounded-full mb-8">
                <Clock className="w-6 h-6 text-khwarizmia-teal" />
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Demo Platform Launching  Q2 2026
                </span>
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Be Among the First
              </h2>

              <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                We're building an interactive demo platform that will allow you to experience KSSI TECH firsthand.
                Contact us now to get early access and schedule a personalized walkthrough with our team.
              </p>

              <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Early Access Benefits
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <Sparkles className="w-8 h-8 text-khwarizmia-teal mb-3" />
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Priority Access
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Be first to access the demo platform
                    </p>
                  </div>
                  <div>
                    <Mail className="w-8 h-8 text-khwarizmia-teal mb-3" />
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Personalized Session
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      One-on-one walkthrough with our experts
                    </p>
                  </div>
                  <div>
                    <CheckCircle className="w-8 h-8 text-khwarizmia-teal mb-3" />
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Custom Examples
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tailored to your specific use cases
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Links Section */}
        <section className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Explore More
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {relatedLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl ${
                      isDark ? 'bg-gray-900' : 'bg-white'
                    } shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                    onClick={() => navigate(link.href)}
                  >
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-khwarizmia-teal transition-colors`}>
                      {link.title}
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {link.description}
                    </p>
                    <div className="flex items-center text-khwarizmia-teal font-medium group-hover:translate-x-2 transition-transform">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Experience KSSI TECH?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Contact our team today to schedule your personalized demonstration
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/contact-support')}
                  className="bg-white text-khwarizmia-navy hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
                <Button
                  onClick={() => navigate('/resources')}
                  className="bg-white text-khwarizmia-navy hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  View Documentation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default RequestDemo;

