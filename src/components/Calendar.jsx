/* ─────────────────────────────────────────────────────────────────────────────
   src/components/Calendar.jsx
   Full tournament calendar, grouped by day.
   Click any match → floating modal with full details.
───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getMatches } from '../services/dynamodb';
import { STADIUMS } from '../data/mockData';
import { FlagIcon } from '../utils/flagUtils';

const PHASE_LABELS = {
  group: 'Fase de Grupos',
  r32:   'Dieciseisavos',
  r16:   'Octavos de Final',
  qf:    'Cuartos de Final',
  sf:    'Semifinal',
  fp:    'Tercer Puesto',
  final: 'Final',
};

const PHASE_COLORS = {
  group: 'var(--purple)',
  r32:   '#4a7fc1',
  r16:   '#3a9c7a',
  qf:    '#c1894a',
  sf:    '#c14a4a',
  fp:    '#7a6ac1',
  final: '#c1a000',
};

/* ── Match card (calendar list item) ── */
function MatchCard({ match, onClick }) {
  const isFinished = match.status === 'finished';
  const isLive     = match.status === 'live';
  const isTBD      = match.tbd;

  const phaseColor = PHASE_COLORS[match.phase] || 'var(--text-dim)';

  return (
    <div className={`cal-match-card ${isLive ? 'cal-live' : ''}`} onClick={() => onClick(match)}>
      <div className="cmc-phase" style={{ borderLeftColor: 'var(--text)' }}>
        <span className="bangers cmc-phase-label" style={{ color: 'var(--text)' }}>
          {PHASE_LABELS[match.phase] ?? match.phase}
        </span>
        {match.group && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>· Grupo {match.group}</span>
        )}
        {isLive && <span className="live-dot pulse">● EN VIVO</span>}
      </div>

      <div className="cmc-body">
        {isTBD ? (
          <div className="cmc-tbd">
            <span>?</span>
            <span className="bangers cmc-vs">VS</span>
            <span>?</span>
          </div>
        ) : (
          <div className="cmc-teams">
            <div className="cmc-team-home">
              <span className="cmc-flag"><FlagIcon teamId={match.homeTeam?.id} size="1rem" /></span>
              <span className="cmc-name">{match.homeTeam?.name}</span>
            </div>

            <div className="cmc-score-wrap">
              {isFinished && match.result ? (
                <span className="bangers cmc-final-score">
                  {match.result.homeGoals} <span style={{ color: 'var(--text-dim)' }}>-</span> {match.result.awayGoals}
                </span>
              ) : (
                <>
                  <span className="bangers cmc-time">{match.time}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>hrs</span>
                </>
              )}
            </div>

            <div className="cmc-team-away">
              <span className="cmc-name">{match.awayTeam?.name}</span>
              <span className="cmc-flag"><FlagIcon teamId={match.awayTeam?.id} size="1rem" /></span>
            </div>
          </div>
        )}
      </div>

      <div className="cmc-footer">
        <span>🏟 {match.stadium || 'Por confirmar'}</span>
        <span>{match.city}{match.country ? `, ${match.country}` : ''}</span>
        {match.capacity > 0 && <span>👥 {match.capacity.toLocaleString()}</span>}
        <span className="cmc-detail-hint">Ver detalle →</span>
      </div>
    </div>
  );
}

/* ── Match detail modal ── */
function MatchModal({ match, onClose }) {
  if (!match) return null;

  const modalRef = useRef(null);
  const isFinished = match.status === 'finished';
  const isTBD      = match.tbd;
  const phaseColor = PHASE_COLORS[match.phase] || 'var(--text-dim)';

  const stad = STADIUMS.find(s => s.name === match.stadium);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [match]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-up" ref={modalRef} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Phase banner */}
        <div className="modal-phase-banner" style={{ borderColor: phaseColor, background: `${phaseColor}18` }}>
          <span className="bangers modal-phase-text" style={{ color: phaseColor }}>
            {PHASE_LABELS[match.phase] ?? match.phase}
          </span>
          {match.group && <span style={{ color: 'var(--text-dim)' }}>· Grupo {match.group} · Jornada {match.matchday}</span>}
        </div>

        {/* Teams + score */}
        {!isTBD ? (
          <div className="modal-teams">
            <div className="modal-team">
              <span className="modal-flag"><FlagIcon teamId={match.homeTeam?.id} size="1rem" /></span>
              <span className="bangers modal-team-name">{match.homeTeam?.name}</span>
            </div>

            <div className="modal-center">
              {isFinished && match.result ? (
                <span className="bangers modal-final-score">
                  {match.result.homeGoals} <span style={{ color: 'var(--text-dim)' }}>:</span> {match.result.awayGoals}
                </span>
              ) : (
                <>
                  <span className="bangers modal-kickoff-time">{match.time}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>hrs</span>
                </>
              )}
              {isFinished && <div className="badge badge-green" style={{ marginTop: 4 }}>Final</div>}
            </div>

            <div className="modal-team modal-team-away">
              <span className="bangers modal-team-name">{match.awayTeam?.name}</span>
              <span className="modal-flag"><FlagIcon teamId={match.awayTeam?.id} size="1rem" /></span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
            <div className="bangers" style={{ fontSize: '2rem' }}>Por definir</div>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Los equipos se definirán según resultados de fases anteriores.</p>
          </div>
        )}

        {/* Scorers */}
        {isFinished && match.scorers?.length > 0 && (
          <div className="modal-scorers">
            <div className="bangers modal-section-title">⚽ Goles</div>
            <div className="scorers-list">
              {match.scorers.map((s, i) => {
                const isHome = s.team === match.homeTeam?.id;
                return (
                  <div key={i} className={`scorer-row ${isHome ? '' : 'scorer-away'}`}>
                    {isHome ? (
                      <>
                        <span className="scorer-player">{s.player}</span>
                        <span className="scorer-minute">{s.minute}'</span>
                        <span style={{ flex: 1 }} />
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1 }} />
                        <span className="scorer-minute">{s.minute}'</span>
                        <span className="scorer-player">{s.player}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Match info */}
        <div className="modal-info-grid">
          {match.kickoff && <InfoItem icon="📅" label="Fecha" value={
            new Date(match.kickoff).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          } />}
          {match.time && <InfoItem icon="⏰" label="Hora (local)" value={match.time + ' hrs'} />}
          {match.stadium && <InfoItem icon="🏟" label="Estadio" value={match.stadium} />}
          {match.city && <InfoItem icon="📍" label="Ciudad" value={match.city} />}
          {match.country && <InfoItem icon="🌎" label="País sede" value={match.country} />}
          {stad && <InfoItem icon="👥" label="Capacidad" value={stad.capacity.toLocaleString()} />}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          min-height: 100%;
          z-index: 500;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-box {
          background: var(--surface2);
          border: 2px solid var(--border-hl);
          border-radius: var(--r-lg);
          padding: 1.5rem;
          width: 100%;
          max-width: 520px;
          max-height: 70vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          margin: auto;
        }
        .modal-close {
          position: absolute;
          top: 12px; right: 12px;
          background: var(--surface3);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 30px; height: 30px;
          color: var(--text-dim);
          cursor: pointer;
          font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { 
          color: var(--text); 
          background: rgba(110, 207, 66, 0.15); 
          border-color: var(--green); 
          transform: rotate(90deg);
        }

        .modal-phase-banner {
          border: 1px solid;
          border-radius: var(--r-sm);
          padding: 6px 12px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 1.2rem;
        }
        .modal-phase-text { font-size: 1rem; letter-spacing: 2px; }

        .modal-teams {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-bottom: 1.2rem;
        }
        .modal-team { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
        .modal-team-away { align-items: flex-end; }
        .modal-flag { font-size: 3rem; }
        .modal-team-name { font-size: 1.1rem; letter-spacing: 1px; text-align: center; }
        .modal-center { display: flex; flex-direction: column; align-items: center; }
        .modal-final-score { font-size: 2.8rem; letter-spacing: 2px; color: var(--dark-green); font-weight: 700; }
        .modal-kickoff-time { font-size: 2rem; color: var(--green); font-weight: 700; }

        .modal-scorers { margin-bottom: 1rem; }
        .modal-section-title { font-size: 1rem; letter-spacing: 2px; color: var(--text-dim); margin-bottom: 0.5rem; }
        .scorers-list { display: flex; flex-direction: column; gap: 4px; }
        .scorer-row {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 8px;
          background: var(--surface3);
          border-radius: var(--r-sm);
          font-size: 0.9rem;
        }
        .scorer-player { font-weight: 600; }
        .scorer-minute { color: var(--green); font-size: 0.8rem; }

        .modal-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;
        }
        @media (max-width: 480px) {
          .modal-info-grid { grid-template-columns: 1fr; }
          .modal-teams { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--surface3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: '8px 12px',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

/* ── Main Calendar ── */
export default function Calendar() {
  const [matches, setMatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [phaseFilter, setPhase]   = useState('group');
  const [dateSearch, setDateSearch] = useState('');

  useEffect(() => {
    getMatches().then(m => { setMatches(m); setLoading(false); });
  }, []);

  const openModal  = useCallback(m => setSelected(m), []);
  const closeModal = useCallback(() => setSelected(null), []);

  const phases = ['group', 'r32', 'r16', 'qf', 'sf', 'fp', 'final'];

  const filtered = matches.filter(m => {
    if (m.phase !== phaseFilter) return false;
    if (dateSearch && !m.date.includes(dateSearch)) return false;
    return true;
  });

  // Group by date
  const byDate = {};
  for (const m of filtered.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))) {
    if (!byDate[m.date]) byDate[m.date] = [];
    byDate[m.date].push(m);
  }

  if (loading) return <div className="section-wrap"><div className="spinner" /></div>;

  return (
    <div className="section-wrap fade-up">
      <h1 className="section-title">📅 Calendario</h1>

      {/* Phase tabs */}
      <div className="cal-phase-tabs">
        {phases.map(p => (
          <button
            key={p}
            className={`filter-tab ${phaseFilter === p ? 'active' : ''}`}
            onClick={() => setPhase(p)}
            style={phaseFilter === p ? { } : {}}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Date filter */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          className="input"
          type="date"
          value={dateSearch}
          onChange={e => setDateSearch(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        {dateSearch && (
          <button className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => setDateSearch('')}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Match list */}
      {Object.keys(byDate).length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📅</div>
          <p>No hay partidos para esta selección</p>
        </div>
      ) : (
        Object.entries(byDate).map(([date, dayMatches]) => (
          <div key={date} className="cal-day-section">
            <div className="cal-day-header">
              <span className="bangers cal-day-title">
                {new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="cal-day-matches">
              {dayMatches.map(m => (
                <MatchCard key={m.matchId} match={m} onClick={openModal} />
              ))}
            </div>
          </div>
        ))
      )}

      {selected && <MatchModal match={selected} onClose={closeModal} />}

      <style>{`
        .cal-phase-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface) 100%);
          border-radius: var(--r-lg);
          border: 1px solid var(--border);
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }

        .filter-tab {
          padding: 0.65rem 1.4rem;
          border-radius: var(--r-sm);
          border: 1.5px solid var(--border);
          background: var(--surface2);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }

        .filter-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: inherit;
          filter: brightness(1.1);
          z-index: -1;
          transition: left 0.25s ease;
        }

        .filter-tab:hover {
          border-color: var(--cream);
          color: var(--text);
          background: var(--bg);
          transform: translateY(-2px);
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }

        .filter-tab.active {
          background: linear-gradient(135deg, var(--bg), var(--bg));
          color: #1a1a1a;
          border-color: #1a1a1a;
          font-weight: 700;
          box-shadow: 8px 8px 0px rgb(5 18 30);
          transform: translateY(-2px);
        }

        .filter-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(0, 0, 0, 0.1);
        }

        .cal-day-section { margin-bottom: 1.5rem; }
        .cal-day-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 0.6rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--border);
        }
        .cal-day-title { font-size: 1.1rem; letter-spacing: 2px; color: var(--cream); text-transform: capitalize; }
        .cal-day-matches { display: flex; flex-direction: column; gap: 1.5rem; }

        .cal-match-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 0.8rem 1rem;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }
        .cal-match-card:hover { border-color: var(--border-hl); background: var(--surface3); transform: translateY(-1px); }
        .cal-match-card.cal-live { border-color: #ff6060; box-shadow: 0 0 12px rgba(255,96,96,0.2); }

        .cmc-phase {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 6px;
          border-left: 3px solid;
          padding-left: 8px;
        }
        .cmc-phase-label { font-size: 0.8rem; letter-spacing: 1px; }
        .live-dot { font-size: 0.7rem; color: #ff6060; letter-spacing: 1px; }

        .cmc-body { margin-bottom: 6px; }
        .cmc-teams {
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
        }
        .cmc-team-home { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: right;}
        .cmc-team-away { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: left;}
        .cmc-flag { font-size: 1.4rem; }
        .cmc-name { font-size: 1.5rem; font-weight: 600; }
        .cmc-score-wrap { display: flex; flex-direction: column; align-items: center; min-width: 60px; }
        .cmc-final-score { font-size: 2rem; color: var(--text); letter-spacing: 3px; }
        .cmc-time { font-size: 1.2rem; color: var(--green); }
        .cmc-tbd { display: flex; align-items: center; gap: 12px; font-size: 1rem; color: var(--text-dim); justify-content: center; }
        .cmc-vs { font-size: 1rem; color: var(--text-dim); }

        .cmc-footer {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          font-size: 0.75rem; color: var(--text-dim);
          border-top: 1px solid var(--border);
          padding-top: 6px;
          margin-top: 4px;
        }
        .cmc-detail-hint { margin-left: auto; color: var(--green); font-size: 0.75rem; }

        .empty-state { text-align: center; padding: 3rem; color: var(--text-dim); }

        @media (max-width: 600px) {
          .cmc-name { font-size: 0.75rem; }
          .cmc-flag { font-size: 1.1rem; }
          .cmc-footer { display: none; }
        }
      `}</style>
    </div>
  );
}
