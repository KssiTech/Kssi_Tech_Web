import { useState, useRef, useEffect } from "react";
import { Menu, Moon, Search, Sun, Globe } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lang } from "@/i18n/translations";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { nameKey: "nav.services", href: "/secteurs" },
    { nameKey: "nav.aboutUs", href: "/about-us" },
    { nameKey: "nav.news", href: "/blog" },
    { nameKey: "nav.contact", href: "/contact" },
  ];

  const headerSurface = isDark
    ? "border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] bg-[rgba(8,8,12,0.72)]"
    : "border-stone-200/90 shadow-[0_8px_40px_rgba(15,23,42,0.12)] bg-[rgba(255,255,255,0.82)]";
  const iconButtonClasses = isDark
    ? "border-white/20 text-white/60 hover:text-white hover:border-white/45"
    : "border-stone-300 text-stone-700 hover:text-khwarizmia-navy hover:border-khwarizmia-teal/40";
  const navButtonClasses = isDark
    ? "border-white/18 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/38"
    : "border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-khwarizmia-navy hover:border-khwarizmia-teal/30";
  const searchContainerClasses = isDark
    ? "border-white/15 bg-white/5 hover:border-white/28"
    : "border-stone-300 bg-white/80 hover:border-khwarizmia-teal/40";
  const searchInputClasses = isDark
    ? "text-white/80 placeholder:text-white/30"
    : "text-stone-700 placeholder:text-stone-400";
  const searchIconClasses = isDark ? "text-white/30" : "text-stone-500";
  const loginButtonClasses = isDark
    ? "bg-white text-black hover:bg-white/90"
    : "bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800";
  const sheetClasses = isDark
    ? "border-white/10 text-white bg-[rgba(6,6,10,0.97)]"
    : "border-stone-200 text-stone-800 bg-[rgba(255,255,255,0.97)]";
  const sheetLinkClasses = isDark
    ? "text-white/75 hover:bg-white/8 hover:text-white"
    : "text-stone-700 hover:bg-stone-100 hover:text-khwarizmia-navy";
  const sheetCtaClasses = isDark
    ? "bg-white text-black"
    : "bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800";
  const dropdownClasses = isDark
    ? "bg-[rgba(18,18,24,0.98)] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    : "bg-white border-stone-200 shadow-[0_8px_32px_rgba(15,23,42,0.12)]";
  const dropdownItemClasses = isDark
    ? "text-white/70 hover:bg-white/8 hover:text-white"
    : "text-stone-700 hover:bg-stone-100 hover:text-khwarizmia-navy";

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        className={`rounded-2xl border backdrop-blur-xl ${headerSurface}`}
      >
        <div className="px-5 h-[62px] grid grid-cols-3 items-center gap-4">

          {/* LEFT — pill nav buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => (
                <motion.button
                  key={item.nameKey}
                  onClick={() => navigate(item.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3.5 py-[6px] rounded-full border text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 ${navButtonClasses}`}
                >
                  {t(item.nameKey)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* CENTER — logo */}
          <motion.div
            className="flex items-center justify-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src={isDark ? "/logo_Khwarizmia_light.png" : "/logo_Khwarizmia.png"}
              alt="KSSI Tech logo"
              className="w-8 h-8 object-contain"
            />
            <div className="hidden sm:flex flex-col items-center leading-none">
              <span
                className={`font-bold text-[15px] tracking-tight ${isDark ? "text-white" : "text-khwarizmia-navy"}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                KSSI TECH
              </span>
              <span className="text-[8px] uppercase tracking-[0.22em] mt-0.5 font-semibold" style={{ color: "#caa35e" }}>
                Leading Technical Future World
              </span>
            </div>
          </motion.div>

          {/* RIGHT — search + lang + theme + login + hamburger */}
          <div className="flex items-center justify-end gap-2">

            {/* Inline search */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-[7px] rounded-full border transition-all ${searchContainerClasses}`}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate("/contact")}
                placeholder={t("nav.search")}
                className={`bg-transparent text-[11px] outline-none w-28 ${searchInputClasses}`}
              />
              <Search className={`w-[13px] h-[13px] flex-shrink-0 ${searchIconClasses}`} />
            </div>

            {/* Language selector */}
            <div className="relative" ref={langRef}>
              <motion.button
                onClick={() => setLangOpen((v) => !v)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={`flex items-center gap-1 px-2.5 py-[6px] rounded-full border text-[11px] font-bold transition-all ${iconButtonClasses}`}
                aria-label="Change language"
              >
                <Globe className="w-[13px] h-[13px]" />
                <span>{lang.toUpperCase()}</span>
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full mt-2 right-0 w-36 rounded-xl border backdrop-blur-xl overflow-hidden z-50 ${dropdownClasses}`}
                  >
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium transition-all ${dropdownItemClasses} ${lang === l.code ? "opacity-100 font-bold" : "opacity-75"}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-khwarizmia-teal" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${iconButtonClasses}`}
              aria-label={isDark ? t("nav.lightMode") : t("nav.darkMode")}
            >
              {isDark ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
            </motion.button>

            {/* Profile dropdown / Login */}
            <ProfileDropdown />

            {/* Mobile menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${iconButtonClasses}`}
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="w-[15px] h-[15px]" />
                </motion.button>
              </SheetTrigger>
              <SheetContent
                className={`border ${sheetClasses}`}
                style={{ backdropFilter: "blur(24px)" }}
              >
                <div className="flex flex-col gap-5 mt-8">
                  {/* Brand header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img src={isDark ? "/logo_Khwarizmia_light.png" : "/logo_Khwarizmia.png"} alt="KSSI Tech" className="w-9 h-9 object-contain" />
                    <div>
                      <h2 className={`font-bold text-lg leading-tight ${isDark ? "text-white" : "text-khwarizmia-navy"}`}>KSSI TECH</h2>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: "#caa35e" }}>Leading Technical Future World</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <nav className="space-y-0.5">
                    {navItems.map((item) => (
                      <button
                        key={item.nameKey}
                        onClick={() => { setIsMobileMenuOpen(false); navigate(item.href); }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${sheetLinkClasses}`}
                      >
                        {t(item.nameKey)}
                      </button>
                    ))}
                  </nav>

                  {/* Language selector in mobile */}
                  <div className="space-y-0.5">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${sheetLinkClasses} ${lang === l.code ? "font-bold" : ""}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <span className="ml-auto w-2 h-2 rounded-full bg-khwarizmia-teal" />}
                      </button>
                    ))}
                  </div>

                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${sheetLinkClasses}`}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? t("nav.lightMode") : t("nav.darkMode")}
                  </button>

                  {/* CTA */}
                  {user ? (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate("/account"); }}
                        className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${sheetLinkClasses}`}
                      >
                        Mon profil
                      </button>
                      <motion.button
                        onClick={() => { setIsMobileMenuOpen(false); navigate("/dashboard"); }}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${sheetCtaClasses}`}
                      >
                        {t("nav.dashboard")}
                      </motion.button>
                      <button
                        onClick={async () => { setIsMobileMenuOpen(false); await signOut(); navigate("/"); }}
                        className="w-full py-2.5 rounded-xl font-medium text-sm transition-all text-red-400 hover:bg-red-500/10"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all ${sheetCtaClasses}`}
                    >
                      {t("nav.login")}
                    </motion.button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </motion.header>
    </div>
  );
};

export default Navigation;
