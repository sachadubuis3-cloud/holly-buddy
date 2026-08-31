import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Provider={id:string;profile_code:string;business_name:string;public_name:string|null;description:string|null;email:string|null;phone:string|null;website:string|null;city:string|null;region:string|null;country:string|null;status:string};
type Props={provider:Provider;onSignOut:()=>void;onSwitchToHost?:()=>void};

export default function ProviderPortal({provider,onSignOut,onSwitchToHost}:Props){
 const [connectionCount,setConnectionCount]=useState<number|null>(null);
 const [message,setMessage]=useState('');
 useEffect(()=>{
  if(!supabase)return;
  supabase.from('host_provider_connections').select('id',{count:'exact',head:true}).eq('provider_id',provider.id).then(({count,error})=>{
   if(error){setMessage('Les demandes de connexion seront disponibles après configuration des droits Provider.');return}
   setConnectionCount(count??0);
  });
 },[provider.id]);
 return <main className="provider-app">
  <header className="provider-header"><div className="provider-brand"><div className="provider-logo">H</div><div><strong>Holly Buddy</strong><span>PROVIDER PLATFORM</span></div></div><div className="provider-header-actions">{onSwitchToHost&&<button onClick={onSwitchToHost}>Espace hôte</button>}<button onClick={onSignOut}>Se déconnecter</button></div></header>
  <div className="provider-content">
   <section className="provider-welcome"><div><p className="provider-eyebrow">Espace prestataire</p><h1>Bonjour 👋</h1><p>Gérez votre activité et vos connexions avec les hôtes Holly Buddy.</p></div><span className={`provider-badge ${provider.status}`}>{provider.status}</span></section>
   <section className="provider-grid">
    <div className="provider-card"><p className="provider-eyebrow">Profil</p><h2>{provider.public_name||provider.business_name}</h2><p>{provider.description||'Votre profil prestataire est prêt à être configuré.'}</p><div className="provider-meta"><span>Code : {provider.profile_code}</span>{provider.city&&<span>{provider.city}{provider.region?`, ${provider.region}`:''}</span>}{provider.email&&<span>{provider.email}</span>}</div></div>
    <div className="provider-card"><p className="provider-eyebrow">Connexions</p><h2>{connectionCount===null?'—':connectionCount}</h2><p>Demande{connectionCount===1?'':'s'} de connexion reçue{connectionCount===1?'':'s'}.</p></div>
   </section>
   <section className="provider-card"><div className="provider-card-head"><div><p className="provider-eyebrow">Demandes</p><h2>Demandes de connexion</h2></div></div><div className="provider-empty"><strong>Aucune demande à afficher</strong><span>Les demandes envoyées par les hôtes apparaîtront ici.</span></div>{message&&<div className="provider-message">{message}</div>}</section>
   <section className="provider-grid"><div className="provider-card"><p className="provider-eyebrow">Catalogue</p><h2>Services</h2><p>Les prestations proposées aux hôtes seront configurées ici.</p><button disabled>Gérer les services</button></div><div className="provider-card"><p className="provider-eyebrow">Activité</p><h2>Réservations</h2><p>Les réservations issues des hôtes connectés apparaîtront ici.</p><button disabled>Voir les réservations</button></div></section>
  </div>
 </main>;
}
