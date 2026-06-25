import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────
type MsgRole = 'client' | 'secretaire' | 'system';
interface Msg   { id: string; role: MsgRole; from: string; text: string; ts: Date; }
interface Convo { id: string; clientName: string; clientEmail: string; subject: string; location: string; platform: string; messages: Msg[]; unread: number; starred: boolean; status: 'open'|'resolved'; }

// ─── Demo conversations ───────────────────────────────────────────────────────
const d = (iso: string) => new Date(iso);
const m = (id:string,role:MsgRole,from:string,text:string,ts:Date): Msg => ({id,role,from,text,ts});

const DEMO_CONVOS: Convo[] = [
  {
    id:'c1', clientName:'Ahmed TAZI', clientEmail:'ahmed.tazi@gmail.com', subject:'Devis vidéosurveillance entrepôt', location:'Safi, Maroc', platform:'Email', starred:true, status:'open', unread:2,
    messages:[
      m('1','client','Ahmed TAZI','Bonjour, je souhaite un devis pour la vidéosurveillance de mon entrepôt industriel à Safi. Surface ~800m², 3 entrées.',d('2026-06-18T09:30:00')),
      m('2','secretaire','Aicha','Bonjour M. TAZI ! Nous serions ravis de vous aider. Pourriez-vous préciser le nombre de caméras souhaité (extérieur/intérieur) et si vous avez besoin d\'enregistrement 24h/24 ?',d('2026-06-18T10:15:00')),
      m('3','client','Ahmed TAZI','Au moins 6 caméras extérieures et 4 intérieures. Enregistrement oui, idéalement cloud ou NVR local.',d('2026-06-18T11:20:00')),
      m('4','client','Ahmed TAZI','Pouvez-vous aussi inclure un système de contrôle d\'accès pour les 3 entrées ?',d('2026-06-18T11:22:00')),
    ],
  },
  {
    id:'c2', clientName:'Fatima MANSOURI', clientEmail:'f.mansouri@outlook.ma', subject:'Installation solaire — résidence', location:'Marrakech, Maroc', platform:'Site web', starred:false, status:'open', unread:1,
    messages:[
      m('5','client','Fatima MANSOURI','Bonjour, nous souhaitons installer des panneaux solaires pour notre villa à Marrakech. Consommation mensuelle ~400 kWh.',d('2026-06-17T14:00:00')),
      m('6','secretaire','Aicha','Bonjour Mme MANSOURI ! Pour une consommation de 400 kWh/mois, nous recommandons une installation de 3 à 4 kWc. Avez-vous un toit plat ou incliné ?',d('2026-06-17T15:30:00')),
      m('7','client','Fatima MANSOURI','Toit terrasse, environ 60m² disponibles. Quel est le délai de retour sur investissement ?',d('2026-06-18T08:45:00')),
    ],
  },
  {
    id:'c3', clientName:'Karim BENSOUDA', clientEmail:'k.bensouda@gmail.com', subject:'Réseau fibre optique — siège social', location:'Casablanca, Maroc', platform:'Téléphone', starred:false, status:'open', unread:0,
    messages:[
      m('8','client','Karim BENSOUDA','Bonjour, nous voulons déployer un réseau fibre optique pour notre siège social de 3 étages, environ 80 postes.',d('2026-06-16T10:00:00')),
      m('9','secretaire','Aicha','Bonjour M. BENSOUDA ! Pour 80 postes répartis sur 3 étages, nous prévoyons généralement un backbone fibre inter-étages et un câblage cuivre Cat6 en bout. Avez-vous déjà un local technique ?',d('2026-06-16T11:00:00')),
      m('10','client','Karim BENSOUDA','Oui, nous avons un local de 4m² au rez-de-chaussée. Pas de baie informatique actuellement.',d('2026-06-16T11:30:00')),
      m('11','secretaire','Aicha','Parfait. Nous pouvons prévoir la fourniture et installation d\'une baie 19" complète avec patch panel, switch managé et onduleur. Je vous prépare un devis sous 48h.',d('2026-06-16T14:00:00')),
    ],
  },
  {
    id:'c4', clientName:'Sara JENNANE', clientEmail:'sara.j@entreprise.ma', subject:'Maintenance préventive — usine', location:'Safi, Maroc', platform:'Email', starred:true, status:'open', unread:3,
    messages:[
      m('12','client','Sara JENNANE','Bonjour, nous avons besoin d\'un contrat de maintenance préventive pour notre usine. Équipements électriques, automates Siemens S7 et réseau informatique.',d('2026-06-18T07:00:00')),
      m('13','client','Sara JENNANE','Le site est en fonctionnement 24h/24. Nous avons besoin d\'interventions trimestrielles minimum.',d('2026-06-18T07:01:00')),
      m('14','client','Sara JENNANE','Avez-vous des références dans le secteur industriel à Safi ?',d('2026-06-18T07:05:00')),
    ],
  },
  {
    id:'c5', clientName:'Omar ALAOUI', clientEmail:'o.alaoui@hotmail.com', subject:'Réclamation — délai installation', location:'El Jadida, Maroc', platform:'Téléphone', starred:false, status:'open', unread:0,
    messages:[
      m('15','client','Omar ALAOUI','Bonjour, j\'attends toujours l\'installation électrique planifiée depuis 3 semaines. Personne ne répond à mes appels.',d('2026-06-15T09:00:00')),
      m('16','secretaire','Aicha','Bonjour M. ALAOUI, je vous présente nos sincères excuses pour ce retard. Je consulte votre dossier immédiatement. Votre SIP est le ?',d('2026-06-15T09:30:00')),
      m('17','client','Omar ALAOUI','SIP 525402705.',d('2026-06-15T09:35:00')),
      m('18','secretaire','Aicha','Merci. Votre dossier est bien en cours. L\'équipe Omar est planifiée pour intervenir le 20/06/2026. Je vous confirme par SMS dès que la date est validée. Encore désolée pour l\'attente.',d('2026-06-15T10:00:00')),
    ],
  },
  {
    id:'c6', clientName:'Nadia TAHIRI', clientEmail:'nadia.t@business.ma', subject:'Automatisation ligne de production', location:'Settat, Maroc', platform:'Site web', starred:false, status:'resolved', unread:0,
    messages:[
      m('19','client','Nadia TAHIRI','Bonjour, nous voulons automatiser notre ligne de production. Actuellement tout est manuel.',d('2026-06-10T10:00:00')),
      m('20','secretaire','Aicha','Bonjour Mme TAHIRI ! Pouvez-vous décrire les opérations à automatiser ? Nombre de machines, type de process (convoyeur, dosage, conditionnement...) ?',d('2026-06-10T11:00:00')),
      m('21','client','Nadia TAHIRI','Convoyeurs x3 + dosage automatique + contrôle qualité visuel. Capacité 200 unités/heure.',d('2026-06-10T14:00:00')),
      m('22','secretaire','Aicha','Merci Mme TAHIRI. Nous prévoyons une visite technique le 15/06 à 10h. Un devis complet vous sera remis sous 5 jours après la visite.',d('2026-06-10T15:00:00')),
      m('23','system','Système','Dossier marqué comme résolu le 17/06/2026.',d('2026-06-17T17:00:00')),
    ],
  },
];

// ─── Smart Reply generator ───────────────────────────────────────────────────
function smartReply(convo: Convo, secName: string): string {
  const last = [...convo.messages].reverse().find(m => m.role === 'client')?.text || '';
  const l = last.toLowerCase();
  if (/devis|prix|tarif|coût|budget/i.test(l))
    return `Merci pour ces précisions. Je prépare un devis personnalisé sous 24-48h. Avez-vous une contrainte budgétaire ou de délai particulière à respecter ?`;
  if (/délai|quand|date|planif|disponible|rendez-vous/i.test(l))
    return `Notre équipe technique peut intervenir sous 48 à 72h selon disponibilité. Quel créneau vous conviendrait le mieux cette semaine ?`;
  if (/réclamation|plainte|problème|retard|attente|réponse/i.test(l))
    return `Nous vous présentons nos sincères excuses pour ce désagrément. Je transmets votre dossier en priorité au responsable technique et vous rappelle dans les 2h.`;
  if (/maintenance|contrat|préventive|curative/i.test(l))
    return `Nous proposons des contrats de maintenance sur mesure : mensuel, trimestriel ou annuel. Souhaitez-vous que je vous envoie notre catalogue de prestations avec les tarifs indicatifs ?`;
  if (/référence|client|témoignage|expérience/i.test(l))
    return `Nous travaillons avec plus de 20 clients référencés à Safi et région, dont RADEES, Lafarge Placo Maroc, l'OFPPT et plusieurs établissements universitaires. Souhaitez-vous des contacts de référence ?`;
  if (/fibre|réseau|internet|câblage|informatique/i.test(l))
    return `Pour votre infrastructure réseau, nous préconisons une étude préalable gratuite sur site. Êtes-vous disponible cette semaine pour une visite de notre ingénieur réseaux ?`;
  if (/solaire|photovoltaïque|énergie|panneau/i.test(l))
    return `Le retour sur investissement moyen est de 4 à 6 ans selon la configuration. Je vous prépare une simulation de production et de rentabilité sur 25 ans. Puis-je vous demander votre facture ONEE mensuelle ?`;
  return `Merci pour votre message. Notre équipe KSSI Tech traite votre demande avec la plus grande attention. Je reviens vers vous sous 24h avec une réponse complète.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]||'?')[0]+((p[1]||'')[0]||'')).toUpperCase();
}
function colorFor(name: string): string {
  const c = ['#16c79a','#5b8def','#9b7ce6','#e0876b','#d9a93e','#3fb6c4','#c46fa8'];
  let h = 0; for (const ch of name) h = (h*31+ch.charCodeAt(0))>>>0;
  return c[h%c.length];
}
function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now()-d.getTime())/60000);
  if (mins < 60)  return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins/60)}h`;
  return `${Math.floor(mins/1440)}j`;
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}
function fmtDateTime(d: Date): string {
  return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})+' '+fmtTime(d);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const Avatar: React.FC<{name:string;size?:number;online?:boolean}> = ({name,size=40,online}) => (
  <div style={{position:'relative',flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:'50%',background:colorFor(name),color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.32,fontWeight:700}}>
      {initials(name)}
    </div>
    {online!==undefined&&<span style={{position:'absolute',bottom:0,right:0,width:10,height:10,borderRadius:'50%',background:online?'#16c79a':'#b6bac6',border:'2px solid #fff'}}/>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Inbox: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate          = useNavigate();
  const role: string      = (user as any)?.user_metadata?.role || 'client';
  const myName: string    = (user as any)?.user_metadata?.full_name || 'Utilisateur';
  const myEmail: string   = user?.email || '';

  // Conversations state
  const [convos,      setConvos]      = useState<Convo[]>(DEMO_CONVOS);
  const [activeId,    setActiveId]    = useState<string>(role==='client' ? 'c1' : 'c1');
  const [msgInput,    setMsgInput]    = useState('');
  const [search,      setSearch]      = useState('');
  const [showSmart,   setShowSmart]   = useState(false);
  const [smartText,   setSmartText]   = useState('');
  const [filter,      setFilter]      = useState<'all'|'open'|'resolved'>('all');
  const chatEndRef                    = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  // For clients: only show/access their own convo (simulate c1 for client@)
  const visibleConvos = useMemo(()=>{
    let list = role === 'client'
      ? convos.filter(c => c.clientEmail === myEmail || c.id === 'c1') // client sees their own
      : convos;
    if (filter !== 'all') list = list.filter(c => c.status === filter);
    if (search) list = list.filter(c =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  },[convos, role, myEmail, filter, search]);

  const activeConvo = convos.find(c => c.id === activeId) || convos[0];

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}); },[activeId, convos]);
  useEffect(()=>{ if(activeConvo) setSmartText(smartReply(activeConvo, myName)); },[activeId]);

  // Mark as read when opening
  useEffect(()=>{
    setConvos(prev => prev.map(c => c.id===activeId ? {...c, unread:0} : c));
  },[activeId]);

  const totalUnread = convos.reduce((s,c)=>s+c.unread,0);

  const sendMessage = (text: string, asSmart = false) => {
    if (!text.trim()) return;
    const msgRole: MsgRole = role === 'client' ? 'client' : 'secretaire';
    const newMsg: Msg = {
      id: Date.now().toString(), role: msgRole, from: myName, text: text.trim(), ts: new Date(),
    };
    setConvos(prev => prev.map(c => c.id===activeId ? {...c, messages:[...c.messages, newMsg]} : c));
    setMsgInput('');
    if (asSmart) setShowSmart(false);
    setTimeout(()=> chatEndRef.current?.scrollIntoView({behavior:'smooth'}), 50);
    // Auto-regenerate smart reply after sending (secretaire)
    if (role === 'secretaire') {
      setTimeout(()=>{ if(activeConvo) setSmartText(smartReply({...activeConvo, messages:[...activeConvo.messages, newMsg]}, myName)); }, 200);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(msgInput); }
  };

  const toggleStar = (id: string) => setConvos(prev=>prev.map(c=>c.id===id?{...c,starred:!c.starred}:c));
  const resolveConvo = (id: string) => setConvos(prev=>prev.map(c=>c.id===id?{...c,status:'resolved'}:c));

  const ACCENT = '#6c5ce6';
  const canReply = role === 'secretaire';
  const readOnly = role === 'directeur';

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#f4f5f9',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:'#1d2030',overflow:'hidden'}}>
      <Helmet>
        <title>Messagerie | KSSI Tech</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Helmet>

      {/* ── TOP BAR ── */}
      <div style={{background:'#fff',borderBottom:'1px solid #eef0f4',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',height:58,flexShrink:0,boxShadow:'0 1px 8px rgba(30,35,60,.04)'}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/dashboard')}>
          <div style={{width:36,height:36,borderRadius:10,background:'#15171f',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:15,fontWeight:900,color:'#caa35e'}}>K</span>
          </div>
          <span style={{fontSize:16,fontWeight:800,letterSpacing:-.3}}>KSSI<span style={{color:'#caa35e'}}> Tech</span></span>
        </div>

        {/* Nav */}
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {[['Vue d\'ensemble','/dashboard'],['Inbox','/inbox']].map(([label,path])=>{
            const active = path === '/inbox';
            return (
              <div key={path} onClick={()=>navigate(path)}
                style={{padding:'7px 16px',borderRadius:20,fontSize:13.5,fontWeight:600,cursor:'pointer',
                  background:active?ACCENT:'transparent',color:active?'#fff':'#6c7184',border:active?'none':'1.5px solid #eef0f4',transition:'all .15s'}}>
                {label}
                {label==='Inbox'&&totalUnread>0&&(
                  <span style={{display:'inline-block',marginLeft:6,minWidth:18,height:18,borderRadius:9,background:active?'rgba(255,255,255,.3)':'#ef5b54',color:'#fff',fontSize:10,fontWeight:700,lineHeight:'18px',textAlign:'center',padding:'0 5px'}}>{totalUnread}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* User */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* Role badge */}
          <div style={{padding:'5px 12px',borderRadius:8,background:role==='secretaire'?'#eceafe':role==='directeur'?'#e4f7ef':'#fff3e0',color:role==='secretaire'?ACCENT:role==='directeur'?'#16a06f':'#d99a2b',fontSize:12,fontWeight:700}}>
            {role==='secretaire'?'Secrétaire':role==='directeur'?'Directeur':'Client'}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <Avatar name={myName} size={32} online={true}/>
            <div style={{fontSize:13,fontWeight:600,color:'#1d2030'}}>{myName}</div>
          </div>
          <div onClick={()=>{ signOut(); navigate('/login'); }}
            style={{padding:'6px 12px',borderRadius:8,background:'#f4f5f8',color:'#6c7184',fontSize:12.5,fontWeight:600,cursor:'pointer'}}>
            ✕ Déconnexion
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 340px',overflow:'hidden'}}>

        {/* ── LEFT — Active conversation ── */}
        <div style={{display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid #eef0f4'}}>

          {/* Conversation header */}
          <div style={{background:'#fff',borderBottom:'1px solid #eef0f4',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <Avatar name={activeConvo.clientName} size={42} online={true}/>
              <div>
                <div style={{fontSize:16,fontWeight:800,letterSpacing:-.2}}>{activeConvo.clientName}</div>
                <div style={{fontSize:12.5,color:'#9398a8',fontWeight:500,marginTop:1}}>
                  {activeConvo.location} · {activeConvo.platform} · {activeConvo.clientEmail}
                </div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {/* Subject pill */}
              <div style={{fontSize:12,fontWeight:600,color:'#6c7184',background:'#f4f5f8',padding:'5px 12px',borderRadius:8,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {activeConvo.subject}
              </div>
              <div onClick={()=>toggleStar(activeConvo.id)} style={{cursor:'pointer',fontSize:18,color:activeConvo.starred?'#d9a93e':'#c2c6d2'}}>
                {activeConvo.starred?'★':'☆'}
              </div>
              {(canReply && activeConvo.status==='open') && (
                <div onClick={()=>resolveConvo(activeConvo.id)}
                  style={{padding:'6px 14px',borderRadius:9,background:'#e4f7ef',color:'#16a06f',fontSize:12.5,fontWeight:700,cursor:'pointer'}}>
                  ✓ Résolu
                </div>
              )}
              {activeConvo.status==='resolved'&&<span style={{fontSize:12,fontWeight:600,color:'#16a06f',background:'#e4f7ef',padding:'4px 10px',borderRadius:7}}>Résolu</span>}
              <div style={{fontSize:16,color:'#c2c6d2',cursor:'pointer'}}>⋮</div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16,background:'#f8f9fc'}}>
            {activeConvo.messages.map((msg,i)=>{
              const isMe = (canReply && msg.role==='secretaire') || (role==='client' && msg.role==='client');
              const isSystem = msg.role==='system';
              const showDate = i===0 || new Date(msg.ts).toDateString()!==new Date(activeConvo.messages[i-1].ts).toDateString();
              return (
                <React.Fragment key={msg.id}>
                  {showDate&&(
                    <div style={{textAlign:'center',fontSize:11.5,color:'#b6bac6',fontWeight:600,margin:'4px 0'}}>
                      {msg.ts.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
                    </div>
                  )}
                  {isSystem ? (
                    <div style={{textAlign:'center',fontSize:12,color:'#9398a8',fontWeight:500,padding:'6px 12px',background:'#eef0f4',borderRadius:8,margin:'0 auto',maxWidth:400}}>
                      {msg.text}
                    </div>
                  ) : (
                    <div style={{display:'flex',gap:10,alignItems:'flex-end',flexDirection:isMe?'row-reverse':'row'}}>
                      {!isMe&&<Avatar name={msg.from} size={32}/>}
                      <div style={{maxWidth:'62%',display:'flex',flexDirection:'column',gap:4,alignItems:isMe?'flex-end':'flex-start'}}>
                        {!isMe&&<div style={{fontSize:11.5,color:'#9398a8',fontWeight:600,marginBottom:1}}>{msg.from} · {fmtTime(msg.ts)}</div>}
                        <div style={{
                          padding:'11px 15px',borderRadius:isMe?'18px 18px 4px 18px':'18px 18px 18px 4px',
                          background:isMe?ACCENT:'#fff',
                          color:isMe?'#fff':'#1d2030',
                          fontSize:14,fontWeight:500,lineHeight:1.55,
                          boxShadow:'0 1px 6px rgba(30,35,60,.07)',
                        }}>
                          {msg.text}
                        </div>
                        {isMe&&<div style={{fontSize:11,color:'#b6bac6',fontWeight:500}}>{fmtTime(msg.ts)} · Envoyé</div>}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div ref={chatEndRef}/>
          </div>

          {/* ── Smart Reply (secretaire only) ── */}
          {canReply && activeConvo.status==='open' && (
            <div style={{background:'#fff',borderTop:'1px solid #eef0f4',flexShrink:0}}>
              {showSmart ? (
                <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#f0eeff,#eef6ff)',borderTop:'2px solid '+ACCENT+'33'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,fontWeight:700,color:ACCENT}}>
                      <span style={{fontSize:15}}>✨</span> Smart Reply
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <div onClick={()=>setSmartText(smartReply(activeConvo, myName))}
                        title="Régénérer" style={{width:32,height:32,borderRadius:9,background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,border:'1px solid #e4e6ef'}}>⟳</div>
                      <div onClick={()=>{ setMsgInput(smartText); setShowSmart(false); inputRef.current?.focus(); }}
                        title="Modifier" style={{width:32,height:32,borderRadius:9,background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,border:'1px solid #e4e6ef'}}>✏</div>
                      <div onClick={()=>sendMessage(smartText, true)}
                        title="Envoyer" style={{width:32,height:32,borderRadius:9,background:ACCENT,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,color:'#fff',boxShadow:`0 4px 10px rgba(108,92,230,.35)`}}>➤</div>
                    </div>
                  </div>
                  <p style={{fontSize:13.5,color:'#1d2030',fontWeight:500,lineHeight:1.6,margin:0}}>{smartText}</p>
                  <div style={{fontSize:11.5,color:'#9398a8',marginTop:10,fontStyle:'italic'}}>Cette réponse est générée par KSSI AI. Vérifiez avant d'envoyer.</div>
                </div>
              ) : (
                <div style={{padding:'8px 20px',display:'flex',alignItems:'center',gap:10,background:'#fafafa',borderTop:'1px solid #eef0f4'}}>
                  <div style={{display:'flex',gap:8,flex:1,flexWrap:'wrap'}}>
                    {['Smart Reply','Résumé message','Suggestions suivi'].map((label,i)=>(
                      <div key={i} onClick={()=>{ if(i===0) setShowSmart(true); }}
                        style={{display:'flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:10,border:'1.5px solid #eef0f4',background:'#fff',fontSize:12.5,fontWeight:600,color:'#4a4f63',cursor:'pointer',transition:'all .12s'}}
                        onMouseEnter={e=>(e.currentTarget.style.borderColor=ACCENT)}
                        onMouseLeave={e=>(e.currentTarget.style.borderColor='#eef0f4')}>
                        {['✨','📋','💡'][i]} {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{padding:'12px 20px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flex:1,background:'#f4f5f8',borderRadius:14,padding:'11px 16px',border:'1.5px solid #eef0f4',transition:'border-color .15s'}}
                  onFocus={e=>{(e.currentTarget as HTMLElement).style.borderColor=ACCENT;}} onBlur={e=>{(e.currentTarget as HTMLElement).style.borderColor='#eef0f4';}}>
                  <span style={{color:'#b6bac6',fontSize:16,cursor:'pointer'}}>📎</span>
                  <input ref={inputRef} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Répondre au client…"
                    style={{flex:1,border:'none',background:'transparent',fontSize:13.5,fontWeight:500,color:'#1d2030',outline:'none'}}/>
                </div>
                <div onClick={()=>sendMessage(msgInput)}
                  style={{width:40,height:40,borderRadius:12,background:msgInput.trim()?ACCENT:'#e4e6ef',color:msgInput.trim()?'#fff':'#b6bac6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,cursor:msgInput.trim()?'pointer':'default',transition:'all .15s',flexShrink:0,boxShadow:msgInput.trim()?`0 4px 12px rgba(108,92,230,.35)`:undefined}}>
                  ➤
                </div>
                <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6c5ce6,#5b8def)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,cursor:'pointer',flexShrink:0,boxShadow:'0 4px 12px rgba(108,92,230,.25)',color:'#fff'}}
                  onClick={()=>setShowSmart(s=>!s)} title="Smart Reply AI">
                  ✨
                </div>
              </div>
              <div style={{textAlign:'center',fontSize:11,color:'#c2c6d2',paddingBottom:10,fontWeight:500}}>KSSI AI peut se tromper. Vérifiez les informations importantes.</div>
            </div>
          )}

          {/* ── Client: input (only send) ── */}
          {role==='client' && activeConvo.status==='open' && (
            <div style={{background:'#fff',borderTop:'1px solid #eef0f4',padding:'14px 20px 18px',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{flex:1,display:'flex',alignItems:'center',gap:10,background:'#f4f5f8',borderRadius:14,padding:'11px 16px',border:'1.5px solid transparent',transition:'border-color .15s'}}
                  onFocusCapture={e=>(e.currentTarget.style.borderColor=ACCENT)} onBlurCapture={e=>(e.currentTarget.style.borderColor='transparent')}>
                  <span style={{color:'#b6bac6',fontSize:16}}>📎</span>
                  <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Envoyer un message à la secrétaire…"
                    style={{flex:1,border:'none',background:'transparent',fontSize:13.5,fontWeight:500,color:'#1d2030',outline:'none'}}/>
                </div>
                <div onClick={()=>sendMessage(msgInput)}
                  style={{width:40,height:40,borderRadius:12,background:msgInput.trim()?ACCENT:'#e4e6ef',color:msgInput.trim()?'#fff':'#b6bac6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,cursor:msgInput.trim()?'pointer':'default',transition:'all .15s',flexShrink:0}}>
                  ➤
                </div>
              </div>
              <div style={{textAlign:'center',fontSize:11.5,color:'#b6bac6',marginTop:8,fontWeight:500}}>Notre secrétaire vous répondra dans les meilleurs délais.</div>
            </div>
          )}

          {/* ── Directeur: read-only notice ── */}
          {readOnly && (
            <div style={{background:'#f8f9fc',borderTop:'1px solid #eef0f4',padding:'14px 20px',textAlign:'center',color:'#9398a8',fontSize:13,fontWeight:500,flexShrink:0}}>
              👔 Mode lecture seule — Seule la secrétaire peut répondre aux clients.
            </div>
          )}

          {activeConvo.status==='resolved'&&(
            <div style={{background:'#e4f7ef',borderTop:'1px solid #c2e8d6',padding:'12px 20px',textAlign:'center',color:'#16a06f',fontSize:13,fontWeight:600,flexShrink:0}}>
              ✓ Conversation résolue
            </div>
          )}
        </div>

        {/* ── RIGHT — Message list ── */}
        <div style={{display:'flex',flexDirection:'column',background:'#fff',overflow:'hidden'}}>
          {/* Header */}
          <div style={{padding:'16px 18px 12px',borderBottom:'1px solid #eef0f4',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:-.2}}>
                {role==='client'?'Mes messages':'Tous les messages'}
                {totalUnread>0&&<span style={{marginLeft:8,fontSize:12,fontWeight:700,color:'#ef5b54',background:'#fdecec',padding:'2px 8px',borderRadius:7}}>{totalUnread} non lu{totalUnread>1?'s':''}</span>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{fontSize:13,fontWeight:700,color:ACCENT,cursor:'pointer'}}>
                  Toutes les plateformes ▾
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#f4f5f8',borderRadius:11,padding:'8px 13px',marginBottom:10}}>
              <span style={{color:'#b6bac6',fontSize:14}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"
                style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:500,color:'#1d2030',outline:'none'}}/>
            </div>

            {/* Filter tabs */}
            {role!=='client'&&(
              <div style={{display:'flex',gap:6}}>
                {([['all','Tous'],['open','Ouverts'],['resolved','Résolus']] as [typeof filter,string][]).map(([k,l])=>(
                  <div key={k} onClick={()=>setFilter(k)}
                    style={{flex:1,textAlign:'center',padding:'6px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                      background:filter===k?ACCENT:'#f4f5f8',color:filter===k?'#fff':'#6c7184',transition:'all .15s'}}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation list */}
          <div style={{flex:1,overflowY:'auto'}}>
            {visibleConvos.length===0&&(
              <div style={{padding:24,textAlign:'center',color:'#b6bac6',fontSize:13,fontWeight:500}}>Aucun message trouvé</div>
            )}
            {visibleConvos.map(c=>{
              const lastMsg = c.messages[c.messages.length-1];
              const isActive = c.id===activeId;
              return (
                <div key={c.id} onClick={()=>setActiveId(c.id)}
                  style={{padding:'14px 18px',borderBottom:'1px solid #f3f4f8',cursor:'pointer',background:isActive?'#f0eeff':'#fff',transition:'background .1s',position:'relative'}}>
                  {isActive&&<div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:ACCENT,borderRadius:'0 3px 3px 0'}}/>}
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <Avatar name={c.clientName} size={42} online={c.status==='open'}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                        <div style={{fontSize:14,fontWeight:c.unread>0?800:600,color:'#1d2030',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:160}}>
                          {c.clientName}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                          <span style={{fontSize:11.5,color:'#9398a8',fontWeight:500}}>{timeAgo(lastMsg.ts)}</span>
                          {c.starred&&<span style={{color:'#d9a93e',fontSize:12}}>★</span>}
                        </div>
                      </div>
                      <div style={{fontSize:12.5,color:'#9398a8',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {lastMsg.role==='system'?'[Système] ':lastMsg.role==='secretaire'?'Vous : ':''}{lastMsg.text}
                      </div>
                      {c.unread>0&&(
                        <div style={{marginTop:4,display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:18,height:18,borderRadius:9,background:'#ef5b54',color:'#fff',fontSize:10,fontWeight:700,padding:'0 5px'}}>
                          {c.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New conversation (client or secretary) */}
          {(role==='client'||role==='secretaire')&&(
            <div style={{padding:'14px 18px',borderTop:'1px solid #eef0f4',flexShrink:0}}>
              <div style={{padding:'11px 16px',borderRadius:12,background:`linear-gradient(135deg,${ACCENT}18,#5b8def18)`,border:`1.5px dashed ${ACCENT}44`,textAlign:'center',cursor:'pointer',fontSize:13,fontWeight:600,color:ACCENT}}
                onClick={()=>{
                  if(role==='client'){
                    const newC: Convo = {
                      id:'c-new-'+Date.now(), clientName: myName, clientEmail: myEmail,
                      subject:'Nouvelle demande', location:'Maroc', platform:'Web',
                      messages:[{id:'n1',role:'client',from:myName,text:'Bonjour, j\'ai une nouvelle demande.',ts:new Date()}],
                      unread:0, starred:false, status:'open'
                    };
                    setConvos(prev=>[newC,...prev]);
                    setActiveId(newC.id);
                  }
                }}>
                + {role==='client'?'Nouvelle demande':'Nouveau message'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
