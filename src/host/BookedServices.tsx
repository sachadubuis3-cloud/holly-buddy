import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Reservation={id:string;host_organization_id:string;provider_id:string;provider_service_id:string;scheduled_at:string;guests_count:number;unit_price:number;currency:string;total_price:number;guest_name:string|null;guest_email:string|null;guest_phone:string|null;guest_notes:string|null;status:string;created_at:string};
type Service={id:string;name:string;category:string;duration_minutes:number|null};
type Provider={id:string;business_name:string;public_name:string|null};
type Props={orgId:string};

const labels:Record<string,string>={pending:'En attente',confirmed:'Confirmée',declined:'Refusée',cancelled:'Annulée',completed:'Terminée'};
const statusClass=(s:string)=>`reservation-status status-${s}`;

export default function BookedServices({orgId}:Props){
 const [rows,setRows]=useState<Reservation[]>([]),[services,setServices]=useState<Record<string,Service>>({}),[providers,setProviders]=useState<Record<string,Provider>>({}),[loading,setLoading]=useState(true),[message,setMessage]=useState(''),[selected,setSelected]=useState<Reservation|null>(null);
 const load=async()=>{
  if(!supabase)return;
  setLoading(true);setMessage('');
  const {data,error}=await supabase.from('service_reservations').select('*').eq('host_organization_id',orgId).order('scheduled_at',{ascending:true});
  if(error){setMessage(`Impossible de charger les services réservés : ${error.message}`);setLoading(false);return;}
  const reservations=(data??[]) as Reservation[];setRows(reservations);
  const serviceIds=[...new Set(reservations.map(r=>r.provider_service_id))],providerIds=[...new Set(reservations.map(r=>r.provider_id))];
  if(serviceIds.length){const r=await supabase.from('provider_services').select('id,name,category,duration_minutes').in('id',serviceIds);if(!r.error)setServices(Object.fromEntries(((r.data??[]) as Service[]).map(s=>[s.id,s])));}
  if(providerIds.length){const r=await supabase.from('providers').select('id,business_name,public_name').in('id',providerIds);if(!r.error)setProviders(Object.fromEntries(((r.data??[]) as Provider[]).map(p=>[p.id,p])));}
  setLoading(false);
 };
 useEffect(()=>{void load();},[orgId]);
 const now=new Date();
 const upcoming=useMemo(()=>rows.filter(r=>new Date(r.scheduled_at)>=now&&['pending','confirmed'].includes(r.status)),[rows]);
 const confirmed=rows.filter(r=>r.status==='confirmed'),pending=rows.filter(r=>r.status==='pending');
 const formatDate=(v:string)=>new Intl.DateTimeFormat('fr-CH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
 return <div className="host-content">
  <section className="host-welcome"><div><p className="host-eyebrow">EXPLOITATION</p><h2>Services réservés</h2><p className="host-muted">Vue opérationnelle des prestations demandées à vos prestataires.</p></div><button type="button" className="host-link" onClick={()=>void load()} disabled={loading}>{loading?'Actualisation…':'Actualiser'}</button></section>
  <section className="host-kpis">
   <div className="host-kpi"><span>Total</span><strong>{rows.length}</strong><small>Services réservés</small></div>
   <div className="host-kpi"><span>À venir</span><strong>{upcoming.length}</strong><small>Demandes ou prestations à venir</small></div>
   <div className="host-kpi"><span>Confirmés</span><strong>{confirmed.length}</strong><small>Prestations validées</small></div>
   <div className="host-kpi"><span>En attente</span><strong>{pending.length}</strong><small>Réponse du prestataire</small></div>
  </section>
  <section className="host-panel">
   <div className="host-panel-head"><div><p className="host-eyebrow">PLANIFICATION</p><h3>Prestations à venir</h3></div></div>
   {message&&<div className="message">{message}</div>}
   {loading?<div className="host-empty"><span>Chargement des prestations…</span></div>:upcoming.length===0?<div className="host-empty"><strong>Aucune prestation à venir</strong><span>Les réservations confirmées ou en attente apparaîtront ici.</span></div>:<div className="reservation-list">{upcoming.map(r=>{const s=services[r.provider_service_id],p=providers[r.provider_id];return <article className="reservation-card" key={r.id}><button type="button" className="reservation-card-button" onClick={()=>setSelected(r)}><div className="reservation-main"><div><p className="host-eyebrow">{s?.category||'Service'}</p><h3>{s?.name||'Prestation'}</h3><strong>{p?.public_name||p?.business_name||'Prestataire'}</strong></div><span className={statusClass(r.status)}>{labels[r.status]||r.status}</span></div><div className="reservation-details"><span>📅 {formatDate(r.scheduled_at)}</span><span>👥 {r.guests_count} personne{r.guests_count>1?'s':''}</span><span>💰 {Number(r.total_price).toFixed(2)} {r.currency}</span></div>{r.guest_name&&<div className="reservation-contact">👤 {r.guest_name}{r.guest_email&&` · ${r.guest_email}`}</div>}<span className="reservation-view-hint">Voir le détail →</span></button></article>;})}</div>}
  </section>
  <section className="host-panel"><div className="host-panel-head"><div><p className="host-eyebrow">RÉPARTITION</p><h3>Services réservés</h3></div></div>{rows.length===0?<div className="host-empty"><strong>Aucune donnée</strong><span>La répartition apparaîtra dès qu'une prestation sera réservée.</span></div>:<div className="host-list">{Object.values(services).map(s=>{const count=rows.filter(r=>r.provider_service_id===s.id).length;return <div className="host-list-row" key={s.id}><div><strong>{s.name}</strong><span>{s.category}{s.duration_minutes?` · ${s.duration_minutes} min`:''}</span></div><span className="host-status">{count} réservation{count>1?'s':''}</span></div>})}</div>}</section>
  {selected&&<div className="reservation-modal-backdrop" role="presentation" onClick={()=>setSelected(null)}><section className="reservation-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="host-panel-head"><div><p className="host-eyebrow">DÉTAIL DE LA PRESTATION</p><h3>{services[selected.provider_service_id]?.name||'Prestation'}</h3></div><button type="button" className="host-link" onClick={()=>setSelected(null)}>Fermer</button></div><div className="reservation-modal-status"><span className={statusClass(selected.status)}>{labels[selected.status]||selected.status}</span></div><div className="reservation-detail-grid"><div><small>Prestataire</small><strong>{providers[selected.provider_id]?.public_name||providers[selected.provider_id]?.business_name||'Prestataire'}</strong></div><div><small>Date et heure</small><strong>{formatDate(selected.scheduled_at)}</strong></div><div><small>Personnes</small><strong>{selected.guests_count}</strong></div><div><small>Total</small><strong>{Number(selected.total_price).toFixed(2)} {selected.currency}</strong></div><div><small>Voyageur</small><strong>{selected.guest_name||'Non renseigné'}</strong></div><div><small>Email</small><strong>{selected.guest_email||'Non renseigné'}</strong></div><div><small>Téléphone</small><strong>{selected.guest_phone||'Non renseigné'}</strong></div><div><small>Prix unitaire</small><strong>{Number(selected.unit_price).toFixed(2)} {selected.currency}</strong></div></div>{selected.guest_notes&&<div className="reservation-notes"><strong>Notes</strong><br/>{selected.guest_notes}</div>}<small className="reservation-id">Réservation : {selected.id}</small></section></div>}
 </div>;
}
