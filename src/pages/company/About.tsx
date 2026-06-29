import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap, Target, Shield, Wifi, Sun, Wrench, Eye, Activity, Award, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { t, ta } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const valueIcons = [
    <Users className="w-8 h-8" />,
    <Zap className="w-8 h-8" />,
    <Target className="w-8 h-8" />,
    <Shield className="w-8 h-8" />,
  ];

  const sectorIcons = [
    <Activity className="w-7 h-7" />,
    <Zap className="w-7 h-7" />,
    <Sun className="w-7 h-7" />,
    <Wifi className="w-7 h-7" />,
    <Eye className="w-7 h-7" />,
    <Wrench className="w-7 h-7" />,
  ];

  const sectorNames = [
    t('sectors.services.electricite.name'),
    t('sectors.services.automatisation.name'),
    t('sectors.services.energie.name'),
    t('sectors.services.reseaux.name'),
    t('sectors.services.surveillance.name'),
    t('sectors.services.maintenance.name'),
  ];
  const sectorDescs = [
    t('sectors.services.electricite.short'),
    t('sectors.services.automatisation.short'),
    t('sectors.services.energie.short'),
    t('sectors.services.reseaux.short'),
    t('sectors.services.surveillance.short'),
    t('sectors.services.maintenance.short'),
  ];
  const sectorBadge = [t('sectors.tagline'), '', '', '', '', ''];

  const values: { title: string; description: string }[] = ta('about.values') || [];
  const objectives: string[] = ta('about.objectives') || [];
  const legalFields: string[][] = ta('about.legalFields') || [];

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
        <title>{t('about.heroTitle')} KSSI TECH | Leading Technical Future World</title>
        <meta name="description" content="KSSI TECH est spécialisée dans le service aux entreprises industrielles et tertiaires : électricité, automatisation, énergie renouvelable, réseaux, vidéosurveillance et maintenance — basée à Safi, Maroc." />
        <link rel="canonical" href="https://kssi-tech.com/about-us" />
      </Helmet>

      <Navigation />

      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-blue-900 text-white py-24">
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-khwarizmia-gold text-sm font-semibold uppercase tracking-[0.25em] mb-4">
                {t('about.heroLabel')}
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                {t('about.heroTitle')} <span className="text-khwarizmia-teal">KSSI TECH</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                {t('about.heroSubtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ONEE Certification Banner */}
        <section className="py-10 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 text-center md:text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-khwarizmia-navy flex items-center justify-center shadow-lg flex-shrink-0">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-0.5">Certification officielle</p>
                  <p className="text-lg font-extrabold text-khwarizmia-navy">Agréé ONEE — BT &amp; MT</p>
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-amber-200" />
              {[
                { value: "20+", label: "Clients actifs" },
                { value: "6",   label: "Secteurs d'expertise" },
                { value: "Safi", label: "Maroc" },
              ].map(({ value, label }) => (
                <div key={value} className="text-center">
                  <p className="text-2xl font-extrabold text-khwarizmia-navy">{value}</p>
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
              <div className="hidden md:block w-px h-12 bg-amber-200" />
              <div className="flex flex-wrap gap-2">
                {["SARL", "RC : 3595", "ICE : 000074736000019"].map(item => (
                  <span key={item} className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Qui sommes-nous */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl font-bold text-foreground mb-8">{t('about.whoTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  <strong className="text-foreground">KSSI TECH</strong> {t('about.whoBody1')}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">{t('about.whoBody2')}</p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl font-bold text-foreground mb-8">{t('about.missionTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{t('about.missionBody')}</p>
                <div className="mt-8 p-6 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{t('about.headquartersLabel')}</p>
                  <p className="font-semibold text-foreground">59, rue 5, Qu. Lalla Asmae Bd Hassan II</p>
                  <p className="text-muted-foreground">Safi, Maroc</p>
                  <p className="mt-2 text-muted-foreground"><span className="text-khwarizmia-teal">Tél :</span> +212 524 622 240</p>
                  <p className="text-muted-foreground"><span className="text-khwarizmia-teal">Mobile :</span> +212 661 979 129</p>
                  <p className="text-muted-foreground">
                    <span className="text-khwarizmia-teal">E-mail :</span>{" "}
                    <a href="mailto:kssitech@gmail.com" className="hover:text-khwarizmia-gold transition-colors">kssitech@gmail.com</a>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-card/50 border-y border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
              <h2 className="text-4xl font-bold text-foreground mb-4">Notre parcours</h2>
              <p className="text-xl text-muted-foreground">Les grandes étapes qui ont façonné KSSI TECH.</p>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-10">
                {[
                  { year: "2015", title: "Création de KSSI TECH", body: "Fondation de la société à Safi, spécialisée dans les services électriques industriels et tertiaires.", side: "left" },
                  { year: "2016", title: "Certification ONEE BT/MT", body: "Obtention de l'agrément Office National de l'Électricité pour les installations basse et moyenne tension.", side: "right" },
                  { year: "2019", title: "Expansion multi-secteurs", body: "Élargissement vers l'automatisation, la vidéosurveillance et les réseaux informatiques.", side: "left" },
                  { year: "2021", title: "Énergie solaire", body: "Déploiement des premières centrales photovoltaïques pour clients industriels et institutionnels.", side: "right" },
                  { year: "2024", title: "20+ clients actifs", body: "KSSI TECH compte plus de 20 clients réguliers dans la région Safi-Doukkala.", side: "left" },
                ].map(({ year, title, body, side }, i) => (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`relative flex flex-col md:flex-row items-start gap-6 ${side === "right" ? "md:flex-row-reverse" : ""}`}
                  >
                    {/* Content */}
                    <div className={`md:w-[calc(50%-28px)] ${side === "right" ? "md:text-right" : ""}`}>
                      <div className={`p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow ${side === "right" ? "md:mr-0" : ""}`}>
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-khwarizmia-teal">{year}</span>
                        <h3 className="text-base font-bold text-foreground mt-1 mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                      </div>
                    </div>

                    {/* Dot */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-khwarizmia-teal/20 border-2 border-khwarizmia-teal items-center justify-center top-5">
                      <div className="w-2 h-2 rounded-full bg-khwarizmia-teal" />
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block md:w-[calc(50%-28px)]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">{t('about.valuesTitle')}</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('about.valuesSubtitle')}</p>
            </motion.div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div key={index} variants={fadeInUp} className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border">
                  <div className="text-khwarizmia-teal mb-4">{valueIcons[index]}</div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Secteurs */}
        <section className="py-20 bg-gradient-to-br from-khwarizmia-navy to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{t('about.sectorsTitle')}</h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">{t('about.sectorsSubtitle')}</p>
            </motion.div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sectorNames.map((name, index) => (
                <motion.div key={index} variants={fadeInUp} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all">
                  <div className="text-khwarizmia-teal mb-4">{sectorIcons[index]}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{name}</h3>
                    {index === 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-khwarizmia-teal/30 text-khwarizmia-teal border border-khwarizmia-teal/40 uppercase tracking-wider">
                        Agréé ONEE
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 leading-relaxed">{sectorDescs[index]}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Objectifs */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-4xl font-bold text-foreground mb-8">{t('about.objectivesTitle')}</h2>
                <div className="space-y-5">
                  {objectives.map((obj, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-khwarizmia-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-khwarizmia-teal" />
                      </div>
                      <p className="text-lg text-muted-foreground">{obj}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-card p-8 rounded-xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-6">{t('about.legalTitle')}</h3>
                <dl className="space-y-3 text-sm">
                  {legalFields.map(([label, value]) => (
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

        {/* Clients */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">{t('about.clientsTitle')}</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('about.clientsSubtitle')}</p>
            </motion.div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="flex flex-wrap justify-center gap-3">
              {clients.map((client, index) => (
                <motion.div key={index} variants={fadeInUp} className="px-5 py-3 rounded-xl bg-card border border-border text-muted-foreground text-sm font-medium hover:border-khwarizmia-teal hover:text-foreground transition-all">
                  {client}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold text-foreground mb-6">{t('about.ctaTitle')}</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">{t('about.ctaBody')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact-support" className="inline-flex items-center px-8 py-4 bg-khwarizmia-navy hover:bg-khwarizmia-navy/90 text-white font-semibold rounded-lg transition-colors">
                  {t('about.contactUs')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a href="/request-demo" className="inline-flex items-center px-8 py-4 border-2 border-khwarizmia-teal text-khwarizmia-teal hover:bg-khwarizmia-teal hover:text-white font-semibold rounded-lg transition-colors">
                  {t('about.requestQuote')}
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
