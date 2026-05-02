
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import AuthPanel from './components/AuthPanel';
import Standings from './components/Standings';
import Predictions from './components/Predictions';
import MyPreds from './components/MyPreds';

const SECTIONS = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠', component: Dashboard },
  { id: 'predictions', label: 'Pronósticos', icon: '⚽', component: Predictions },
  { id: 'standings', label: 'Tabla', icon: '🏅', component: Standings },
  { id: 'mypreds', label: 'Mis Picks', icon: '📋', component: MyPreds },
];

export default function App() {
  const [section, setSection] = useState('dashboard');
  const [logged, setLogged] = useState(true); // Cambia a false para probar AuthPanel

  if (!logged) return <AuthPanel />;

  const SectionComponent = SECTIONS.find(s => s.id === section)?.component || Dashboard;

  return (
    <div style={{minHeight: '100vh', background: '#181824', color: '#fff'}}>
      <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#12121C', borderBottom: '2px solid #FFD700'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span style={{fontSize: '2rem'}}>🏆</span>
          <span style={{fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.7rem', letterSpacing: '3px', background: 'linear-gradient(90deg,#FFD700,#fff,#F5A623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>POLLA MUNDIAL 2026</span>
        </div>
        <nav style={{display: 'flex', gap: '0.5rem'}}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              background: section === s.id ? '#FFD700' : 'transparent',
              color: section === s.id ? '#181824' : '#FFD700',
              border: '1px solid #FFD700',
              borderRadius: 2,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '1rem',
              letterSpacing: '2px',
              cursor: 'pointer',
              fontWeight: section === s.id ? 700 : 400
            }}>{s.icon} {s.label}</button>
          ))}
        </nav>
        <div style={{fontFamily: 'Oswald, sans-serif', color: '#FFD700', fontSize: '1rem'}}>Usuario Demo</div>
      </header>
      <main>
        <SectionComponent />
      </main>
    </div>
  );
}
