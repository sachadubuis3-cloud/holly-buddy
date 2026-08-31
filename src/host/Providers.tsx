import {useState} from 'react';

type Props={orgId:string;userId:string};

type ConnectionStatus='pending'|'connected'|'suspended'|'disconnected';

const statusLabel:Record<ConnectionStatus,string>={pending:'En attente',connected:'Connecté',suspended:'Suspendu',disconnected:'Déconnecté'};

export default function Providers({orgId,userId}:Props){
 const [search,setSearch]=useState('');
 const [message,setMessage]=useState('');
 void orgId; void userId;
 const submit=(e:React.FormEvent)=>{e.preventDefault();setMessage(search.trim()?'La recherche sera connectée au registre prestataires dès que le schéma Supabase sera validé.':'Saisissez un nom ou un code profil.');};
 const statuses:ConnectionStatus[]=['connected','pending','suspended','disconnected'];
 return <div className="host-content">
  <section className="host-welcome"><div><p className="host-eyebrow">EXPLOITATION</p><h2>Prestataires</h2><p className="host-muted">Connectez vos prestataires et choisissez les services proposés à vos voyageurs.</p></div></section>
  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">AJOUTER UN PRESTATAIRE</p><h3>Rechercher par nom ou code profil</h3></div></div>
   <form onSubmit={submit} className="provider-search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom commercial ou code profil" aria-label="Nom ou code profil"/><button className="host-primary" type="submit">Rechercher</button></form>
   {message&&<div className="message">{message}</div>}
  </section>
  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">MES PRESTATAIRES</p><h3>Connexions</h3></div></div>
   <div className="host-empty"><strong>Aucun prestataire connecté</strong><span>Les connexions réelles apparaîtront ici après validation du modèle de données.</span></div>
  </section>
  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">STATUTS</p><h3>Cycle de connexion</h3></div></div>
   <div className="provider-statuses">{statuses.map(s=><div className="host-kpi" key={s}><span>{statusLabel[s]}</span><strong>—</strong><small>{s==='connected'?'Services disponibles pour l’hôte':s==='pending'?'Demande envoyée, attente d’acceptation':s==='suspended'?'Connexion temporairement suspendue':'Historique conservé après déconnexion'}</small></div>)}</div>
  </section>
 </div>;
}
