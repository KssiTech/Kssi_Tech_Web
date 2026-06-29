import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type DemoUser = { email: string; name: string; role: string; badge: string; color: string; desc: string };

const DEMO_USERS: DemoUser[] = [
  { email: 'secretaire@kssitech.ma', name: 'Aicha Benmoussa',    role: 'Secrétaire', badge: '✉',  color: '#1E5FA8', desc: 'Répond aux clients, gère les messages' },
  { email: 'directeur@kssitech.ma',  name: 'Mohammed El Fassi', role: 'Directeur',  badge: '👔', color: '#059669', desc: 'Lecture seule de toutes les conversations' },
  { email: 'client@kssitech.ma',     name: 'Ahmed TAZI',         role: 'Client',     badge: '👤', color: '#D97706', desc: 'Envoie des messages à la secrétaire' },
];

const Login: React.FC = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Identifiants incorrects.');
    } else {
      const redirect = params.get('redirect');
      navigate(redirect ? decodeURIComponent(redirect) : '/dashboard', { replace: true });
    }
  };

  const fill = (u: Pick<DemoUser, 'email' | 'color'> & Partial<DemoUser>) => {
    setEmail(u.email);
    setPassword('kssi2024');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Brand header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0A1628] shadow-xl mb-3">
            <span className="text-xl font-black" style={{ color: '#caa35e' }}>K</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            KSSI <span style={{ color: '#caa35e' }}>Tech</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Tableau de bord · Suivi FTTH</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Left — login form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-7 border border-slate-200/80 dark:border-slate-700">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Connexion</h2>
            <p className="text-xs text-slate-400 font-medium mb-6">
              Entrez vos identifiants ou choisissez un profil ci-contre.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.07em] mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5FA8]/30 focus:border-[#1E5FA8] dark:focus:border-[#1E5FA8] transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.07em] mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E5FA8]/30 focus:border-[#1E5FA8] dark:focus:border-[#1E5FA8] transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0A1628] text-[#F4F1EA] text-sm font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion…' : 'Se connecter →'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400 font-medium">
              Mot de passe demo :{' '}
              <span className="font-bold" style={{ color: '#caa35e' }}>kssi2024</span>
            </div>
          </div>

          {/* Right — demo profiles */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.08em] mb-1">
              🔑 Profils de démonstration
            </p>

            {DEMO_USERS.map((u, i) => (
              <div
                key={i}
                onClick={() => fill(u)}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `1.5px solid ${email === u.email ? u.color : 'transparent'}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: u.color + '18', color: u.color }}
                  >
                    {u.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ color: u.color, background: u.color + '18' }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{u.desc}</p>
                    <p className="text-[10.5px] text-slate-300 dark:text-slate-500 mt-0.5 font-medium">{u.email}</p>
                  </div>
                  <span
                    className="text-base font-bold"
                    style={{ color: email === u.email ? u.color : '#c2c6d2' }}
                  >
                    →
                  </span>
                </div>
              </div>
            ))}

            {/* Quick access */}
            <div
              onClick={() => fill({ email: 'demo@kssitech.ma', color: '#caa35e' })}
              className="rounded-xl p-3.5 border cursor-pointer hover:shadow-md transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(202,163,94,0.08), rgba(30,95,168,0.06))',
                borderColor: 'rgba(202,163,94,0.25)',
              }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: '#caa35e' }}>Accès rapide</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-white">
                demo@kssitech.ma — Secrétaire (Hamza)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
