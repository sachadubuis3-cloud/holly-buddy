import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Property={id:string;name:string;description:string|null;city:string|null;country:string|null;max_guests:number|null;bedrooms:number|null;bathrooms:number|null;status:string};
type Image={storage_path:string;alt_text:string|null;sort_order:number;is_primary:boolean};
type GuideSection={id:string;section_type:string;title:string;content:string;sort_order:number;is_enabled:boolean};
type Service={id:string;name:string;description:string|null;category:string;duration_minutes:number|null;schedule_text:string|null;mode:string;capacity:number|null;location_text:string|null};

export default function PublicProperty({token}:{token:string}){
 const [p,setP]=useState<Property|null>(null);
 const [imgs,setImgs]=useState<Image[]>([]);
 const [sections,setSections]=useState<GuideSection[]>([]);
 const [services,setServices]=useState<Service[]>([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  const client=supabase;
  if(!client){setLoading(false);return}
  client.from('properties').select('id,name,description,city,country,max_guests,bedrooms,bathrooms,status').eq('public_token',token).eq('status','active').maybeSingle().then(async({data})=>{
   if(data){
    setP(data as Property);
    const [imagesResult,guideResult,linksResult]=await Promise.all([
     client.from('property_images').select('storage_path,alt_text,sort_order,is_primary').eq('property_id',data.id).order('sort_order'),
     client.from('guide_sections').select('id,section_type,title,content,sort_order,is_enabled').eq('property_id',data.id).eq('is_enabled',true).order('sort_order'),
     client.from('property_services').select('service_id').eq('property_id',data.id)
    ]);
    setImgs((imagesResult.data as Image[])??[]);
    setSections((guideResult.data as GuideSection[])??[]);
    const serviceIds=(linksResult.data??[]).map((x:any)=>x.service_id).filter(Boolean);
    if(serviceIds.length){
     const serviceResult=await client.from('services').select('id,name,description,category,duration_minutes,schedule_text,mode,capacity,location_text').in('id',serviceIds).eq('status','active').order('name');
     setServices((serviceResult.data as Service[])??[]);
    }else setServices([]);
   }
   setLoading(false);
  });
 },[token]);
 if(loading)return <main className="public-property"><div className="public-card">Chargement…</div></main>;
 if(!p)return <main className="public-property"><div className="public-card"><h1>Logement introuvable</h1><p>Ce lien n’est plus disponible.</p></div></main>;
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
