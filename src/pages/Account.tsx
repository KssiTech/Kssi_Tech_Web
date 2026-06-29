import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, LogOut, LayoutDashboard,
  Inbox, Shield, Camera
} from "lucide-react";

export default function Account() {
  const { user, profile, signOut, uploadAvatar, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"profile" | "security">("profile");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data, error } = await uploadAvatar(file);
    if (!error && data?.publicUrl) {
      await updateProfile({ avatar_url: data.publicUrl });
    }
    setUploading(false);
  };

  const fullName =
    user?.user_metadata?.full_name ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "KSSI TECH User";
  const email = user?.email || profile?.email || "";
  const role: string = (user?.user_metadata?.role as string) || "user";
  const parts = String(fullName).trim().split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : String(fullName).slice(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
    : "—";

  const roleLabel: Record<string, string> = {
    directeur:  "Directeur",
    secretaire: "Secrétaire",
    client:     "Client",
    user:       "Utilisateur",
  };
  const roleColor: Record<string, string> = {
    directeur:  "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
    secretaire: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
    client:     "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",
    user:       "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
  };

  const surface = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"} transition-colors`}>
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl border p-7 mb-6 shadow-sm ${surface}`}
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold shadow-md ${
                isDark ? "bg-slate-700 text-slate-100" : "bg-khwarizmia-navy text-khwarizmia-paper"
              }`}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                  isDark ? "bg-slate-800 border-slate-900 text-slate-300 hover:text-white" : "bg-white border-slate-100 text-slate-500 hover:text-slate-800"
                }`}
                title="Changer l'avatar"
              >
                {uploading ? (
                  <span className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin block" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-xl font-bold">{fullName}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${roleColor[role] || roleColor.user}`}>
                  {roleLabel[role] || role}
                </span>
              </div>
              <p className={`text-sm mt-1 truncate ${muted}`}>{email}</p>
              <p className={`text-xs mt-2 flex items-center gap-1.5 ${muted}`}>
                <Calendar className="w-3.5 h-3.5" />
                Membre depuis {memberSince}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 w-fit ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          {(["profile", "security"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? isDark
                    ? "bg-slate-700 text-white shadow"
                    : "bg-white text-slate-900 shadow"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "profile" ? "Profil" : "Sécurité & Actions"}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border p-6 shadow-sm space-y-4 ${surface}`}
          >
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Informations du profil
            </h2>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <User className={`w-4 h-4 flex-shrink-0 ${muted}`} />
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Nom complet</p>
                <p className="text-sm font-medium">{fullName}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <Mail className={`w-4 h-4 flex-shrink-0 ${muted}`} />
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Adresse e-mail</p>
                <p className="text-sm font-medium">{email}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <Shield className={`w-4 h-4 flex-shrink-0 ${muted}`} />
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Rôle</p>
                <p className={`text-sm font-bold capitalize ${roleColor[role] || roleColor.user} inline-block px-2.5 py-0.5 rounded-lg mt-0.5`}>
                  {roleLabel[role] || role}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security tab */}
        {tab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border p-6 shadow-sm space-y-3 ${surface}`}
          >
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Actions du compte
            </h2>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-khwarizmia-navy text-khwarizmia-paper font-semibold text-sm hover:bg-stone-800 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Tableau de bord
            </button>

            <button
              onClick={() => navigate("/inbox")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all border ${
                isDark
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Inbox className="w-4 h-4" /> Messagerie
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
