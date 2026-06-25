import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Navigation from '@/components/Navigation'
import {
  Download,
  ExternalLink,
  Check,
  Terminal,
  Code,
  Settings,
  Zap,
  Shield
} from 'lucide-react'

export default function InstallationGuide() {
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

  const requirements = [
    {
      icon: <Terminal className="w-6 h-6" />,
      title: 'Node.js & npm',
      description: 'Required for the frontend. Install the latest LTS version from nodejs.org'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Git',
      description: 'For cloning the repository and version control'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Python 3.8+',
      description: 'Required for the backend services and parameterized scripts'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'C++ Compiler',
      description: 'Modern C++17 compiler (GCC, Clang, or MSVC) for building from source'
    }
  ]

  const steps = [
    {
      title: 'Clone the Repository',
      command: 'git clone https://github.com/kssi-tech/Hisab.git',
      description: 'Clone the KSSI TECH repository from GitHub using your preferred Git client or command line.'
    },
    {
      title: 'Navigate to Project Directory',
      command: 'cd Hisab',
      description: 'Change to the cloned repository directory to begin setup.'
    },
    {
      title: 'Install Frontend Dependencies',
      command: 'cd frontend && npm install',
      description: 'Install all required Node.js packages for the React frontend using npm.'
    },
    {
      title: 'Install Backend Dependencies',
      command: 'cd ../dashboard-api && npm install',
      description: 'Install Express.js and other backend dependencies for the API server.'
    },
    {
      title: 'Configure Environment',
      command: 'cp .env.example .env && nano .env',
      description: 'Copy the example environment file and configure with your settings (PORT, Python path, etc.).'
    },
    {
      title: 'Start Development Server',
      command: 'npm run dev',
      description: 'Launch the development server with hot-reloading for active development.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Installation Guide - KSSI TECH | Setup & Getting Started</title>
        <meta name="description" content="Complete installation guide for KSSI TECH. Step-by-step instructions for setting up the frontend, backend, and development environment." />
        <meta name="keywords" content="KSSI TECH installation, setup guide, getting started, requirements, development environment" />
        <link rel="canonical" href="https://kssi-tech.com/resources/installation-guide" />
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
                Installation <span className="text-khwarizmia-teal">Guide</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Get started with KSSI TECH. Complete step-by-step instructions for setting up
                the framework in your development environment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Requirements Section */}
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
                System Requirements
              </h2>
              <p className="text-gray-600">
                Ensure you have the following prerequisites installed before proceeding with installation.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6"
            >
              {requirements.map((req, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-khwarizmia-teal">{req.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-khwarizmia-navy mb-2">
                        {req.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{req.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Installation Steps */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-khwarizmia-navy mb-4">
                Installation Steps
              </h2>
              <p className="text-gray-600">
                Follow these steps to set up KSSI TECH in your development environment.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="border-l-4 border-khwarizmia-teal pl-6"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-khwarizmia-teal text-white font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-khwarizmia-navy mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-khwarizmia-teal font-mono text-sm">
                          {step.command}
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Desktop Environment Setup */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-khwarizmia-navy mb-4">
                Development Environment Options
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-lg p-8 shadow-md"
              >
                <h3 className="text-xl font-semibold text-khwarizmia-navy mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-3 text-khwarizmia-teal" />
                  Use Your Preferred IDE
                </h3>
                <p className="text-gray-600 mb-4">
                  Clone the repository locally and work with your favorite editor:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    VS Code with TypeScript support
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    WebStorm or other JetBrains IDEs
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Vim, Emacs, or other terminal editors
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-lg p-8 shadow-md"
              >
                <h3 className="text-xl font-semibold text-khwarizmia-navy mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-3 text-khwarizmia-teal" />
                  GitHub Codespaces
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up a cloud-based development environment:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    No local setup required
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Pre-configured development environment
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Access from any browser
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-lg p-8 shadow-md"
              >
                <h3 className="text-xl font-semibold text-khwarizmia-navy mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-3 text-khwarizmia-teal" />
                  Edit on GitHub
                </h3>
                <p className="text-gray-600 mb-4">
                  Make quick edits directly in the browser:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Navigate to desired file
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Click the Edit button (pencil icon)
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-khwarizmia-teal mr-2" />
                    Commit changes directly
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-khwarizmia-navy mb-4">
                Environment Configuration
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-gray-900 rounded-lg p-8"
            >
              <p className="text-gray-400 mb-4">Dashboard API (.env example)</p>
              <div className="text-sm font-mono space-y-2">
                <div className="text-khwarizmia-teal">PORT=5176</div>
                <div className="text-khwarizmia-teal">BPROFIN_ROOT=../services/bprofin</div>
                <div className="text-khwarizmia-teal">PYTHON=python3</div>
                <div className="text-gray-500 mt-4"># Additional variables based on your setup</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Next Steps CTA */}
        <section className="py-16 bg-khwarizmia-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Ready to Start Developing?</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Once installed, you're ready to start building with KSSI TECH. Check out the repository
                for examples, documentation, and community resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="https://github.com/kssi-tech/Hisab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit GitHub Repository
                </motion.a>
                <motion.a
                  href="/resources"
                  className="border-2 border-white hover:bg-white hover:text-khwarizmia-navy text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Resources
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
