import React from 'react';

type HostShellProps = { organizationName: string; active: string; onNavigate: (id: string) => void; onSignOut: () => void; children: React.ReactNode };

const groups = [
  { title: 'EXPLOITATION', items: [['dashboard','Dashboard','⌂'],['properties','Mes logements','⌂'],['services','Services & activités','★'],['reservations','Réservations','▣'],['bookings','Services réservés','◆']] },
  { title: 'EXPÉRIENCE CLIENT', items: [['messages','Messages','✉'],['guide','Guide client','▤'],['coupons','Coupons & partenariats','◇'],['reviews','Avis clients','☆']] },
  { title: 'PILOTAGE', items: [['statistics','Statistiques','↗'],['users','Utilisateurs','♙']] },
  { title: 'COMPTE', items: [['settings','Paramètres','⚙'],['billing','Facturation','€'],['support','Aide & support','?']] },
] as const;

export default function HostShell({organizationName, active, onNavigate, onSignOut, children}: HostShellProps) {
 return <div className="host-app">
  <aside className="host-sidebar">
   <div className="host-brand"><div className="host-logo">H</div><div><strong>Holly Buddy</strong><span>HOST PLATFORM</span></div></div>
   <div className="host-org"><span>ORGANISATION</span><strong>{organizationName}</strong></div>
   <nav>{groups.map(g=><div className="host-nav-group" key={g.title}><span className="host-nav-title">{g.title}</span>{g.items.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>onNavigate(id)}><i>{icon}</i>{label}</button>)}</div>)}</nav>
   <div className="host-sidebar-bottom"><button className="host-logout" onClick={onSignOut}>↪ <span>Se déconnecter</span></button></div>
  </aside>
  <main className="host-main"><header className="host-header"><div><span className="host-breadcrumb">Holly Buddy / {active === 'dashboard' ? 'Dashboard' : active}</span><h1>{active === 'dashboard' ? 'Tableau de bord' : groups.flatMap(g=>g.items).find(x=>x[0]===active)?.[1] ?? 'Holly Buddy'}</h1></div><div className="host-header-actions"><button>⌕</button><button>◔</button><div className="host-avatar">HB</div></div></header>{children}</main>
 </div>;
}
