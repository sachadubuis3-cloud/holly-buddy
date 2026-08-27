import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function App() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');

  useEffect(() => {
    if (!supabase) {
      setStatus('not-configured');
      return;
    }

    supabase.from('organizations').select('id', { count: 'exact', head: true }).then(({ error }) => {
      setStatus(error ? 'error' : 'connected');
    });
  }, []);

  const label = !isSupabaseConfigured
    ? 'Supabase environment variables pending'
    : status === 'checking'
      ? 'Checking Supabase connection…'
      : status === 'connected'
        ? 'Supabase connected'
        : 'Supabase connection needs attention';

  return (
    <main className="app-shell">
      <section className="foundation-card" aria-labelledby="app-title">
        <p className="eyebrow">Foundation</p>
        <h1 id="app-title">Holly Buddy</h1>
        <p>Application foundation initialized.</p>
        <div className={`status status-${status}`} role="status">
          <span className="status-dot" aria-hidden="true" />
          {label}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
