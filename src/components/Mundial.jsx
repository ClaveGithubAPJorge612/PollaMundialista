/* ─────────────────────────────────────────────────────────────────────────────
   src/components/Mundial.jsx
   Tournament state: Group Stage tables + Knockout Bracket + Top Scorers.
───────────────────────────────────────────────────────────────────────────── */

import { useMemo, useState } from 'react';
import { computeGroupStandings, computeTopScorers, TEAMS } from '../data/mockData';

/* ══════════════════════════════════════════════════════
   GROUP STAGE VIEW
══════════════════════════════════════════════════════ */

function GroupTable({ group, rows }) {
  return (
    <div className="group-card card">
      <div className="group-card-header">
        <span className="bangers group-letter">Grupo {group}</span>
        <div className="group-flags">
          {rows.map(r => <span key={r.teamId} title={TEAMS[r.teamId]?.name}>{TEAMS[r.teamId]?.flag}</span>)}
        </div>
      </div>

      <table className="wc-table group-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th title="Jugados">J</th>
            <th title="Ganados">G</th>
            <th title="Empatados">E</th>
            <th title="Perdidos">P</th>
            <th title="Goles a favor">GF</th>
            <th title="Goles en contra">GC</th>
            <th title="Diferencia">DG</th>
            <th title="Puntos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const team = TEAMS[row.teamId];
            const qualified = idx < 2;
            const playoff   = idx === 2; // 3rd place could qualify
            return (
              <tr key={row.teamId} className={qualified ? 'row-q1' : playoff ? 'row-q3' : ''}>
                <td style={{ color: qualified ? 'var(--green)' : playoff ? 'var(--text-dim)' : 'var(--text-dim)', fontWeight: 700 }}>
                  {idx + 1}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{team?.flag}</span>
                    <span style={{ fontWeight: 600 }}>{team?.name}</span>
                  </div>
                </td>
                <td>{row.played}</td>
                <td style={{ color: 'var(--green)' }}>{row.won}</td>
                <td>{row.drawn}</td>
                <td style={{ color: '#ff9999' }}>{row.lost}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td style={{ color: row.gd > 0 ? 'var(--green)' : row.gd < 0 ? '#ff9999' : 'var(--text-dim)' }}>
                  {row.gd > 0 ? '+' : ''}{row.gd}
                </td>
                <td><span className="bangers" style={{ fontSize: '1.15rem', color: '#ffd700' }}>{row.pts}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GroupStageView() {
  const standings = useMemo(() => computeGroupStandings(), []);

  return (
    <div className="group-grid">
      {Object.entries(standings).map(([group, rows]) => (
        <GroupTable key={group} group={group} rows={rows} />
      ))}
      <div className="group-legend">
        <span className="legend-dot legend-q1" />Clasifica (Top 2)
        <span className="legend-dot legend-q3" style={{ marginLeft: 12 }} />Posible 3ro mejor clasificado
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BRACKET VIEW
══════════════════════════════════════════════════════ */

// Static bracket structure (TBD for all knockout rounds in current state)
const BRACKET_ROUNDS = [
  { label: 'Dieciseisavos', slots: 16 },
  { label: 'Octavos',       slots:  8 },
  { label: 'Cuartos',       slots:  4 },
  { label: 'Semifinal',     slots:  2 },
  { label: 'Final',         slots:  1 },
];

function BracketSlot({ top, bottom, index }) {
  return (
    <div className="bracket-match">
      <div className="bracket-team bracket-top">
        {top?.flag ? `${top.flag} ${top.name}` : <span style={{ color: 'var(--text-dim)' }}>Por definir</span>}
      </div>
      <div className="bracket-divider" />
      <div className="bracket-team bracket-bottom">
        {bottom?.flag ? `${bottom.flag} ${bottom.name}` : <span style={{ color: 'var(--text-dim)' }}>Por definir</span>}
      </div>
    </div>
  );
}

function BracketView() {
  return (
    <div className="bracket-scroll-wrap">
      <div className="bracket-container">
        {BRACKET_ROUNDS.map((round, ri) => (
          <div key={round.label} className="bracket-column">
            <div className="bangers bracket-round-label">{round.label}</div>
            <div className="bracket-slots" style={{ '--slot-count': round.slots }}>
              {Array.from({ length: Math.ceil(round.slots / 2) }).map((_, i) => (
                <BracketSlot key={i} index={i} top={null} bottom={null} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '1rem', letterSpacing: '1px' }}>
        🔒 El cuadro se actualizará una vez concluya la Fase de Grupos
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TOP SCORERS
══════════════════════════════════════════════════════ */

function TopScorers() {
  const scorers = useMemo(() => computeTopScorers().slice(0, 15), []);

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h2 className="bangers card-title" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
        ⚽ Tabla de Goleadores
      </h2>

      {scorers.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
          Aún no hay goles registrados.
        </p>
      ) : (
        <table className="wc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Equipo</th>
              <th style={{ textAlign: 'right' }}>Goles</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s, idx) => (
              <tr key={`${s.player}_${s.team}`}>
                <td>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' :
                    <span style={{ color: 'var(--text-dim)' }}>{idx + 1}</span>}
                </td>
                <td style={{ fontWeight: 600 }}>{s.player}</td>
                <td>
                  <span style={{ marginRight: 4 }}>{s.flag}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{s.team}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="bangers" style={{ fontSize: '1.3rem', color: 'var(--green)' }}>{s.goals}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: 4 }}>
                    {s.goals === 1 ? 'gol' : 'goles'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

const VIEWS = [
  { id: 'groups',  label: '🏟 Fase de Grupos' },
  { id: 'bracket', label: '🏆 Cuadrangulares' },
];

export default function Mundial() {
  const [view, setView] = useState('groups');

  return (
    <div className="section-wrap fade-up">
      <h1 className="section-title">🌍 Mundial 2026</h1>
      <p className="section-subtitle">Estado del torneo en tiempo real</p>

      {/* View toggle */}
      <div className="view-toggle">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`view-btn bangers ${view === v.id ? 'active' : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'groups'  && <GroupStageView />}
      {view === 'bracket' && <BracketView />}

      {/* Top scorers always visible */}
      <TopScorers />

      <style>{`
        .view-toggle {
          display: flex;
          gap: 6px;
          margin-bottom: 1.2rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 4px;
          width: fit-content;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }
        .view-btn {
          padding: 8px 24px;
          background: var(--surface2);
          border: none;
          border-radius: calc(var(--r-md) - 3px);
          color: var(--text);
          font-size: 0.95rem;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-btn.active {
          background: var(--bg);
          color: var(--cream);
          box-shadow: inset 0 0 0 1px var(--border-hl);
        }
        .view-btn:not(.active):hover { color: var(--light-green); }

        /* Group grid */
        .group-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .group-card { overflow: hidden; }
        .group-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.7rem;
        }
        .group-letter { font-size: 1.4rem; letter-spacing: 3px; color: var(--text); }
        .group-flags { display: flex; gap: 6px; font-size: 1.3rem; }

        .group-table th, .group-table td { padding: 0.4rem 0.5rem; }
        .row-q1 td:first-child { border-left: 3px solid var(--green); padding-left: 7px; }
        .row-q3 td:first-child { border-left: 3px solid var(--purple); padding-left: 7px; }

        .group-legend {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .legend-dot {
          display: inline-block;
          width: 10px; height: 10px;
          border-radius: 2px;
        }
        .legend-q1 { background: var(--green); }
        .legend-q3 { background: var(--purple); }

        /* Bracket */
        .bracket-scroll-wrap { overflow-x: auto; padding-bottom: 1rem; }
        .bracket-container {
          display: flex;
          gap: 0;
          min-width: 900px;
          align-items: center;
        }
        .bracket-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .bracket-round-label {
          font-size: 0.85rem;
          letter-spacing: 2px;
          color: var(--text-dim);
          text-align: center;
          margin-bottom: 0.5rem;
          padding: 4px 8px;
          background: var(--surface2);
          border-radius: var(--r-sm);
          border: 1px solid var(--border);
        }
        .bracket-slots {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          padding: 0 4px;
        }
        .bracket-match {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          overflow: hidden;
          font-size: 0.8rem;
        }
        .bracket-team {
          padding: 5px 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 28px;
          font-size: 0.78rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bracket-top    { border-bottom: 1px solid var(--border); }
        .bracket-divider { height: 0; }

        @media (max-width: 768px) {
          .group-grid { grid-template-columns: 1fr; }
          .view-toggle { width: 100%; }
          .view-btn { flex: 1; text-align: center; }
        }
      `}</style>
    </div>
  );
}
