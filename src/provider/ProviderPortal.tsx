import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Provider={id:string;profile_code:string;business_name:string;public_name:string|null;description:string|null;email:string|null;phone:string|null;website:string|null;city:string|null;region:string|null;country:string|null;status:string};
type ConnectionStatus='pending'|'connected'|'suspended'|'disconnected';
type Connection={id:string;host_organization_id:string;requested_by:string|null;status:ConnectionStatus;connected_at:string|null;created_at:string;updated_at:string};
type Props={provider:Provider;onSignOut:()=>void;onSwitchToHost?:()=>void};
const statusLabel:Record<ConnectionStatus,string>={pending:'En attente',connected:'Connecté',suspended:'Suspendu',disconnected:'Déconnecté'};

export default function ProviderPortal({provider,onSignOut,onSwitchToHost}:Props){
 const [connections,setConnections]=useState<Connection[]>([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState('');
 const [updating,setUpdating]=useState<string|null>(null);
 const loadConnections=async()=>{
  if(!supabase){setLoading(false);setMessage('Supabase n’est pas configuré sur ce déploiement.');return}
  setLoading(true);
  const {data,error}=await supabase.from('host_provider_connections').select('id,host_organization_id,requested_by,status,connected_at,created_at,updated_at').eq('provider_id',provider.id).order('created_at',{ascending:false});
  if(error){setMessage(`Impossible de charger les demandes : ${error.message}`);setLoading(false);return}
  setConnections((data??[]) as Connection[]);setLoading(false);
 };
 useEffect(()=>{void loadConnections()},[provider.id]);
 const updateConnection=async(connectionId:string,status:ConnectionStatus)=>{
  if(!supabase)return;
  setUpdating(connectionId);setMessage('');
  const patch=status==='connected'?{status,connected_at:new Date().toISOString(),disconnected_at:null}:{status,disconnected_at:new Date().toISOString()};
  const {error}=await supabase.from('host_provider_connections').update(patch).eq('id',connectionId).eq('provider_id',provider.id);
  if(error){setMessage(`Impossible de mettre à jour la demande : ${error.message}`);setUpdating(null);return}
  setMessage(status==='connected'?'Connexion acceptée.':'Demande refusée.');
  await loadConnections();setUpdating(null);
 };
 const pendingCount=connections.filter(c=>c.status==='pending').length;
 const connectedCount=connections.filter(c=>c.status==='connected').length;
 return <main className="provider-app">
  <header className="provider-header"><div className="provider-brand"><div className="provider-logo">H</div><div><strong>Holly Buddy</strong><span>PROVIDER PLATFORM</span></div></div><div className="provider-header-actions">{onSwitchToHost&&<button onClick={onSwitchToHost}>Espace hôte</button>}<button onClick={onSignOut}>Se déconnecter</button></div></header>
  <div className="provider-content">
   <section className="provider-welcome"><div><p className="provider-eyebrow">Espace prestataire</p><h1>Bonjour 👋</h1><p>Gérez votre activité et vos connexions avec les hôtes Holly Buddy.</p></div><span className={`provider-badge ${provider.status}`}>{provider.status}</span></section>
   <section className="provider-grid">
    <div className="provider-card"><p className="provider-eyebrow">Profil</p><h2>{provider.public_name||provider.business_name}</h2><p>{provider.description||'Votre profil prestataire est prêt à être configuré.'}</p><div className="provider-meta"><span>Code : {provider.profile_code}</span>{provider.city&&<span>{provider.city}{provider.region?`, ${provider.region}`:''}</span>}{provider.email&&<span>{provider.email}</span>}</div></div>
    <div className="provider-card"><p className="provider-eyebrow">Connexions</p><h2>{loading?'—':connections.length}</h2><p>{pendingCount} demande{pendingCount===1?'':'s'} en attente · {connectedCount} connectée{connectedCount===1?'':'s'}.</p></div>
   </section>
   <section className="provider-card"><div className="provider-card-head"><div><p className="provider-eyebrow">DEMANDES</p><h2>Demandes de connexion</h2></div></div>
    {loading?<div className="provider-empty"><span>Chargement des demandes…</span></div>:connections.length===0?<div className="provider-empty"><strong>Aucune demande à afficher</strong><span>Les demandes envoyées par les hôtes apparaîtront ici.</span></div>:<div className="provider-connections">{connections.map(c=><div className="provider-connection" key={c.id}><div><strong>Organisation hôte</strong><span>{c.host_organization_id}</span><small>{statusLabel[c.status]} · {new Date(c.created_at).toLocaleDateString('fr-CH')}</small></div>{c.status==='pending'&&<div className="provider-actions"><button type="button" onClick={()=>void updateConnection(c.id,'connected')} disabled={updating===c.id}>{updating===c.id?'…':'Accepter'}</button><button type="button" onClick={()=>void updateConnection(c.id,'disconnected')} disabled={updating===c.id}>Refuser</button></div>}</div>)}</div>}
    {message&&<div className="provider-message">{message}</div>}
   </section>
   <section className="provider-grid"><div className="provider-card"><p className="provider-eyebrow">Catalogue</p><h2>Services</h2><p>Les prestations proposées aux hôtes seront configurées ici.</p><button disabled>Gérer les services</button></div><div className="provider-card"><p className="provider-eyebrow">Activité</p><h2>Réservations</h2><p>Les réservations issues des hôtes connectés apparaîtront ici.</p><button disabled>Voir les réservations</button></div></section>
  </div>
 </main>;
}
