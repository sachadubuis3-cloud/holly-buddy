import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="app-shell">
      <section className="foundation-card" aria-labelledby="app-title">
        <p className="eyebrow">Foundation</p>
        <h1 id="app-title">Holly Buddy</h1>
        <p>Application foundation initialized.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
