import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { sectors } from "@/data/sectors";
import { useLanguage } from "@/contexts/LanguageContext";

const SECTOR_GROUPS: Record<string, string[]> = {
  "Électricité & Énergie": ["electricite", "energie"],
  "Automatisation & Réseaux": ["automatisation", "reseaux"],
  "Sécurité & Maintenance": ["surveillance", "maintenance"],
};

// Overlay gradients per sector — same palette as hero panels
const OVERLAYS: Record<string, string> = {
  electricite:    "from-[#121218]/90 via-[#121218]/55 to-transparent",
  automatisation: "from-stone-900/90 via-stone-800/55 to-transparent",
  energie:        "from-stone-800/88 via-stone-700/50 to-transparent",
  reseaux:        "from-[#8B7355]/88 via-stone-900/55 to-transparent",
  surveillance:   "from-[#121218]/90 via-[#121218]/55 to-transparent",
  maintenance:    "from-stone-900/88 via-stone-700/50 to-transparent",
};

// Accent color per sector for tags / CTA
const ACCENTS: Record<string, string> = {
  electricite:    "#C6A667",
  automatisation: "#C6A667",
  energie:        "#16c79a",
  reseaux:        "#5b8def",
  surveillance:   "#C6A667",
  maintenance:    "#C6A667",
};

const SecteursList: React.FC = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("Tous");

  const filteredSectors = activeFilter === "Tous"
    ? sectors
    : sectors.filter(s => SECTOR_GROUPS[activeFilter]?.includes(s.slug));

  return (
  <>
    <Helmet>
      <title>Nos Secteurs d'Expertise | KSSI TECH</title>
      <meta
        name="description"
        content="Découvrez les 6 secteurs d'activité de KSSI TECH : Électricité BT/MT, Automatisation, Énergie Renouvelable, Réseaux, Vidéo Surveillance et Maintenance Industrielle."
      />
      <link rel="canonical" href="https://kssi-tech.com/secteurs" />
    </Helmet>

    <Navigation />

    <div className="min-h-screen bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-blue-900 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#caa35e]/30 bg-[#caa35e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#caa35e] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#caa35e]" aria-hidden />
              {t("sectors.tagline")}
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("sectors.pageTitle")}<br className="hidden sm:block" />
              <span className="text-[#caa35e]"> {t("sectors.pageSubtitle")}</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              {t("sectors.pageDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Sector cards (photo panels) ── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {["Tous", ...Object.keys(SECTOR_GROUPS)].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  activeFilter === filter
                    ? "bg-khwarizmia-navy text-khwarizmia-paper border-khwarizmia-navy shadow-md"
                    : "bg-background text-foreground border-border hover:border-khwarizmia-teal/50 hover:text-foreground"
                }`}
              >
                {filter}
                {filter !== "Tous" && (
                  <span className={`ml-2 text-xs font-bold ${activeFilter === filter ? "text-khwarizmia-teal" : "text-muted-foreground"}`}>
                    {SECTOR_GROUPS[filter].length}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {filteredSectors.map((sector, i) => {
              const overlay = OVERLAYS[sector.slug] || "from-stone-900/88 via-stone-800/50 to-transparent";
              const accent  = ACCENTS[sector.slug]  || "#C6A667";
              return (
                <motion.div
                  key={sector.slug}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.07 }}
                >
                  <Link
                    to={`/secteurs/${sector.slug}`}
                    className="group block relative overflow-hidden rounded-2xl"
                    style={{ height: "clamp(340px, 32vw, 440px)" }}
                  >
                    {/* Background photo */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${sector.heroImage})` }}
                      aria-hidden
                    />

                    {/* Gradient overlay — bottom-to-transparent like hero panels */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${overlay} transition-opacity duration-300 group-hover:opacity-90`}
                    />

                    {/* Subtle top vignette for depth */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

                    {/* Number badge */}
                    <div
                      className="absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: accent + '22', border: `1.5px solid ${accent}55`, color: accent }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Content at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {/* Capabilities preview pills */}
                      <div className="flex flex-wrap gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {sector.capabilities.slice(0, 2).map((cap, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
                          >
                            <CheckCircle className="w-2.5 h-2.5" />
                            {cap.title.split(' ').slice(0, 3).join(' ')}
                          </span>
                        ))}
                      </div>

                      {/* Sector name */}
                      <h2 className="text-white font-bold text-xl lg:text-2xl mb-2 leading-tight tracking-tight">
                        {t(`sectors.services.${sector.slug}.name`)}
                      </h2>

                      {/* Short description — appears on hover */}
                      <p
                        className="text-white/70 text-sm leading-relaxed mb-4 max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {t(`sectors.services.${sector.slug}.short`)}
                      </p>

                      {/* CTA */}
                      <div
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all duration-200 group-hover:gap-3"
                        style={{ background: accent, color: '#15171f', boxShadow: `0 4px 14px ${accent}44` }}
                      >
                        {t("common.readMore")} <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            </motion.div>
          </AnimatePresence>

          {/* ── CTA banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-14 relative overflow-hidden rounded-2xl"
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&q=80)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-khwarizmia-navy/95 to-khwarizmia-navy/75" />

            <div className="relative px-10 py-14 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("sectors.contactCta")}</h2>
              <p className="text-gray-200 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
                {t("sectors.contactDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact-support"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 shadow-lg"
                  style={{ background: '#caa35e', color: '#15171f' }}
                >
                  {t("common.contactUs")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/request-demo"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/30 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  {t("common.requestQuote")}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>

    <Footer />
  </>
  );
};

export default SecteursList;
