import {useState} from 'react';

type Service={id:string;name:string;description:string;category:string;duration:string;price:string;currency:string;capacity:string;location:string;status:'draft'|'active'|'archived'};

type Props={providerId:string};

const emptyService:Service={id:'',name:'',description:'',category:'',duration:'',price:'',currency:'CHF',capacity:'',location:'',status:'draft'};

export default function ProviderServices({providerId}:Props){
 const [services,setServices]=useState<Service[]>([]);
 const [form,setForm]=useState<Service>(emptyService);
 const [open,setOpen]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const save=()=>{
  if(form.name.trim().length<2||!form.category.trim()){setMessage('Indiquez au minimum un nom et une catégorie.');return}
  if(editing){setServices(current=>current.map(s=>s.id===editing?{...form,id:editing}:s));setMessage('Service modifié dans l’interface.');}
  else{setServices(current=>[...current,{...form,id:`draft-${Date.now()}`}]);setMessage('Service ajouté dans l’interface.');}
  setForm(emptyService);setEditing(null);setOpen(false);
 };
 const edit=(service:Service)=>{setForm(service);setEditing(service.id);setOpen(true);setMessage('')};
 const archive=(id:string)=>setServices(current=>current.map(s=>s.id===id?{...s,status:'archived'}:s));
 const toggle=(id:string)=>setServices(current=>current.map(s=>s.id===id?{...s,status:s.status==='active'?'draft':'active'}:s));
 return <section className="provider-card">
  <div className="provider-card-head"><div><p className="provider-eyebrow">CATALOGUE</p><h2>Services</h2><p>Préparez les prestations proposées aux hôtes connectés.</p></div><button type="button" onClick={()=>{setForm(emptyService);setEditing(null);setOpen(true);setMessage('')}}>Ajouter un service</button></div>
  {services.length===0?<div className="provider-empty"><strong>Aucun service configuré</strong><span>Ajoutez votre première prestation. Elle sera enregistrée dans Supabase dès que le catalogue Provider sera activé.</span></div>:<div className="provider-connections">{services.map(service=><div className="provider-connection" key={service.id}><div><strong>{service.name}</strong><span>{service.category}{service.price?` · ${service.price} ${service.currency}`:''}{service.duration?` · ${service.duration} min`:''}</span><small>{service.status==='active'?'Actif':service.status==='archived'?'Archivé':'Brouillon'}</small></div><div className="provider-actions">{service.status!=='archived'&&<button type="button" onClick={()=>toggle(service.id)}>{service.status==='active'?'Désactiver':'Activer'}</button>}{service.status!=='archived'&&<button type="button" onClick={()=>edit(service)}>Modifier</button>}{service.status!=='archived'&&<button type="button" onClick={()=>archive(service.id)}>Archiver</button>}</div></div>)}</div>}
  {message&&<div className="provider-message">{message}</div>}
  {open&&<div className="provider-modal-backdrop"><div className="provider-modal"><div className="provider-card-head"><div><p className="provider-eyebrow">SERVICE</p><h2>{editing?'Modifier le service':'Ajouter un service'}</h2></div><button type="button" onClick={()=>setOpen(false)}>Fermer</button></div><div className="provider-form-grid"><label>Nom<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex. Transfert aéroport"/></label><label>Catégorie<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Transport"/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Prix<input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Devise<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option>CHF</option><option>EUR</option><option>USD</option></select></label><label>Durée (minutes)<input type="number" min="1" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/></label><label>Capacité<input type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></label><label>Lieu<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Genève"/></label></div><div className="provider-modal-actions"><button type="button" onClick={()=>setOpen(false)}>Annuler</button><button type="button" onClick={save}>Enregistrer</button></div></div></div>}
 </section>;
}
