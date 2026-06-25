import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const ContactSupport: React.FC = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration error. Please contact support.');
      }

      // Call Supabase Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-contact-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            userAgent: navigator.userAgent,
            ipAddress: null // IP will be captured server-side if needed
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message. Please try again.');
      }

      // Success!
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 8 seconds
      setTimeout(() => setIsSubmitted(false), 8000);

    } catch (err) {
      console.error('Contact form submission error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur inattendue est survenue. Veuillez réessayer ou nous contacter directement à kssitech@gmail.com'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'E-mail',
      details: ['kssitech@gmail.com'],
      description: 'Réponse sous 24 h ouvrées'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Téléphone',
      details: ['+212 524 622 240', '+212 661 979 129'],
      description: 'Ligne directe et mobile'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Horaires',
      details: ['Lun – Ven : 8h00 – 18h00', 'Sam : 8h00 – 13h00'],
      description: "Intervention d'urgence disponible"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Siège social',
      details: ['59, rue 5, Qu. Lalla Asmae', 'Bd Hassan II — Safi, Maroc'],
      description: 'KSSI TECH S.A.R.L'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Helmet>
        <title>Contactez-nous | KSSI TECH — Safi, Maroc</title>
        <meta name="description" content="Contactez KSSI TECH pour vos projets d'électricité industrielle, d'automatisation, d'énergie renouvelable, de réseaux ou de maintenance. Basée à Safi, Maroc." />
        <meta name="keywords" content="KSSI TECH contact, support technique, électricité industrielle, Safi, Maroc" />
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-khwarizmia-navy via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Contactez <span className="text-khwarizmia-teal">KSSI TECH</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Notre équipe est à votre disposition pour tout projet d'installation, de maintenance
              ou d'étude technique dans les secteurs industriels et tertiaires.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`${isDark ? 'bg-gray-900' : 'bg-white'} p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-khwarizmia-teal mb-4">{info.icon}</div>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
                  {info.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                      {detail}
                    </p>
                  ))}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {info.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-khwarizmia-navy'}`}>
              Envoyez-nous un message
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Remplissez le formulaire ci-dessous — nous vous répondrons sous 24 heures ouvrées
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-xl shadow-lg`}
          >
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Message sent successfully!</p>
                  <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Failed to send message</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-600 text-white focus:border-khwarizmia-teal' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-khwarizmia-teal'
                    } focus:outline-none focus:ring-2 focus:ring-khwarizmia-teal/20 transition-colors`}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-900 border-gray-600 text-white focus:border-khwarizmia-teal' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-khwarizmia-teal'
                    } focus:outline-none focus:ring-2 focus:ring-khwarizmia-teal/20 transition-colors`}
                    placeholder="john.doe@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-900 border-gray-600 text-white focus:border-khwarizmia-teal' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-khwarizmia-teal'
                  } focus:outline-none focus:ring-2 focus:ring-khwarizmia-teal/20 transition-colors`}
                  placeholder="solutions techniques KSSI TECH Implementation Support"
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-900 border-gray-600 text-white focus:border-khwarizmia-teal' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-khwarizmia-teal'
                  } focus:outline-none focus:ring-2 focus:ring-khwarizmia-teal/20 transition-colors resize-none`}
                  placeholder="Please describe your inquiry or support request..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white py-4 text-lg font-medium rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>


    </div>
  );
};

export default ContactSupport;

