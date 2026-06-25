import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type DemoUser = { email: string; name: string; role: string; badge: string; color: string; desc: string };
const DEMO_USERS: DemoUser[] = [
  { email: 'secretaire@kssitech.ma', name: 'Aicha Benmoussa', role: 'Secrétaire',  badge: '✉', color: '#6c5ce6', desc: 'Répond aux clients, gère les messages' },
  { email: 'directeur@kssitech.ma',  name: 'Mohammed El Fassi',role: 'Directeur',  badge: '👔', color: '#16a06f', desc: 'Lecture seule de toutes les conversations' },
  { email: 'client@kssitech.ma',     name: 'Ahmed TAZI',       role: 'Client',     badge: '👤', color: '#5b8def', desc: 'Envoie des messages à la secrétaire' },
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
    setError(''); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Identifiants incorrects.');
    } else {
      const redirect = params.get('redirect');
      navigate(redirect ? decodeURIComponent(redirect) : '/dashboard', { replace: true });
    }
  };

  const fill = (u: DemoUser) => { setEmail(u.email); setPassword('kssi2024'); setError(''); };

  const S: Record<string,React.CSSProperties> = {
    page:  {minHeight:'100vh',background:'#eef0f4',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",padding:24},
    wrap:  {width:'100%',maxWidth:860,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'},
    card:  {background:'#fff',borderRadius:22,boxShadow:'0 8px 30px rgba(30,35,60,.08)',padding:'32px 30px'},
    label: {display:'block',fontSize:12,fontWeight:700,color:'#4a4f63',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5},
    input: {width:'100%',padding:'11px 14px',borderRadius:11,border:'1.5px solid #e4e6ef',fontSize:14,fontWeight:500,color:'#1d2030',background:'#f8f9fc',outline:'none',boxSizing:'border-box' as const},
    btn:   {width:'100%',marginTop:4,padding:13,borderRadius:13,background:'#6c5ce6',color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',boxShadow:'0 6px 18px rgba(108,92,230,.35)'},
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Left — login form */}
        <div style={S.card}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:50,height:50,borderRadius:14,background:'#15171f',boxShadow:'0 8px 20px rgba(20,22,30,.25)',marginBottom:12}}>
              <span style={{fontSize:20,fontWeight:900,color:'#caa35e'}}>K</span>
            </div>
            <div style={{fontSize:21,fontWeight:800,color:'#1d2030',letterSpacing:-.3}}>KSSI<span style={{color:'#caa35e'}}> Tech</span></div>
            <div style={{fontSize:12.5,color:'#9398a8',fontWeight:500,marginTop:3}}>Tableau de bord · Suivi FTTH</div>
          </div>

          <h1 style={{fontSize:19,fontWeight:800,color:'#1d2030',margin:'0 0 5px',letterSpacing:-.3}}>Connexion</h1>
          <p style={{fontSize:13,color:'#9398a8',fontWeight:500,margin:'0 0 22px'}}>Entrez vos identifiants ou choisissez un profil ci-contre.</p>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={S.label}>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="votre@email.com" style={S.input}
                onFocus={e=>(e.target.style.borderColor='#6c5ce6')} onBlur={e=>(e.target.style.borderColor='#e4e6ef')}/>
            </div>
            <div>
              <label style={S.label}>Mot de passe</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                placeholder="••••••••" style={S.input}
                onFocus={e=>(e.target.style.borderColor='#6c5ce6')} onBlur={e=>(e.target.style.borderColor='#e4e6ef')}/>
            </div>
            {error && (
              <div style={{background:'#fdecec',border:'1px solid #f9c8c8',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:600,color:'#e0564f'}}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{...S.btn,opacity:loading?.65:1,cursor:loading?'not-allowed':'pointer'}}>
              {loading?'Connexion…':'Se connecter →'}
            </button>
          </form>

          <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'#b6bac6',fontWeight:500}}>
            Mot de passe demo universel : <span style={{color:'#6c5ce6',fontWeight:700}}>kssi2024</span>
          </div>
        </div>

        {/* Right — demo profiles */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontSize:13,fontWeight:700,color:'#6c7184',textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>
            🔑 Profils de démonstration
          </div>
          {DEMO_USERS.map((u,i)=>(
            <div key={i} onClick={()=>fill(u)} style={{background:'#fff',borderRadius:16,padding:'16px 18px',boxShadow:'0 4px 16px rgba(30,35,60,.06)',cursor:'pointer',border:`1.5px solid ${email===u.email?u.color:'transparent'}`,transition:'all .15s'}}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
              <div style={{display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:42,height:42,borderRadius:12,background:u.color+'18',color:u.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{u.badge}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{fontSize:14,fontWeight:700,color:'#1d2030'}}>{u.name}</div>
                    <span style={{fontSize:11,fontWeight:700,color:u.color,background:u.color+'18',padding:'2px 8px',borderRadius:7}}>{u.role}</span>
                  </div>
                  <div style={{fontSize:12,color:'#9398a8',marginTop:2,fontWeight:500}}>{u.desc}</div>
                  <div style={{fontSize:11.5,color:'#b6bac6',marginTop:3,fontWeight:500}}>{u.email}</div>
                </div>
                <div style={{fontSize:16,color:email===u.email?u.color:'#c2c6d2',fontWeight:700}}>→</div>
              </div>
            </div>
          ))}

          {/* Also demo@kssitech.ma shortcut */}
          <div style={{background:'linear-gradient(135deg,#f4f2ff,#eef6ff)',borderRadius:14,padding:'13px 16px',border:'1px solid rgba(108,92,230,.15)',cursor:'pointer'}} onClick={()=>fill({email:'demo@kssitech.ma',name:'',role:'',badge:'',color:'#6c5ce6',desc:''})}>
            <div style={{fontSize:12,fontWeight:700,color:'#6c5ce6',marginBottom:4}}>Accès rapide</div>
            <div style={{fontSize:13,fontWeight:600,color:'#1d2030'}}>demo@kssitech.ma — Secrétaire (Hamza)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
