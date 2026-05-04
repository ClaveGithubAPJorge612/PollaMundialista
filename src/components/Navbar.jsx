/* ─────────────────────────────────────────────────────────────────────────────
   src/components/Navbar.jsx
   Shared navigation bar.
   Desktop: horizontal top bar.
   Mobile:  bottom tab bar.
───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import logoFifa from '../assets/images/Logofifa26.png';

const BASE_TABS = [
  { id: 'dashboard', label: 'Inicio',      icon: '🏠' },
  { id: 'calendar',  label: 'Calendario',  icon: '📅' },
  { id: 'mundial',   label: 'Mundial',     icon: '🏆' },
  { id: 'mypreds',   label: 'Mis Picks',   icon: '⚽' },
  { id: 'myprofile', label: 'Perfil',      icon: '👤' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout, isAdmin } = useAuth();
  const TABS = [...BASE_TABS, ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '🛡' }] : [])];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ── Desktop / Tablet Top Bar ─────────────────────────────────────── */}
      <header className="navbar-top">
        <div className="navbar-logo" onClick={() => onTabChange('dashboard')}>
          <img src={logoFifa} alt="FIFA 26" className="logo-image" />
          <span className="fifa-expanded logo-text">POLLA APP MUNDIAL 26</span>
        </div>

        <nav className="navbar-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label bangers">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="navbar-user">
          <button className="user-chip" onClick={() => setMenuOpen(o => !o)}>
            <span className="user-avatar">{user?.avatar ?? '⚽'}</span>
            <span className="user-name">{user?.username ?? 'Usuario'}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-info">
                <div className="bangers" style={{ fontSize: '1.1rem', color: 'var(--green)' }}>{user?.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{user?.email}</div>
              </div>
              <hr className="divider" />
              <button className="dropdown-item" onClick={() => { onTabChange('myprofile'); setMenuOpen(false); }}>
                ⚙️ Configuración
              </button>
              <button className="dropdown-item danger" onClick={() => { logout(); setMenuOpen(false); }}>
                🚪 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Bar ────────────────────────────────────────────── */}
      <nav className="navbar-bottom">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`bottom-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="bottom-icon">{tab.icon}</span>
            <span className="bottom-label bangers">{tab.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        /* ── Top Bar ── */
        .navbar-top {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0 1.5rem;
          height: 60px;
          background: var(--surface4);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }

        .navbar-logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        .logo-icon { font-size: 1.4rem; }
        .logo-text {
          font-size: 1.3rem;
          letter-spacing: 3px;
          color: #ffffff;
        }

        .navbar-tabs {
          display: flex;
          gap: 4px;
        }
        .nav-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--r-sm);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-tab:hover { color: var(--light-green); border-color: var(--border); background: var(--glass); }
        .nav-tab.active {
          background: rgba(110, 207, 66, 0.15);
          border-color: var(--green);
          color: var(--green);
        }
        .tab-icon { font-size: 1rem; }
        .tab-label { font-size: 0.85rem; letter-spacing: 1px; }

        /* ── User chip ── */
        .navbar-user { position: relative; }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 30px;
          color: #ffffff;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .user-chip:hover { border-color: var(--green); }
        .user-avatar { font-size: 1.2rem; }
        .user-name { font-weight: 600; }

        .user-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          min-width: 200px;
          padding: 0.5rem;
          animation: fadeUp 0.2s ease;
          z-index: 200;
        }
        .dropdown-info { padding: 6px 8px 8px; }
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: var(--r-sm);
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: var(--glass); color: var(--cream); }
        .dropdown-item.danger:hover { background: rgba(255,80,80,0.1); color: #ff8080; }

        /* ── Bottom Bar (mobile) ── */
        .navbar-bottom {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(13, 10, 21, 0.97);
          border-top: 1px solid var(--border);
          padding: 4px 0 env(safe-area-inset-bottom, 4px);
        }

        .bottom-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex: 1;
          padding: 6px 4px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s;
        }
        .bottom-tab.active { color: var(--green); }
        .bottom-icon { font-size: 1.3rem; }
        .bottom-label { font-size: 0.6rem; letter-spacing: 1px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .navbar-tabs { display: none; }
          .navbar-bottom { display: flex; }
          .logo-text { font-size: 1rem; letter-spacing: 2px; }
          .user-name { display: none; }
        }

        @media (max-width: 480px) {
          .logo-text { display: none; }
        }
      `}</style>
    </>
  );
}
