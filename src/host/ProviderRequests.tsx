import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Props={orgId:string};
type RequestRow={id:string;host_organization_id:string;provider_id:string;requested_by:string|null;status:string;created_at:string;host_organization?:{name?:string|null}|null};

export default function ProviderRequests({orgId}:Props){
 const [rows,setRows]=useState<RequestRow[]>([]); const [loading,setLoading]=useState(true); const [message,setMessage]=useState(''); const [busy,setBusy]=useState<string|null>(null);
 const load=async()=>{if(!supabase||!orgId){setLoading(false);return}setLoading(true);const {data,error}=await supabase.from('host_provider_connections').select('id,host_organization_id,provider_id,requested_by,status,created_at').eq('provider_id',orgId).eq('status','pending').order('created_at',{ascending:false});if(error){setMessage(`Impossible de charger les demandes : ${error.message}`)}else setRows((data??[]) as RequestRow[]);setLoading(false)};
 useEffect(()=>{void load()},[orgId]);
 const decide=async(id:string,status:'connected'|'disconnected')=>{if(!supabase)return;setBusy(id);setMessage('');const {error}=await supabase.from('host_provider_connections').update({status,connected_at:status==='connected'?new Date().toISOString():null,disconnected_at:status==='disconnected'?new Date().toISOString():null}).eq('id',id).eq('provider_id',orgId);if(error)setMessage(`Impossible de traiter la demande : ${error.message}`);else await load();setBusy(null)};
 return <section className="host-panel"><div className="host-panel-head"><div><p className="host-eyebrow">CONNEXIONS</p><h3>Demandes reçues</h3></div></div>{message&&<div className="message">{message}</div>}{loading?<div className="host-empty"><span>Chargement des demandes…</span></div>:rows.length===0?<div className="host-empty"><strong>Aucune demande en attente</strong><span>Les demandes de connexion des hôtes apparaîtront ici.</span></div>:<div className="provider-connections">{rows.map(r=><div className="provider-connection" key={r.id}><div><strong>Demande de connexion</strong><span>Reçue le {new Date(r.created_at).toLocaleDateString('fr-CH')}</span></div><div><button type="button" onClick={()=>void decide(r.id,'connected')} disabled={busy===r.id}>Accepter</button><button type="button" onClick={()=>void decide(r.id,'disconnected')} disabled={busy===r.id}>Refuser</button></div></div>)}</div>}</section>;
}
