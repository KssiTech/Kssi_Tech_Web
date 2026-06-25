import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { sectors } from "@/data/sectors";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const SectorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const sector = sectors.find((s) => s.slug === slug);

  if (!sector) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Secteur introuvable</h1>
          <p className="text-muted-foreground mb-8">
            Ce secteur n'existe pas ou l'URL est incorrecte.
          </p>
          <Link to="/">
            <Button className="bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800">
              Retour à l'accueil <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const { Icon } = sector;

  return (
    <>
      <Helmet>
        <title>{sector.name} | KSSI TECH</title>
        <meta name="description" content={sector.shortDescription} />
        <link rel="canonical" href={`https://kssi-tech.com/secteurs/${sector.slug}`} />
      </Helmet>

      <Navigation />

      <div className="min-h-screen bg-background text-foreground">

        {/* ── HERO ── */}
        <section className="relative bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-blue-900 text-white py-28 overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{ backgroundImage: `url(${sector.heroImage})` }}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
                <Link to="/" className="hover:text-khwarizmia-gold transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-white/70">Secteurs</span>
                <span>/</span>
                <span className="text-khwarizmia-gold">{sector.name}</span>
              </nav>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-khwarizmia-gold/30 bg-khwarizmia-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-khwarizmia-gold mb-6">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-khwarizmia-gold" aria-hidden />
                Secteur d'expertise
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {sector.name}
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl leading-relaxed">
                {sector.shortDescription}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── DESCRIPTION ── */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl font-bold text-foreground mb-6">Notre expertise</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {sector.fullDescription}
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/contact-support">
                    <Button className="bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800 rounded-xl px-6 py-5 text-sm font-semibold uppercase tracking-wider">
                      Nous contacter <Phone className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/request-demo">
                    <Button variant="outline" className="rounded-xl border-stone-300 px-6 py-5 text-sm font-semibold uppercase tracking-wider text-foreground hover:border-khwarizmia-gold hover:text-khwarizmia-bronze transition-colors">
                      Demander un devis <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-center">
                <div className={`w-64 h-64 bg-gradient-to-br ${sector.accentGradient} rounded-3xl flex items-center justify-center shadow-2xl`}>
                  <Icon className={`w-28 h-28 ${sector.iconColor} opacity-90`} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── CAPACITÉS ── */}
        <section className="py-20 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Nos prestations</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                L'ensemble de nos capacités techniques dans ce domaine
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sector.capabilities.map((cap, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-khwarizmia-teal shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-foreground mb-2">{cap.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CERTIFICATIONS ── */}
        {sector.certifications && sector.certifications.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-khwarizmia-navy to-blue-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8">Certifications & Agréments</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {sector.certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border border-khwarizmia-gold/40 bg-khwarizmia-gold/10 px-5 py-2 text-sm font-semibold text-khwarizmia-gold backdrop-blur-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-20 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Prêt à démarrer votre projet ?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Contactez notre équipe d'experts pour étudier votre besoin et recevoir une proposition adaptée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact-support">
                  <Button
                    size="lg"
                    className="bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800 rounded-xl px-8 py-6 text-sm font-semibold uppercase tracking-wider shadow-lg"
                  >
                    Nous contacter <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/request-demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-stone-300 px-8 py-6 text-sm font-semibold uppercase tracking-wider text-foreground hover:border-khwarizmia-gold hover:text-khwarizmia-bronze transition-colors"
                  >
                    Demander un devis <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default SectorPage;
