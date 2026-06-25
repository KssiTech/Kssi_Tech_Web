import { useState, useRef } from "react";
import { Menu, Search, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Services", href: "/secteurs" },
  { name: "About Us", href: "/about-us" },
  { name: "News", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        className="rounded-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        style={{ background: "rgba(8, 8, 12, 0.72)", backdropFilter: "blur(20px)" }}
      >
        <div className="px-5 h-[62px] grid grid-cols-3 items-center gap-4">

          {/* LEFT — user icon + pill nav buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate(user ? "/dashboard" : "/contact?mode=signin")}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/45 transition-all"
              aria-label="User account"
            >
              <User className="w-[15px] h-[15px]" />
            </motion.button>

            <div className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3.5 py-[6px] rounded-full border border-white/18 text-white/70 text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-white/10 hover:text-white hover:border-white/38 transition-all duration-200"
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* CENTER — logo (always visible, truly centered via grid) */}
          <motion.div
            className="flex items-center justify-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src="/logo_Khwarizmia_light.png"
              alt="KSSI Tech logo"
              className="w-8 h-8 object-contain"
            />
            <div className="hidden sm:flex flex-col items-center leading-none">
              <span
                className="font-bold text-[15px] text-white tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                KSSI TECH
              </span>
              <span className="text-[8px] uppercase tracking-[0.22em] mt-0.5 font-semibold" style={{color:'#caa35e'}}>
                Leading Technical Future World
              </span>
            </div>
          </motion.div>

          {/* RIGHT — search + login + hamburger */}
          <div className="flex items-center justify-end gap-2">

            {/* Inline search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-[7px] rounded-full border border-white/15 hover:border-white/28 transition-all"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate("/contact")}
                placeholder="Search services…"
                className="bg-transparent text-white/65 text-[11px] outline-none w-32 placeholder:text-white/30"
              />
              <Search className="w-[13px] h-[13px] text-white/30 flex-shrink-0" />
            </div>

            {/* Login / Dashboard */}
            <motion.button
              onClick={() => navigate(user ? "/dashboard" : "/contact?mode=signin")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block px-4 py-[7px] rounded-full bg-white text-black text-[11px] font-bold hover:bg-white/90 transition-all"
            >
              {user ? "Dashboard" : "Login"}
            </motion.button>

            {/* Mobile menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/45 transition-all"
                  aria-label="Open menu"
                >
                  <Menu className="w-[15px] h-[15px]" />
                </motion.button>
              </SheetTrigger>
              <SheetContent
                className="border-white/10 text-white"
                style={{ background: "rgba(6,6,10,0.97)", backdropFilter: "blur(24px)" }}
              >
                <div className="flex flex-col gap-5 mt-8">
                  {/* Brand header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img src="/logo_Khwarizmia_light.png" alt="KSSI Tech" className="w-9 h-9 object-contain" />
                    <div>
                      <h2 className="font-bold text-lg text-white leading-tight">KSSI TECH</h2>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{color:'#caa35e'}}>Leading Technical Future World</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <nav className="space-y-0.5">
                    {navItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => { setIsMobileMenuOpen(false); navigate(item.href); }}
                        className="w-full text-left px-4 py-3 rounded-xl text-white/75 hover:bg-white/8 hover:text-white transition-all text-sm font-medium"
                      >
                        {item.name}
                      </button>
                    ))}
                  </nav>

                  {/* CTA */}
                  <motion.button
                    onClick={() => { setIsMobileMenuOpen(false); navigate(user ? "/dashboard" : "/contact?mode=signin"); }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-3 py-3 rounded-xl bg-white text-black font-bold text-sm"
                  >
                    {user ? "Go to Dashboard" : "Login"}
                  </motion.button>
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
