import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Reservation = {
  id: string;
  host_organization_id: string;
  provider_id: string;
  provider_service_id: string;
  requested_by: string | null;
  scheduled_at: string;
  guests_count: number;
  unit_price: number;
  currency: string;
  total_price: number;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Service = { id: string; name: string; category: string };
type Provider = { id: string; business_name: string; public_name: string | null; profile_code: string };
type Props = { orgId: string };
type Filter = 'all' | 'upcoming' | 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

const labels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  declined: 'Refusée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

const statusClass = (s: string) => `reservation-status status-${s}`;

export default function Reservations({ orgId }: Props) {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Reservation | null>(null);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('service_reservations')
      .select('*')
      .eq('host_organization_id', orgId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      setMessage(`Impossible de charger les réservations : ${error.message}`);
      setLoading(false);
      return;
    }

    const reservations = (data ?? []) as Reservation[];
    setRows(reservations);

    const serviceIds = [...new Set(reservations.map((r) => r.provider_service_id))];
    const providerIds = [...new Set(reservations.map((r) => r.provider_id))];

    if (serviceIds.length) {
      const r = await supabase.from('provider_services').select('id,name,category').in('id', serviceIds);
      if (!r.error) setServices(Object.fromEntries(((r.data ?? []) as Service[]).map((s) => [s.id, s])));
    }

    if (providerIds.length) {
      const r = await supabase.from('providers').select('id,business_name,public_name,profile_code').in('id', providerIds);
      if (!r.error) setProviders(Object.fromEntries(((r.data ?? []) as Provider[]).map((p) => [p.id, p])));
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [orgId]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('fr-CH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  const upcoming = rows.filter(
    (r) => new Date(r.scheduled_at) >= new Date() && ['pending', 'confirmed'].includes(r.status),
  );

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'upcoming') return upcoming;
    return rows.filter((r) => r.status === filter);
  }, [filter, rows, upcoming]);

  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: 'all', label: 'Toutes', count: rows.length },
    { key: 'upcoming', label: 'À venir', count: upcoming.length },
    { key: 'pending', label: 'En attente', count: rows.filter((r) => r.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmées', count: rows.filter((r) => r.status === 'confirmed').length },
    { key: 'declined', label: 'Refusées', count: rows.filter((r) => r.status === 'declined').length },
    { key: 'cancelled', label: 'Annulées', count: rows.filter((r) => r.status === 'cancelled').length },
    { key: 'completed', label: 'Terminées', count: rows.filter((r) => r.status === 'completed').length },
  ];

  return (
    <div className="host-content">
      <section className="host-welcome">
        <div>
          <p className="host-eyebrow">EXPLOITATION</p>
          <h2>Réservations</h2>
          <p className="host-muted">Suivez les demandes envoyées à vos prestataires et l'état de chaque prestation.</p>
        </div>
        <button type="button" className="host-link" onClick={() => void load()} disabled={loading}>
          {loading ? 'Actualisation…' : 'Actualiser'}
        </button>
      </section>

      <section className="host-kpis">
        <div className="host-kpi"><span>Total</span><strong>{rows.length}</strong><small>Réservations enregistrées</small></div>
        <div className="host-kpi"><span>À venir</span><strong>{upcoming.length}</strong><small>Demandes ou réservations confirmées</small></div>
        <div className="host-kpi"><span>En attente</span><strong>{rows.filter((r) => r.status === 'pending').length}</strong><small>Réponse du prestataire attendue</small></div>
        <div className="host-kpi"><span>Confirmées</span><strong>{rows.filter((r) => r.status === 'confirmed').length}</strong><small>Prestations confirmées</small></div>
      </section>

      <section className="host-panel">
        <div className="host-panel-head">
          <div><p className="host-eyebrow">HISTORIQUE</p><h3>Vos réservations</h3></div>
        </div>

        {message && <div className="message">{message}</div>}

        {!loading && rows.length > 0 && (
          <div className="reservation-filters" role="tablist" aria-label="Filtrer les réservations">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                className={filter === item.key ? 'active' : ''}
                onClick={() => setFilter(item.key)}
              >
                {item.label} <span>{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="host-empty"><span>Chargement des réservations…</span></div>
        ) : filteredRows.length === 0 ? (
          <div className="host-empty">
            <strong>{rows.length === 0 ? 'Aucune réservation' : 'Aucune réservation dans ce filtre'}</strong>
            <span>{rows.length === 0 ? 'Les réservations de vos services prestataires apparaîtront ici.' : 'Essayez un autre filtre pour afficher les autres réservations.'}</span>
          </div>
        ) : (
          <div className="reservation-list">
            {filteredRows.map((r) => {
              const service = services[r.provider_service_id];
              const provider = providers[r.provider_id];
              return (
                <article className="reservation-card" key={r.id}>
                  <button type="button" className="reservation-card-button" onClick={() => setSelected(r)} aria-label="Voir le détail de la réservation">
                    <div className="reservation-main">
                      <div>
                        <p className="host-eyebrow">{service?.category || 'Service'}</p>
                        <h3>{service?.name || 'Prestation'}</h3>
                        <strong>{provider?.public_name || provider?.business_name || 'Prestataire'}</strong>
                      </div>
                      <span className={statusClass(r.status)}>{labels[r.status] || r.status}</span>
                    </div>
                    <div className="reservation-details">
                      <span>📅 {formatDate(r.scheduled_at)}</span>
                      <span>👥 {r.guests_count} personne{r.guests_count > 1 ? 's' : ''}</span>
                      <span>💰 {Number(r.total_price).toFixed(2)} {r.currency}</span>
                      {r.guest_name && <span>👤 {r.guest_name}</span>}
                    </div>
                    {r.guest_email && <div className="reservation-contact">{r.guest_email}{r.guest_phone && ` · ${r.guest_phone}`}</div>}
                    {r.guest_notes && <div className="reservation-notes">Note : {r.guest_notes}</div>}
                    <span className="reservation-view-hint">Voir le détail →</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <div className="reservation-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="host-panel-head">
              <div>
                <p className="host-eyebrow">DÉTAIL DE LA RÉSERVATION</p>
                <h3 id="reservation-detail-title">{services[selected.provider_service_id]?.name || 'Prestation'}</h3>
              </div>
              <button type="button" className="host-link" onClick={() => setSelected(null)}>Fermer</button>
            </div>

            <div className="reservation-modal-status">
              <span className={statusClass(selected.status)}>{labels[selected.status] || selected.status}</span>
            </div>

            <div className="reservation-detail-grid">
              <div><small>Prestataire</small><strong>{providers[selected.provider_id]?.public_name || providers[selected.provider_id]?.business_name || 'Prestataire'}</strong></div>
              <div><small>Date et heure</small><strong>{formatDate(selected.scheduled_at)}</strong></div>
              <div><small>Voyageur</small><strong>{selected.guest_name || 'Non renseigné'}</strong></div>
              <div><small>Personnes</small><strong>{selected.guests_count}</strong></div>
              <div><small>Prix unitaire</small><strong>{Number(selected.unit_price).toFixed(2)} {selected.currency}</strong></div>
              <div><small>Total</small><strong>{Number(selected.total_price).toFixed(2)} {selected.currency}</strong></div>
              <div><small>Email</small><strong>{selected.guest_email || 'Non renseigné'}</strong></div>
              <div><small>Téléphone</small><strong>{selected.guest_phone || 'Non renseigné'}</strong></div>
            </div>

            {selected.guest_notes && <div className="reservation-notes"><strong>Notes du voyageur</strong><br />{selected.guest_notes}</div>}
            <small className="reservation-id">Réservation : {selected.id}</small>
          </section>
        </div>
      )}
    </div>
  );
}
