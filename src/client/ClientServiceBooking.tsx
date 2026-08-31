import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Service = { id: string; name: string; description: string | null; category: string; duration_minutes: number | null; capacity: number | null; location_text: string | null; price?: number | null; currency?: string | null; };

type Props = { service: Service; providerId?: string; propertyId: string; hostOrganizationId: string; };

export default function ClientServiceBooking({ service, providerId, propertyId, hostOrganizationId }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ scheduledAt: '', guests: '1', name: '', email: '', phone: '', notes: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !providerId) { setMessage('Ce service ne peut pas encore être réservé.'); return; }
    setSaving(true); setMessage('');
    const guests = Math.max(1, Number(form.guests) || 1);
    const unitPrice = Number(service.price ?? 0);
    const { error } = await supabase.from('service_reservations').insert({
      host_organization_id: hostOrganizationId,
      provider_id: providerId,
      provider_service_id: service.id,
      requested_by: null,
      property_id: propertyId,
      scheduled_at: new Date(form.scheduledAt).toISOString(),
      guests_count: guests,
      unit_price: unitPrice,
      currency: service.currency || 'CHF',
      total_price: unitPrice * guests,
      guest_name: form.name.trim() || null,
      guest_email: form.email.trim() || null,
      guest_phone: form.phone.trim() || null,
      guest_notes: form.notes.trim() || null,
      status: 'pending'
    });
    if (error) setMessage(`Impossible d'envoyer la demande : ${error.message}`);
    else { setMessage('Demande envoyée. Le prestataire doit encore la confirmer.'); setForm({ scheduledAt: '', guests: '1', name: '', email: '', phone: '', notes: '' }); }
    setSaving(false);
  };

  if (!providerId) return null;
  return <>
    <button className="host-primary client-service-book" onClick={() => setOpen(true)}>Réserver</button>
    {open && <div className="modal-backdrop"><div className="modal-card client-booking-card">
      <div className="host-panel-head"><div><p className="host-eyebrow">RÉSERVATION</p><h3>{service.name}</h3></div><button className="host-link" type="button" onClick={() => setOpen(false)}>Fermer</button></div>
      <form className="property-form" onSubmit={submit}>
        <label>Date et heure<input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} required /></label>
        <label>Nombre de personnes<input type="number" min="1" max={service.capacity || undefined} value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} required /></label>
        <label>Nom du voyageur<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom complet" required /></label>
        <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voyageur@example.com" required /></label>
        <label>Téléphone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+41..." /></label>
        <label>Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires" rows={3} /></label>
        <p className="host-muted">Total estimé : {(unitPrice(service) * Math.max(1, Number(form.guests) || 1)).toFixed(2)} {service.currency || 'CHF'}</p>
        {message && <div className="message">{message}</div>}
        <div className="property-actions"><button type="button" onClick={() => setOpen(false)}>Annuler</button><button className="host-primary" disabled={saving}>{saving ? 'Envoi…' : 'Envoyer la demande'}</button></div>
      </form>
    </div></div>}
  </>;
}

function unitPrice(service: Service) { return Number(service.price ?? 0); }
