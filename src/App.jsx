/* ─────────────────────────────────────────────────────────────────────────────
   src/App.jsx
   Root component. Handles auth gate + tab-based routing + shared layout.
───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';

import Navbar      from './components/Navbar';
import AuthPanel   from './components/AuthPanel';
import Dashboard   from './components/Dashboard';
import MyPreds     from './components/MyPreds';
import Calendar    from './components/Calendar';
import Mundial     from './components/Mundial';
import MyProfile   from './components/MyProfile';

const COMPONENTS = {
  dashboard: Dashboard,
  mypreds:   MyPreds,
  calendar:  Calendar,
  mundial:   Mundial,
  myprofile: MyProfile,
};

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  /* ── Loading splash ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg)',
      }}>
        <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 20px rgba(110,207,66,0.5))' }}>⚽</div>
        <div className="bangers" style={{
          fontSize: '1.8rem',
          letterSpacing: '4px',
          background: 'linear-gradient(90deg, var(--green), var(--light-green))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          POLLA MUNDIAL 2026
        </div>
        <div className="spinner" />
      </div>
    );
  }

  /* ── Not logged in → show auth ── */
  if (!user) return <AuthPanel />;

  /* ── Main app ── */
  const ActiveComponent = COMPONENTS[activeTab] ?? Dashboard;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ flex: 1, paddingBottom: '70px' /* space for mobile bottom nav */ }}>
        <ActiveComponent onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
