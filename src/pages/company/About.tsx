import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Users, Zap, Target, CheckCircle, Shield, Wifi, Sun, Wrench, Eye, Activity } from 'lucide-react';
import Navigation from '@/components/Navigation';

const About: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const coreValues = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Esprit d'équipe",
      description: "Une équipe soudée, engagée à travailler ensemble pour offrir les meilleures solutions à nos clients industriels et tertiaires."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Réactivité",
      description: "Nous intervenons rapidement pour garantir la continuité de vos activités et minimiser tout temps d'arrêt."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Compétitivité",
      description: "Des offres tarifées au juste prix, sans compromis sur la qualité des équipements et des prestations fournies."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Indépendance & Sens du service",
      description: "Nous accompagnons nos clients avec impartialité, en leur proposant les solutions les mieux adaptées à leurs besoins réels."
    }
  ];

  const sectors = [
    {
      icon: <Activity className="w-7 h-7" />,
      title: "Électricité BT / MT",
      description: "Études, fournitures et travaux électriques basse et moyenne tension. Agréé par l'ONEE.",
      badge: "Agréé ONEE"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Systèmes automatisés et de commande",
      description: "Conception et installation de systèmes d'automatisation, automates programmables et armoires de commande."
    },
    {
      icon: <Sun className="w-7 h-7" />,
      title: "Énergie renouvelable",
      description: "Étude et installation de systèmes solaires photovoltaïques et autres solutions d'énergie verte pour entreprises et collectivités."
    },
    {
      icon: <Wifi className="w-7 h-7" />,
      title: "Réseaux informatiques",
      description: "Infrastructure réseau cuivre et fibre optique — câblage structuré, baies de brassage, tests et certification."
    },
    {
      icon: <Eye className="w-7 h-7" />,
      title: "Vidéo surveillance",
      description: "Installation de systèmes CCTV analogiques et IP pour la sécurité des sites industriels, commerciaux et administratifs."
    },
    {
      icon: <Wrench className="w-7 h-7" />,
      title: "Maintenance industrielle",
      description: "Maintenance préventive et curative des équipements techniques — électriques, mécaniques et de climatisation."
    }
  ];

  const objectives = [
    "Améliorer nos compétences en permanence par la formation adaptée",
    "S'adapter aux nouvelles technologies du secteur industriel",
    "Accroître nos activités et notre présence régionale",
  ];

  const clients = [
    "RADEES", "École Supérieure de Technologie Safi", "ENSA Safi", "FP SAFI",
    "Université Cadi Ayyad", "Université Chouaib Doukkali", "OFPPT",
    "Haut Commissariat aux Eaux et Forêts", "Ministère des Habous et des Affaires Islamiques",
    "Maroc Telecom", "Caprel", "Lafarge Placo Maroc", "Carlifer",
    "Vinaigrerie Moutarderie du Maroc", "DOHA", "Centrale GYPSE", "Crespo",
    "Conserves Oualili", "Azura", "Nora", "MayMouna", "Centrelec", "Verne Telecom"
  ];

  return (
    <>
      <Helmet>
        <title>À propos de KSSI TECH | Leading Technical Future World</title>
        <meta name="description" content="KSSI TECH est spécialisée dans le service aux entreprises industrielles et tertiaires : électricité, automatisation, énergie renouvelable, réseaux, vidéosurveillance et maintenance — basée à Safi, Maroc." />
        <meta name="keywords" content="KSSI TECH, électricité industrielle, automatisation, énergie renouvelable, réseaux informatiques, maintenance industrielle, Safi, Maroc" />
        <link rel="canonical" href="https://kssi-tech.com/about-us" />
      </Helmet>

      <Navigation />

      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-blue-900 text-white py-24">
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-khwarizmia-gold text-sm font-semibold uppercase tracking-[0.25em] mb-4">
                SARL — Safi, Maroc
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                À propos de <span className="text-khwarizmia-teal">KSSI TECH</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Leading Technical Future World
              </p>
            </motion.div>
          </div>
        </section>

        {/* Qui sommes nous */}
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
                <h2 className="text-4xl font-bold text-foreground mb-8">Qui sommes-nous ?</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  <strong className="text-foreground">KSSI TECH</strong> est spécialisée dans le service aux entreprises industrielles
                  et tertiaires pour l'étude, la fourniture, l'installation et la maintenance des équipements
                  techniques et industriels — électriques, informatiques, énergétiques, climatisation et bien plus.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nous étions certains à penser que pour mieux servir nos clients, nous devions partager les mêmes
                  valeurs essentielles : esprit d'équipe, réactivité, compétitivité, indépendance et sens du service.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl font-bold text-foreground mb-8">Notre mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Notre expérience ainsi que la recherche permanente de la performance, par le biais d'une formation
                  adaptée, nous permettent d'optimiser nos compétences pour un résultat toujours meilleur.
                </p>
                <div className="mt-8 p-6 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Siège social</p>
                  <p className="font-semibold text-foreground">59, rue 5, Qu. Lalla Asmae Bd Hassan II</p>
                  <p className="text-muted-foreground">Safi, Maroc</p>
                  <p className="mt-2 text-muted-foreground">
                    <span className="text-khwarizmia-teal">Tél :</span> +212 524 622 240
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-khwarizmia-teal">Mobile :</span> +212 661 979 129
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-khwarizmia-teal">E-mail :</span>{" "}
                    <a href="mailto:kssitech@gmail.com" className="hover:text-khwarizmia-gold transition-colors">
                      kssitech@gmail.com
                    </a>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Nos valeurs</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Les principes qui guident notre engagement envers l'excellence technique
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border"
                >
                  <div className="text-khwarizmia-teal mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Secteurs d'activité */}
        <section className="py-20 bg-gradient-to-br from-khwarizmia-navy to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Nos secteurs d'activités</h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Dans le respect des règles de sécurité, KSSI TECH offre l'ensemble de ses services dans les secteurs suivants
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {sectors.map((sector, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="text-khwarizmia-teal mb-4">{sector.icon}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{sector.title}</h3>
                    {sector.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-khwarizmia-teal/30 text-khwarizmia-teal border border-khwarizmia-teal/40 uppercase tracking-wider">
                        {sector.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 leading-relaxed">{sector.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Nos objectifs */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-foreground mb-8">Nos objectifs</h2>
                <div className="space-y-5">
                  {objectives.map((obj, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-khwarizmia-teal flex-shrink-0 mt-0.5" />
                      <p className="text-lg text-muted-foreground">{obj}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card p-8 rounded-xl border border-border"
              >
                <h3 className="text-xl font-bold text-foreground mb-6">Références administratives</h3>
                <dl className="space-y-3 text-sm">
                  {[
                    ["Forme juridique", "Société à Responsabilité Limitée (S.A.R.L)"],
                    ["Registre de commerce", "3595"],
                    ["Patente", "50000128"],
                    ["Identification fiscale", "66845393"],
                    ["CNSS", "8031891"],
                    ["ICE", "000074736000019"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-border pb-3">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-semibold text-foreground text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Nos clients */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Nos clients</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Ils nous font confiance — institutions publiques, universités et entreprises industrielles
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3"
            >
              {clients.map((client, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="px-5 py-3 rounded-xl bg-card border border-border text-muted-foreground text-sm font-medium hover:border-khwarizmia-teal hover:text-foreground transition-all"
                >
                  {client}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Travaillons ensemble
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Contactez KSSI TECH pour discuter de vos projets industriels, d'installation ou de maintenance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact-support"
                  className="inline-flex items-center px-8 py-4 bg-khwarizmia-navy hover:bg-khwarizmia-navy/90 text-white font-semibold rounded-lg transition-colors"
                >
                  Nous contacter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a
                  href="/request-demo"
                  className="inline-flex items-center px-8 py-4 border-2 border-khwarizmia-teal text-khwarizmia-teal hover:bg-khwarizmia-teal hover:text-white font-semibold rounded-lg transition-colors"
                >
                  Demander un devis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;
