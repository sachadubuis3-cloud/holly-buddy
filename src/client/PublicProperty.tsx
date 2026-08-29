import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Property={id:string;name:string;description:string|null;city:string|null;country:string|null;max_guests:number|null;bedrooms:number|null;bathrooms:number|null};
type Image={storage_path:string;alt_text:string|null;sort_order:number;is_primary:boolean};
type GuideSection={id:string;section_type:string;title:string;content:string;sort_order:number};
type Service={id:string;name:string;description:string|null;category:string;duration_minutes:number|null;schedule_text:string|null;mode:string;capacity:number|null;location_text:string|null};

type PublicPayload={property:Property;images:Image[];guide_sections:GuideSection[];services:Service[]};

export default function PublicProperty({token}:{token:string}){
 const [payload,setPayload]=useState<PublicPayload|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{
   const client=supabase;
   if(!client){setLoading(false);return;}
   const {data,error}=await client.rpc('get_public_property',{p_token:token});
   if(!error&&data) setPayload(data as PublicPayload);
   setLoading(false);
 })()},[token]);
 if(loading)return <main className="public-property"><div className="public-card">Chargement…</div></main>;
 if(!payload)return <main className="public-property"><div className="public-card"><h1>Logement introuvable</h1><p>Ce lien n’est plus disponible.</p></div></main>;
 const {property:p,images:imgs,guide_sections:sections,services}=payload;
 const image=(x:string)=>supabase?.storage.from('public-assets').getPublicUrl(x).data.publicUrl||'';
 return <main className="public-property"><div className="public-inner">
  <header className="public-hero"><p>HOLLY BUDDY</p><h1>{p.name}</h1><span>{[p.city,p.country].filter(Boolean).join(', ')}</span></header>
  {imgs.length>0&&<div className="public-gallery">{imgs.map(i=><img key={i.storage_path} src={image(i.storage_path)} alt={i.alt_text||p.name}/>)}</div>}
  <section className="public-card"><h2>Bienvenue</h2>{p.description&&<p>{p.description}</p>}<div className="public-meta"><span>{p.max_guests??'—'} voyageurs</span><span>{p.bedrooms??'—'} chambres</span><span>{p.bathrooms??'—'} salles de bain</span></div></section>
  {services.length>0&&<section className="public-guide"><div className="public-guide-heading"><p>SERVICES & ACTIVITÉS</p><h2>À découvrir pendant votre séjour</h2></div><div className="property-grid">{services.map(s=><article className="property-card" key={s.id}><div className="property-body"><span className="host-eyebrow">{s.category}</span><h3>{s.name}</h3>{s.description&&<p>{s.description}</p>}<div className="property-meta"><span>{s.duration_minutes?s.duration_minutes+' min':'Durée à définir'}</span><span>{s.capacity?s.capacity+' pers.':'Capacité à définir'}</span><span>{s.location_text||'Lieu à définir'}</span></div>{s.schedule_text&&<p className="host-muted">{s.schedule_text}</p>}</div></article>)}</div></section>}
  {sections.length>0&&<section className="public-guide"><div className="public-guide-heading"><p>GUIDE DU SÉJOUR</p><h2>Tout ce qu’il faut savoir</h2></div>{sections.map(s=><article className="public-card public-guide-section" key={s.id}><p className="public-guide-type">{s.section_type}</p><h2>{s.title}</h2><div className="public-guide-content">{s.content}</div></article>)}</section>}
  {sections.length===0&&services.length===0&&<section className="public-card"><h2>Votre séjour</h2><p>Le guide client Holly Buddy sera bientôt disponible.</p></section>}
 </div></main>;
}
