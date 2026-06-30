import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Shield, Zap, Users, Layers, Wrench,
  Phone, Mail, MapPin, Sun, Network, Eye, Settings, Award,
  ClipboardList, FileText, HardHat, HeartHandshake, Quote, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroDotGridBackground from "@/components/HeroDotGridBackground";
import StitchAuroraLayer from "@/components/StitchAuroraLayer";
import { useNavigate } from "react-router-dom";
import SpinningGlobe from "@/components/SpinningGlobe";
import { withBase } from "@/lib/utils";
import HeroSectorPanels from "@/components/HeroSectorPanels";
import ClientsMarquee from "@/components/ClientsMarquee";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.15 }
  }
};

const services = [
  {
    slug: "electricite",
    name: "Électricité BT/MT",
    short: "Études, fourniture et réalisation d'installations électriques basse et moyenne tension, agréé ONEE.",
    Icon: Zap,
    iconGradient: "from-khwarizmia-navy to-stone-700",
    iconColor: "text-khwarizmia-paper",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
  },
  {
    slug: "automatisation",
    name: "Automatisation",
    short: "Conception et intégration de systèmes automatisés, pupitres de commande et automates programmables.",
    Icon: Settings,
    iconGradient: "from-khwarizmia-teal to-khwarizmia-bronze",
    iconColor: "text-khwarizmia-navy",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
  },
  {
    slug: "energie",
    name: "Énergie Renouvelable",
    short: "Fourniture et installation de centrales photovoltaïques et solutions d'énergie propre adaptées.",
    Icon: Sun,
    iconGradient: "from-stone-600 to-khwarizmia-navy",
    iconColor: "text-khwarizmia-paper",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
  {
    slug: "reseaux",
    name: "Réseaux Informatiques",
    short: "Déploiement d'infrastructures réseau cuivre et fibre optique avec équipements actifs inclus.",
    Icon: Network,
    iconGradient: "from-khwarizmia-bronze to-stone-700",
    iconColor: "text-khwarizmia-paper",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
  },
  {
    slug: "surveillance",
    name: "Vidéo Surveillance",
    short: "Installation de systèmes CCTV, contrôle d'accès et solutions de sécurité périmétrique.",
    Icon: Eye,
    iconGradient: "from-khwarizmia-navy to-khwarizmia-teal",
    iconColor: "text-khwarizmia-paper",
    image: "https://images.unsplash.com/photo-1580983559367-0dc2f8934365?w=600&q=80",
  },
  {
    slug: "maintenance",
    name: "Maintenance Industrielle",
    short: "Maintenance préventive et corrective de l'ensemble des équipements industriels et tertiaires.",
    Icon: Wrench,
    iconGradient: "from-khwarizmia-teal to-khwarizmia-bronze",
    iconColor: "text-khwarizmia-navy",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
  },
];

const whyCards = [
  {
    icon: Award,
    key: "onee",
    gradient: "from-khwarizmia-navy to-stone-800",
    bgAccent: "from-khwarizmia-teal/12",
    border: "hover:border-khwarizmia-teal/40",
    iconColor: "text-khwarizmia-paper",
    rotateY: 2,
  },
  {
    icon: Users,
    key: "clients",
    gradient: "from-khwarizmia-teal to-khwarizmia-bronze",
    bgAccent: "from-khwarizmia-gold/10",
    border: "hover:border-khwarizmia-gold/35",
    iconColor: "text-khwarizmia-navy",
    rotateY: -2,
  },
  {
    icon: Layers,
    key: "expertise",
    gradient: "from-stone-600 to-khwarizmia-navy",
    bgAccent: "from-stone-500/10",
    border: "hover:border-stone-500/40",
    iconColor: "text-khwarizmia-paper",
    rotateY: 2,
  },
  {
    icon: Shield,
    key: "reliability",
    gradient: "from-khwarizmia-bronze to-stone-700",
    bgAccent: "from-khwarizmia-bronze/12",
    border: "hover:border-khwarizmia-bronze/40",
    iconColor: "text-khwarizmia-paper",
    rotateY: -2,
  },
];

const Index = () => {
  const { isDark } = useTheme();
  const { t, ta } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full mx-auto mb-4"
          />
          <p className="text-foreground font-medium">{t("home.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />

      {/* ── HERO ── */}
      <section className="relative min-h-screen" role="banner" aria-label="KSSI TECH accueil">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {isDark ? (
            <>
              <div
                className="absolute inset-0 bg-black bg-cover bg-center"
                style={{ backgroundImage: `url('${withBase("/dark.png")}')` }}
              />
              <StitchAuroraLayer />
              <HeroDotGridBackground isDark variant="stitch" />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0 bg-khwarizmia-paper bg-cover bg-center"
                style={{ backgroundImage: `url('${withBase("/light.png")}')` }}
              />
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(ellipse 75% 65% at 88% 38%, rgba(230, 215, 188, 0.55) 0%, rgba(244, 241, 234, 0.35) 42%, transparent 62%)",
                }}
              />
              <div
                className="absolute right-[-8%] top-[22%] h-[min(88vw,640px)] w-[min(88vw,640px)] rounded-full blur-[110px] opacity-80"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(212, 188, 148, 0.42) 0%, transparent 68%)",
                }}
              />
              <motion.div
                className="absolute -right-[12%] top-[18%] h-[min(48vh,400px)] w-[min(75vw,560px)] rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse 58% 58% at 50% 50%, rgba(198, 166, 103, 0.28) 0%, rgba(244, 241, 234, 0.12) 52%, transparent 74%)",
                  filter: "blur(52px)",
                }}
                initial={false}
                animate={
                  prefersReducedMotion
                    ? { opacity: 0.55 }
                    : { x: [0, -28, 18, 0], y: [0, 16, -12, 0], opacity: [0.42, 0.62, 0.48, 0.42] }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 20, repeat: Infinity, ease: "easeInOut" }
                }
                aria-hidden
              />
              <motion.div
                className="absolute -left-[8%] bottom-[-8%] h-[min(42vh,360px)] w-[min(70vw,520px)] rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse 52% 52% at 48% 48%, rgba(139, 115, 85, 0.18) 0%, rgba(244, 241, 234, 0.1) 55%, transparent 76%)",
                  filter: "blur(48px)",
                }}
                initial={false}
                animate={
                  prefersReducedMotion
                    ? { opacity: 0.4 }
                    : { x: [0, 22, -14, 0], y: [0, -14, 10, 0], opacity: [0.32, 0.5, 0.38, 0.32] }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }
                }
                aria-hidden
              />
              <HeroDotGridBackground isDark={false} />
            </>
          )}
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-24 pb-20 min-h-screen flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">

              {/* Left column — pitch */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="space-y-7 lg:pr-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.65, ease: "easeOut" }}
                    className="flex justify-center lg:justify-start"
                  >
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-khwarizmia-gold"
                          : "border-stone-200/90 bg-white/70 text-[rgb(139,115,85)] shadow-sm backdrop-blur-sm"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? "bg-khwarizmia-gold" : "bg-khwarizmia-teal"}`}
                        aria-hidden
                      />
                      {t("home.hero.tagline")}
                    </div>
                  </motion.div>

                  <motion.h1
                    className={`finance-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.06] tracking-tight text-center lg:text-left font-bold ${
                      isDark ? "text-stone-100" : "text-khwarizmia-navy"
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  >
                    KSSI TECH
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38, duration: 0.75, ease: "easeOut" }}
                    className={`space-y-3 text-center lg:text-left max-w-xl ${isDark ? "text-stone-400" : "text-stone-600"}`}
                  >
                    <p className="finance-subheading text-lg md:text-xl font-medium leading-snug tracking-tight">
                      {t("home.hero.subtitle")}
                    </p>
                    <p className="finance-body text-base md:text-lg leading-relaxed text-balance opacity-95">
                      {t("home.hero.body")}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Button
                        onClick={() =>
                          document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                        }
                        size="lg"
                        className={`finance-body h-auto rounded-xl px-7 py-6 text-sm font-semibold uppercase tracking-[0.18em] shadow-lg transition-all duration-300 ${
                          isDark
                            ? "bg-stone-100 text-khwarizmia-navy hover:bg-white"
                            : "bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800"
                        }`}
                      >
                        {t("home.hero.ctaServices")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Button
                        onClick={() => navigate("/contact-support")}
                        variant="outline"
                        size="lg"
                        className={`finance-body h-auto rounded-xl border px-7 py-6 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                          isDark
                            ? "border-white/15 bg-transparent text-stone-200 hover:border-khwarizmia-gold/50 hover:bg-white/[0.04]"
                            : "border-stone-200 bg-white/90 text-khwarizmia-navy hover:bg-white"
                        }`}
                      >
                        {t("home.hero.ctaContact")}
                        <Phone className="ml-2 h-4 w-4 opacity-80" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right column — sector panels */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="lg:pl-8"
                >
                  <HeroSectorPanels isDark={isDark} />
                </motion.div>
              </div>
            </div>
          </div>
          {/* Clients marquee — bottom of hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="max-w-7xl mx-auto w-full mt-4"
          >
            <ClientsMarquee />
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 bg-khwarizmia-paper overflow-hidden">
        <style>{`
          @keyframes kw-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .kw-marquee-track { animation: kw-marquee 36s linear infinite; }
          .kw-marquee-track:hover { animation-play-state: paused; }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-khwarizmia-navy">
              {t("home.services.title")}
            </h2>
            <p className="text-xl text-stone-600 max-w-4xl mx-auto">
              {t("home.services.desc")}
            </p>
          </motion.div>
        </div>

        <div
          className="relative"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="kw-marquee-track flex gap-6 w-max px-6">
            {[...services, ...services].map(({ slug, name, short, Icon, iconGradient, iconColor, image }, i) => (
              <div key={`${slug}-${i}`} className="group w-[272px] shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/secteurs/${slug}`)}
                  className="h-full w-full text-left rounded-2xl transition-all duration-500 bg-white border border-stone-200/80 shadow-md hover:shadow-xl hover:-translate-y-2 overflow-hidden cursor-pointer flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative h-40 w-full overflow-hidden shrink-0">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div
                      className={`absolute bottom-3 left-3 w-9 h-9 bg-gradient-to-br ${iconGradient} rounded-lg flex items-center justify-center ${iconColor} shadow-lg`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-khwarizmia-navy font-sans tracking-tight group-hover:text-khwarizmia-bronze transition-colors mb-2">
                      {t(`sectors.services.${slug}.name`)}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed flex-1">{t(`sectors.services.${slug}.short`)}</p>
                    <div className="mt-4 flex items-center gap-1 text-khwarizmia-bronze text-xs font-semibold group-hover:gap-2 transition-all duration-200">
                      {t("common.readMore")} <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE PROCESSUS ── */}
      <section className={`py-20 ${isDark ? "bg-slate-950" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-khwarizmia-navy"}`}>
              Notre Processus
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              De la première rencontre à la maintenance continue, nous vous accompagnons à chaque étape.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                Icon: ClipboardList,
                title: "Consultation",
                body: "Analyse de vos besoins, visite technique et étude de faisabilité sur site.",
                color: "from-blue-600 to-blue-800",
              },
              {
                step: "02",
                Icon: FileText,
                title: "Proposition",
                body: "Devis détaillé, planning de réalisation et choix des équipements adaptés.",
                color: "from-amber-500 to-amber-700",
              },
              {
                step: "03",
                Icon: HardHat,
                title: "Réalisation",
                body: "Exécution par nos techniciens certifiés, dans le respect des normes ONEE.",
                color: "from-emerald-600 to-emerald-800",
              },
              {
                step: "04",
                Icon: HeartHandshake,
                title: "Suivi",
                body: "Maintenance préventive et support technique continu pour votre tranquillité.",
                color: "from-violet-600 to-violet-800",
              },
            ].map(({ step, Icon, title, body, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 hover:border-white/20"
                    : "bg-stone-50 border-stone-200/80 hover:border-stone-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`absolute top-5 right-5 text-4xl font-black select-none ${isDark ? "text-white/5" : "text-stone-200"}`}>
                  {step}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-khwarizmia-navy"}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-stone-400" : "text-stone-600"}`}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI KSSI TECH ── */}
      <section className={`py-24 relative overflow-hidden ${isDark ? "bg-background" : "bg-stone-100"}`}>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-400/25 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.45, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -left-40 top-40 w-80 h-80 bg-khwarizmia-teal/10 rounded-full blur-3xl mix-blend-multiply"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.45, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -right-40 bottom-40 w-80 h-80 bg-khwarizmia-bronze/10 rounded-full blur-3xl mix-blend-multiply"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2
                className={`finance-heading text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-khwarizmia-navy"} mb-6 tracking-tight`}
              >
                {t("home.why.title")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-khwarizmia-teal to-khwarizmia-gold">
                  {t("home.why.highlight")}
                </span>
              </h2>
              <p
                className={`finance-body text-lg md:text-xl ${isDark ? "text-stone-300" : "text-stone-600"} max-w-3xl mx-auto leading-relaxed`}
              >
                {t("home.why.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10"
            >
              {whyCards.map(({ icon: Icon, key, gradient, bgAccent, border, iconColor, rotateY }) => (
                <motion.div
                  key={key}
                  variants={{
                    hidden: { opacity: 0, y: 80, rotateX: 25, scale: 0.85 },
                    visible: {
                      opacity: 1, y: 0, rotateX: 0, scale: 1,
                      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
                    },
                  }}
                  whileHover={{
                    y: -12, scale: 1.03, rotateY,
                    boxShadow: isDark
                      ? "0 25px 50px rgba(198, 166, 103, 0.22), 0 0 0 1px rgba(198, 166, 103, 0.35)"
                      : "0 25px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(198,166,103,0.35)",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`relative min-h-[280px] ${isDark ? "bg-white/5" : "bg-white"} backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-stone-700/30 dark:border-stone-600/40 ${border} transition-all duration-300 ease-out cursor-pointer z-10 hover:z-20 text-center`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgAccent} to-transparent rounded-2xl opacity-60`} />
                  <motion.div
                    className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${iconColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <div className="relative z-10">
                    <h3
                      className={`finance-heading text-base md:text-lg font-bold ${isDark ? "text-white" : "text-khwarizmia-navy"} mb-3 leading-tight`}
                    >
                      {t(`home.why.cards.${key}.title`)}
                    </h3>
                    <p className={`finance-body ${isDark ? "text-stone-300" : "text-stone-600"} text-sm md:text-base leading-relaxed`}>
                      {t(`home.why.cards.${key}.body`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className={`py-20 ${isDark ? "bg-slate-900" : "bg-khwarizmia-paper"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-khwarizmia-navy"}`}>
              Ils nous font confiance
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              Ce que nos clients disent de nos interventions et de notre sérieux.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "La qualité des travaux électriques réalisés par KSSI TECH sur notre campus répond parfaitement aux normes ONEE. Délais respectés, équipe professionnelle et réactive.",
                name: "Directeur des Infrastructures",
                org: "ENSA Safi",
                initial: "E",
              },
              {
                quote: "KSSI TECH a déployé notre réseau fibre optique en un temps record. La qualité de l'installation et le suivi technique après livraison sont irréprochables.",
                name: "Responsable Réseau",
                org: "Maroc Telecom — Safi",
                initial: "M",
              },
              {
                quote: "Le système de vidéosurveillance installé par KSSI TECH sécurise l'ensemble de nos locaux. Nous recommandons vivement leurs services à tout établissement.",
                name: "Directeur Régional",
                org: "OFPPT Safi",
                initial: "O",
              },
            ].map(({ quote, name, org, initial }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className={`relative p-8 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isDark
                    ? "bg-white/[0.04] border-white/10"
                    : "bg-white border-stone-200/80 shadow-md"
                }`}
              >
                <Quote className={`w-8 h-8 mb-4 ${isDark ? "text-khwarizmia-teal/40" : "text-khwarizmia-teal/30"}`} />
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-stone-300" : "text-stone-600"}`}>
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isDark ? "bg-khwarizmia-teal/20 text-khwarizmia-teal" : "bg-khwarizmia-navy text-khwarizmia-paper"
                  }`}>
                    {initial}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-khwarizmia-navy"}`}>{name}</p>
                    <p className={`text-xs ${isDark ? "text-stone-500" : "text-stone-400"}`}>{org}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section
        className={`py-16 ${isDark ? "bg-stone-950" : "bg-khwarizmia-navy text-khwarizmia-paper"}`}
        aria-label="Chiffres clés KSSI TECH"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { k: "20+",  vKey: "home.stats.clients" },
              { k: "6",    vKey: "home.stats.sectors" },
              { k: "ONEE", vKey: "home.stats.cert" },
              { k: "Safi", vKey: "home.stats.city" },
            ].map((s) => (
              <div key={s.k}>
                <div
                  className={`text-3xl md:text-4xl font-bold ${isDark ? "text-khwarizmia-gold" : "text-khwarizmia-teal"}`}
                >
                  {s.k}
                </div>
                <div className={`mt-1 text-sm ${isDark ? "text-stone-400" : "text-stone-300"}`}>{t(s.vKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-khwarizmia-navy">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8">
              {t("home.cta.body")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/request-demo")}
                size="lg"
                className="bg-khwarizmia-navy hover:bg-stone-800 text-khwarizmia-paper px-8 py-4 text-lg font-semibold rounded-lg transition-colors"
              >
                {t("home.cta.demo")}
              </Button>
              <Button
                onClick={() => navigate("/contact-support")}
                size="lg"
                variant="outline"
                className="bg-white text-khwarizmia-navy border-khwarizmia-navy/20 hover:bg-khwarizmia-paper px-8 py-6 text-lg font-semibold"
              >
                {t("home.cta.contact")}
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-khwarizmia-teal/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-khwarizmia-bronze" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-khwarizmia-navy">{t("home.contactInfo.phone")}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                <a href="tel:+212524622240" className="hover:text-khwarizmia-bronze transition-colors block">
                  +212 524 622 240
                </a>
                <a href="tel:+212661979129" className="hover:text-khwarizmia-bronze transition-colors block">
                  +212 661 979 129
                </a>
                <span className="text-stone-400 text-xs mt-1 block">{t("home.contactInfo.phoneHours")}</span>
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-khwarizmia-teal/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-khwarizmia-bronze" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-khwarizmia-navy">{t("home.contactInfo.email")}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                <a
                  href="mailto:kssitech@gmail.com"
                  className="text-khwarizmia-bronze font-medium underline-offset-2 hover:underline"
                >
                  kssitech@gmail.com
                </a>
                <span className="text-stone-400 text-xs mt-1 block">{t("home.contactInfo.emailResponse")}</span>
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-khwarizmia-teal/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-khwarizmia-bronze" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-khwarizmia-navy">{t("home.contactInfo.address")}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {t("home.contactInfo.addressLine1")}
                <br />
                {t("home.contactInfo.addressLine2")}
                <span className="text-stone-400 text-xs mt-1 block">{t("home.contactInfo.addressLegal")}</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── WHATSAPP FLOATING BUTTON ── */}
      <motion.a
        href="https://wa.me/212661979129"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous contacter sur WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: "#25D366" }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </motion.a>

      {/* ── FOOTER ── */}
      <footer className="py-16 bg-gradient-to-br from-khwarizmia-navy via-stone-900 to-black text-khwarizmia-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">

            {/* Services */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Nos Services</h4>
              <ul className="space-y-2">
                {[
                  "Électricité BT/MT",
                  "Automatisation",
                  "Énergie Renouvelable",
                  "Réseaux Informatiques",
                  "Vidéo Surveillance",
                  "Maintenance Industrielle",
                ].map((s) => (
                  <li key={s}>
                    <a
                      href="#services"
                      className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Entreprise</h4>
              <ul className="space-y-2">
                <li><a href="/about-us" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Notre histoire</a></li>
                <li><a href="/company/partner-program" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Devenir Partenaire</a></li>
              </ul>
            </div>

            {/* Actualités */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Actualités</h4>
              <ul className="space-y-2">
                <li><a href="/blog" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Blog & Actualités</a></li>
                <li><a href="/company/news" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Communiqués</a></li>
                <li><a href="/news/newsletter" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Newsletter</a></li>
              </ul>
            </div>

            {/* Références clients */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Ils nous font confiance</h4>
              <ul className="space-y-1.5">
                {[
                  "Maroc Telecom",
                  "Lafarge Placo Maroc",
                  "OFPPT",
                  "RADEES",
                  "Université Cadi Ayyad",
                  "ENSA Safi · FP Safi",
                ].map((c) => (
                  <li key={c} className="text-xs text-gray-400">{c}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2">
                <li><a href="/contact-support" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Nous contacter</a></li>
                <li><a href="/request-demo" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Demander un devis</a></li>
                <li><a href="/contact-support" className="text-xs text-gray-300 hover:text-khwarizmia-gold transition-colors">Support technique</a></li>
              </ul>
            </div>
          </div>

          {/* Contact details */}
          <div className="border-t border-white/20 pt-12">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">Contact</h4>
                <div className="space-y-1.5 text-gray-300 text-sm">
                  <p>
                    <a href="mailto:kssitech@gmail.com" className="hover:text-khwarizmia-gold transition-colors">
                      kssitech@gmail.com
                    </a>
                  </p>
                  <p>
                    <a href="tel:+212524622240" className="hover:text-khwarizmia-gold transition-colors">
                      +212 524 622 240
                    </a>
                  </p>
                  <p>
                    <a href="tel:+212661979129" className="hover:text-khwarizmia-gold transition-colors">
                      +212 661 979 129
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">Adresse</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  59, rue 5, Qu. Lalla Asmae<br />
                  Bd Hassan II, Safi, Maroc<br />
                  RC : 3595 | IF : 66845393
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">Informations légales</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>SARL — Agréé ONEE BT/MT</p>
                  <p>Patente : 50000128</p>
                  <p>ICE : 000074736000019</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} KSSI TECH. Tous droits réservés. — Safi, Maroc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
