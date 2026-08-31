import {FormEvent, useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';

type Props={orgId:string;userId:string};
type ConnectionStatus='pending'|'connected'|'suspended'|'disconnected';

type Provider={
 id:string;
 [key:string]:unknown;
};

type Connection={
 id:string;
 provider_id:string;
 host_organization_id:string;
 requested_by:string|null;
 status:ConnectionStatus;
 connected_at:string|null;
 disconnected_at:string|null;
 created_at:string;
 updated_at:string;
 provider?:Provider|null;
};

const statusLabel:Record<ConnectionStatus,string>={pending:'En attente',connected:'Connecté',suspended:'Suspendu',disconnected:'Déconnecté'};

const providerLabel=(provider:Provider)=>{
 const value=['name','commercial_name','display_name','company_name','business_name','profile_code','code'].map(k=>provider[k]).find(v=>typeof v==='string'&&v.trim());
 return value ? String(value) : `Prestataire ${provider.id.slice(0,8)}`;
};

const providerCode=(provider:Provider)=>{
 const value=['profile_code','code','public_code'].map(k=>provider[k]).find(v=>typeof v==='string'&&v.trim());
 return value ? String(value) : '';
};

export default function Providers({orgId,userId}:Props){
 const [search,setSearch]=useState('');
 const [message,setMessage]=useState('');
 const [results,setResults]=useState<Provider[]>([]);
 const [connections,setConnections]=useState<Connection[]>([]);
 const [loading,setLoading]=useState(true);
 const [searching,setSearching]=useState(false);
 const [requesting,setRequesting]=useState<string|null>(null);

 const loadConnections=async()=>{
  if(!supabase||!orgId){setLoading(false);return;}
  setLoading(true);
  const {data,error}=await supabase
   .from('host_provider_connections')
   .select('*')
   .eq('host_organization_id',orgId)
   .order('created_at',{ascending:false});
  if(error){setMessage(`Impossible de charger les connexions : ${error.message}`);setLoading(false);return;}

  const rows=(data??[]) as Connection[];
  const providerIds=rows.map(r=>r.provider_id).filter(Boolean);
  let providers:Provider[]=[];
  if(providerIds.length){
   const response=await supabase.from('providers').select('*').in('id',providerIds);
   if(!response.error) providers=(response.data??[]) as Provider[];
  }
  const byId=new Map(providers.map(p=>[p.id,p]));
  setConnections(rows.map(row=>({...row,provider:byId.get(row.provider_id)??null})));
  setLoading(false);
 };

 useEffect(()=>{void loadConnections();},[orgId]);

 const submit=async(e:FormEvent)=>{
  e.preventDefault();
  const term=search.trim().toLowerCase();
  setMessage('');
  setResults([]);
  if(!term){setMessage('Saisissez un nom ou un code profil.');return;}
  if(!supabase){setMessage('Supabase n’est pas configuré sur ce déploiement.');return;}
  setSearching(true);
  const {data,error}=await supabase.from('providers').select('*').limit(100);
  if(error){setMessage(`Recherche indisponible : ${error.message}`);setSearching(false);return;}
  const matches=((data??[]) as Provider[]).filter(provider=>Object.values(provider).some(value=>typeof value==='string'&&value.toLowerCase().includes(term))).slice(0,10);
  setResults(matches);
  setMessage(matches.length?`${matches.length} prestataire(s) trouvé(s).`:'Aucun prestataire trouvé.');
  setSearching(false);
 };

 const requestConnection=async(providerId:string)=>{
  if(!supabase)return;
  setRequesting(providerId);setMessage('');
  const {error}=await supabase.from('host_provider_connections').insert({
   host_organization_id:orgId,
   provider_id:providerId,
   requested_by:userId,
   status:'pending',
  });
  if(error){setMessage(`Impossible d’envoyer la demande : ${error.message}`);setRequesting(null);return;}
  setMessage('Demande de connexion envoyée.');
  setResults(prev=>prev.filter(p=>p.id!==providerId));
  await loadConnections();
  setRequesting(null);
 };

 const disconnect=async(connection:Connection)=>{
  if(!supabase)return;
  const {error}=await supabase.from('host_provider_connections').update({status:'disconnected',disconnected_at:new Date().toISOString()}).eq('id',connection.id);
  if(error){setMessage(`Impossible de déconnecter le prestataire : ${error.message}`);return;}
  await loadConnections();
 };

 return <div className="host-content">
  <section className="host-welcome"><div><p className="host-eyebrow">EXPLOITATION</p><h2>Prestataires</h2><p className="host-muted">Connectez vos prestataires et choisissez les services proposés à vos voyageurs.</p></div></section>

  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">AJOUTER UN PRESTATAIRE</p><h3>Rechercher par nom ou code profil</h3></div></div>
   <form onSubmit={submit} className="provider-search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom commercial ou code profil" aria-label="Nom ou code profil"/><button className="host-primary" type="submit" disabled={searching}>{searching?'Recherche…':'Rechercher'}</button></form>
   {message&&<div className="message">{message}</div>}
   {results.length>0&&<div className="provider-results">{results.map(provider=><div className="provider-result" key={provider.id}><div><strong>{providerLabel(provider)}</strong>{providerCode(provider)&&<small>Code profil : {providerCode(provider)}</small>}</div><button className="host-primary" type="button" onClick={()=>void requestConnection(provider.id)} disabled={requesting===provider.id}>{requesting===provider.id?'Envoi…':'Demander la connexion'}</button></div>)}</div>}
  </section>

  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">MES PRESTATAIRES</p><h3>Connexions</h3></div></div>
   {loading?<div className="host-empty"><span>Chargement des connexions…</span></div>:connections.length===0?<div className="host-empty"><strong>Aucun prestataire connecté</strong><span>Les demandes et connexions réelles apparaîtront ici.</span></div>:<div className="provider-connections">{connections.map(connection=><div className="provider-connection" key={connection.id}><div><strong>{connection.provider?providerLabel(connection.provider):`Prestataire ${connection.provider_id.slice(0,8)}`}</strong><span>{statusLabel[connection.status]}</span></div><div>{connection.status!=='disconnected'&&<button type="button" onClick={()=>void disconnect(connection)}>Déconnecter</button>}</div></div>)}</div>}
  </section>

  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">STATUTS</p><h3>Cycle de connexion</h3></div></div>
   <div className="provider-statuses">{(['connected','pending','suspended','disconnected'] as ConnectionStatus[]).map(s=><div className="host-kpi" key={s}><span>{statusLabel[s]}</span><strong>{connections.filter(c=>c.status===s).length}</strong><small>{s==='connected'?'Services disponibles pour l’hôte':s==='pending'?'Demande envoyée, attente d’acceptation':s==='suspended'?'Connexion temporairement suspendue':'Historique conservé après déconnexion'}</small></div>)}</div>
  </section>
 </div>;
}
