import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, LayoutDashboard, Inbox, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <motion.button
        onClick={() => navigate("/login")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`hidden md:block px-4 py-[7px] rounded-full text-[11px] font-bold transition-all ${
          isDark
            ? "bg-white text-black hover:bg-white/90"
            : "bg-khwarizmia-navy text-khwarizmia-paper hover:bg-stone-800"
        }`}
      >
        {t("nav.login")}
      </motion.button>
    );
  }

  const fullName = String(user.user_metadata?.full_name || profile?.full_name || user.email || "U").trim();
  const emailAddr = user.email || profile?.email || "";
  const parts = fullName.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const firstName = parts[0] || fullName;

  const menuItems = [
    { icon: User, label: "Mon profil", href: "/account" },
    { icon: LayoutDashboard, label: t("nav.dashboard"), href: "/dashboard" },
    { icon: Inbox, label: "Messagerie", href: "/inbox" },
  ];

  const dropdownClasses = isDark
    ? "bg-[rgba(18,18,24,0.98)] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    : "bg-white border-stone-200 shadow-[0_8px_32px_rgba(15,23,42,0.12)]";
  const itemClasses = isDark
    ? "text-white/70 hover:bg-white/8 hover:text-white"
    : "text-stone-700 hover:bg-stone-100 hover:text-khwarizmia-navy";
  const dividerClass = isDark ? "border-white/[0.08]" : "border-stone-100";

  return (
    <div className="relative hidden md:block" ref={ref}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all ${
          isDark
            ? "border-white/20 hover:border-white/40 bg-white/5"
            : "border-stone-300 hover:border-stone-400 bg-stone-50"
        }`}
        aria-label="Menu utilisateur"
      >
        {/* Avatar circle */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden flex-shrink-0 ${
            isDark
              ? "bg-khwarizmia-teal/20 text-khwarizmia-teal"
              : "bg-khwarizmia-navy text-khwarizmia-paper"
          }`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span
          className={`text-[11px] font-semibold max-w-[80px] truncate ${
            isDark ? "text-white/80" : "text-stone-700"
          }`}
        >
          {firstName}
        </span>
        <ChevronDown
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${
            isDark ? "text-white/40" : "text-stone-400"
          } ${open ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 right-0 w-52 rounded-xl border backdrop-blur-xl overflow-hidden z-50 ${dropdownClasses}`}
          >
            {/* User info header */}
            <div className={`px-4 py-3 border-b ${dividerClass}`}>
              <p className={`text-[13px] font-bold truncate ${isDark ? "text-white" : "text-stone-900"}`}>
                {fullName}
              </p>
              <p className={`text-[11px] truncate mt-0.5 ${isDark ? "text-white/45" : "text-stone-400"}`}>
                {emailAddr}
              </p>
            </div>

            {/* Nav items */}
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium transition-all ${itemClasses}`}
                >
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sign out */}
            <div className={`border-t py-1 ${dividerClass}`}>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium transition-all text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
