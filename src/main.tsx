import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Mode = 'login' | 'signup' | 'recovery-request' | 'recovery';
type Organization = { id: string; name: string; type: string; status: string };
type Module = { title: string; description: string; status: 'ready' | 'next' };

const modules: Module[] = [
  { title: 'Tableau de bord', description: 'Vue d’ensemble de votre activité.', status: 'ready' },
  { title: 'Organisation', description: 'Gérer votre organisation et ses membres.', status: 'ready' },
  { title: 'Utilisateurs', description: 'Invitations, rôles et accès.', status: 'next' },
  { title: 'Activité', description: 'Historique des actions importantes.', status: 'next' },
  { title: 'Paramètres', description: 'Configuration de votre espace Holly Buddy.', status: 'next' },
  { title: 'Aide', description: 'Documentation et assistance.', status: 'next' },
];

function App() {
  const [session, setSession] = useState<any>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');

  useEffect(() => {
    if (!supabase) { setStatus('not-configured'); return; }
    supabase.auth.getSession().then(({ data, error }) => { setSession(data.session); setStatus(error ? 'error' : 'connected'); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') { setMode('recovery'); setMessage('Choisis ton nouveau mot de passe.'); }
      if (!nextSession && event !== 'PASSWORD_RECOVERY') setOrganization(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id || mode === 'recovery') return;
    supabase.from('memberships').select('organization_id, organizations(id, name, type, status)').eq('user_id', session.user.id).eq('status', 'active').limit(1).maybeSingle().then(({ data }) => setOrganization((data as any)?.organizations ?? null));
  }, [session, mode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage('');
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } });
      if (error) setMessage(error.message); else if (data.session) setMessage('Compte créé. Bienvenue dans Holly Buddy.'); else setMessage('Compte créé. Vérifie ton e-mail pour confirmer ton adresse.');
    } else if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setMessage(error.message);
    } else if (mode === 'recovery') {
      if (newPassword.length < 6) { setMessage('Le mot de passe doit contenir au moins 6 caractères.'); setBusy(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setMessage(error.message); else { setMessage('Mot de passe mis à jour. Tu peux te connecter.'); await supabase.auth.signOut(); setSession(null); setMode('login'); setNewPassword(''); setPassword(''); }
    }
    setBusy(false);
  };

  const sendRecovery = async (event: React.FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage(''); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setMessage(error ? error.message : 'Lien de récupération envoyé. Vérifie ton e-mail.'); setBusy(false);
  };

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage(''); const { data: sessionData } = await supabase.auth.getSession(); const accessToken = sessionData.session?.access_token;
    if (!accessToken) { setMessage('Session expirée. Reconnecte-toi.'); setBusy(false); return; }
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-organization`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name: organizationName, type: 'host' }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(payload.error || 'Impossible de créer l’organisation.'); else { setOrganization(payload.organization); setOrganizationName(''); setMessage('Organisation créée. Tu es maintenant propriétaire.'); }
    setBusy(false);
  };

  const signOut = async () => { if (!supabase) return; await supabase.auth.signOut(); setMessage('Session fermée.'); setMode('login'); };

  if (!isSupabaseConfigured) return <main className="app-shell"><section className="foundation-card"><p className="eyebrow">Foundation</p><h1>Holly Buddy</h1><p>Supabase environment variables pending.</p></section></main>;
  if (mode === 'recovery') return <main className="app-shell"><section className="auth-card"><p className="eyebrow">Holly Buddy</p><h1>Nouveau mot de passe</h1><p className="muted">Définis un nouveau mot de passe pour ton compte.</p><form onSubmit={submit}><label>Nouveau mot de passe<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} autoComplete="new-password" required /></label><button className="button" disabled={busy}>{busy ? 'Mise à jour…' : 'Définir le nouveau mot de passe'}</button></form>{message && <div className="message" role="status">{message}</div>}</section></main>;

  if (session && organization) return <main className="dashboard-shell"><header className="topbar"><div className="brand"><span className="brand-mark">H</span><div><strong>Holly Buddy</strong><span>{organization.name}</span></div></div><div className="topbar-actions"><span className="status status-connected compact"><span className="status-dot" /> Connecté</span><button className="text-button" onClick={signOut}>Se déconnecter</button></div></header><div className="dashboard-content"><section className="hero"><div><p className="eyebrow">Tableau de bord</p><h1>Bienvenue 👋</h1><p className="muted">Votre espace <strong>{organization.name}</strong> est prêt.</p></div><div className="organization-badge"><span>Organisation</span><strong>{organization.name}</strong><small>{organization.type} · {organization.status}</small></div></section><section className="stats-grid"><div className="stat-card"><span>Organisation</span><strong>1</strong><small>Espace actif</small></div><div className="stat-card"><span>Votre rôle</span><strong>Owner</strong><small>Accès administrateur</small></div><div className="stat-card"><span>Membres</span><strong>1</strong><small>Utilisateur actif</small></div></section><section><div className="section-heading"><div><p className="eyebrow">Modules</p><h2>Votre espace de travail</h2></div></div><div className="module-grid">{modules.map((item) => <article className="module-card" key={item.title}><div className="module-icon">{item.title.slice(0, 1)}</div><div className="module-copy"><h3>{item.title}</h3><p>{item.description}</p></div><span className={`module-status ${item.status}`}>{item.status === 'ready' ? 'Disponible' : 'Bientôt'}</span></article>)}</div></section><section className="organization-panel"><div><p className="eyebrow">Espace sécurisé</p><h2>{organization.name}</h2><p className="muted">Les données de votre organisation sont isolées par les règles de sécurité Supabase.</p></div><div className="status status-connected"><span className="status-dot" /> RLS actif</div></section></div></main>;

  if (session) return <main className="app-shell"><section className="dashboard-card"><div><p className="eyebrow">Holly Buddy</p><h1>Bienvenue 👋</h1><p className="muted">Tu es connecté avec {session.user.email}.</p></div><div className="status status-connected"><span className="status-dot" /> Supabase connected</div><div className="organization-panel"><h2>Créer ton organisation</h2><p className="muted">Cette organisation sera ton premier espace Holly Buddy.</p><form onSubmit={createOrganization}><label>Nom de l’organisation<input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Mon organisation" minLength={2} maxLength={120} required /></label><button className="button" disabled={busy}>{busy ? 'Création…' : 'Créer l’organisation'}</button></form></div>{message && <div className="message" role="status">{message}</div>}<button className="button secondary" onClick={signOut}>Se déconnecter</button></section></main>;
  if (mode === 'recovery-request') return <main className="app-shell"><section className="auth-card"><p className="eyebrow">Holly Buddy</p><h1>Mot de passe oublié ?</h1><p className="muted">Entre ton adresse e-mail pour recevoir un lien permettant de définir un nouveau mot de passe.</p><form onSubmit={sendRecovery}><label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" autoComplete="email" required /></label><button className="button" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer le lien de récupération'}</button></form>{message && <div className="message" role="status">{message}</div>}<button className="switch" onClick={() => { setMode('login'); setMessage(''); }}>Retour à la connexion</button><div className="status status-connected"><span className="status-dot" /> Supabase connected</div></section></main>;
  return <main className="app-shell"><section className="auth-card"><p className="eyebrow">Holly Buddy</p><h1>{mode === 'login' ? 'Connexion' : 'Créer ton compte'}</h1><p className="muted">La fondation est prête. Commençons par l’authentification.</p><form onSubmit={submit}>{mode === 'signup' && <label>Nom<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" required /></label>}<label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" autoComplete="email" required /></label><label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label><button className="button" disabled={busy}>{busy ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button></form>{message && <div className="message" role="status">{message}</div>}<button className="switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}</button>{mode === 'login' && <button className="switch" onClick={() => { setMode('recovery-request'); setMessage(''); }}>Mot de passe oublié ?</button>}<div className={`status status-${status}`}><span className="status-dot" /> {status === 'connected' ? 'Supabase connected' : 'Vérification Supabase…'}</div></section></main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
