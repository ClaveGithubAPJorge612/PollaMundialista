/* ─────────────────────────────────────────────────────────────────────────────
   src/components/Dashboard.jsx
   Main landing page: fantasy standings + quick-stats + next matches.
───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';
import { getStandings, getMatches } from '../services/dynamodb';
import { useAuth } from '../hooks/useAuth';

function StatCard({ icon, value, label, color = 'var(--green)' }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value bangers" style={{ color }}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="rank-badge gold">🥇</span>;
  if (rank === 2) return <span className="rank-badge silver">🥈</span>;
  if (rank === 3) return <span className="rank-badge bronze">🥉</span>;
  return <span className="rank-badge plain">{rank}</span>;
}

export default function Dashboard({ onTabChange }) {
  const { user } = useAuth();
  const [standings, setStandings] = useState([]);
  const [nextMatches, setNextMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, m] = await Promise.all([getStandings(), getMatches()]);
      setStandings(s);
      const upcoming = m
        .filter(x => x.status === 'upcoming' && !x.tbd && x.homeTeam)
        .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
        .slice(0, 4);
      setNextMatches(upcoming);
      setLoading(false);
    })();
  }, []);

  const myRank  = standings.findIndex(u => u.id === user?.id) + 1;
  const myStats = standings.find(u => u.id === user?.id);

  if (loading) {
    return (
      <div className="section-wrap" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="section-wrap fade-up">
      {/* ── Welcome banner ── */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <div>
            <div className="bangers welcome-name">Hola, {user?.username ?? 'Jugador'} 👋</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              {myRank > 0 ? `Posición actual: #${myRank} de ${standings.length}` : 'Aún no tienes predicciones'}
            </div>
          </div>
        </div>
        <div className="welcome-pts bangers">
          <span style={{ fontSize: '2.5rem', color: 'var(--text)' }}>{myStats?.totalPoints ?? 0}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', letterSpacing: '2px' }}>PUNTOS</span>
        </div>
      </div>

      {/* ── My quick stats ── */}
      {myStats && (
        <div className="stats-row">
          <StatCard icon="🎯" value={myStats.exactCount}   label="Exactos"  color="var(--green)" />
          <StatCard icon="✅" value={myStats.partialCount} label="Parciales" color="var(--green)" />
          <StatCard icon="📋" value={myStats.predCount}    label="Preds"    color="var(--green)" />
          <StatCard icon="🏅" value={myRank > 0 ? `#${myRank}` : '-'} label="Posición" color="#ffd700" />
        </div>
      )}

      {/* ── Content grid ── */}
      <div className="dash-grid">
        {/* Standings table */}
        <div className="card dash-standings">
          <div className="card-header">
            <h2 className="bangers card-title">🏅 Clasificación</h2>
            <span className="badge badge-green">{standings.length} jugadores</span>
          </div>

          <table className="wc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th style={{ textAlign: 'right' }}>Exactos</th>
                <th style={{ textAlign: 'right' }}>Picks</th>
                <th style={{ textAlign: 'right' }}>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, idx) => {
                const isMe = player.id === user?.id;
                return (
                  <tr key={player.id} style={isMe ? { background: 'rgba(110,207,66,0.07)' } : {}}>
                    <td><RankBadge rank={idx + 1} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{player.avatar}</span>
                        <span style={{ fontWeight: isMe ? 700 : 400, color: isMe ? 'var(--green)' : 'var(--text)' }}>
                          {player.username}
                          {isMe && <span className="badge badge-green" style={{ marginLeft: 6, fontSize: '0.65rem' }}>TÚ</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>{player.exactCount}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{player.predCount}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="bangers" style={{ fontSize: '1.2rem', color: '#ffd700' }}>{player.totalPoints}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="dash-right">
          {/* Next matches */}
          <div className="card">
            <div className="card-header">
              <h2 className="bangers card-title">📅 Próximos partidos</h2>
            </div>
            {nextMatches.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                No hay partidos próximos
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {nextMatches.map(m => (
                  <div key={m.id} className="next-match-row">
                    <span className="badge badge-titles" style={{ fontSize: '0.65rem' }}>Grupo {m.group}</span>
                    <div className="nmr-teams">
                      <span>{m.homeTeam.flag} {m.homeTeam.name}</span>
                      <span className="bangers nmr-vs">VS</span>
                      <span>{m.awayTeam.name} {m.awayTeam.flag}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                      {new Date(m.kickoff).toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short' })} · {m.time}
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline" style={{ marginTop: '0.3rem', width: '100%' }}
                  onClick={() => onTabChange?.('mypreds')}>
                  ⚽ Registrar predicciones
                </button>
              </div>
            )}
          </div>

          {/* Point rules */}
          <div className="card">
            <h2 className="bangers card-title" style={{ marginBottom: '0.8rem' }}>📖 Reglas de puntos</h2>
            {[
              { pts: 10, icon: '🎯', label: 'Resultado exacto' },
              { pts:  5, icon: '✅', label: 'Marcador de un equipo' },
              { pts:  5, icon: '⚽', label: 'Total de goles' },
              { pts:  3, icon: '📊', label: 'Diferencia de goles' },
            ].map(r => (
              <div key={r.pts + r.label} className="rule-row">
                <span>{r.icon} {r.label}</span>
                <span className="bangers" style={{ color: 'var(--green)', fontSize: '1.15rem' }}>{r.pts} pts</span>
              </div>
            ))}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.7rem', lineHeight: '1.4' }}>
              Los puntos no son acumulables. Se aplica el de mayor jerarquía.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, var(--surface2), var(--surface3));
          border: 1px solid var(--border-hl);
          border-radius: var(--r-lg);
          padding: 1.2rem 1.5rem;
          margin-bottom: 1.2rem;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }
        .welcome-left { display: flex; align-items: center; gap: 1rem; }
        .welcome-avatar { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(110,207,66,0.4)); }
        .welcome-name { font-size: 1.6rem; letter-spacing: 2px; }
        .welcome-pts { display: flex; flex-direction: column; align-items: flex-end; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.8rem;
          margin-bottom: 1.2rem;
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 0.8rem 0.5rem;
          text-align: center;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }
        .stat-icon  { font-size: 1.4rem; }
        .stat-value { font-size: 1.8rem; line-height: 1; }
        .stat-label { font-size: 0.7rem; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; }

        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1rem;
          align-items: start;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .card-title { font-size: 1rem; letter-spacing: 2px; color: var(--text); }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          min-width: 28px;
        }
        .rank-badge.plain { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-dim); }
        .rank-badge.gold   { filter: drop-shadow(0 0 6px gold); }
        .rank-badge.silver { filter: drop-shadow(0 0 4px silver); }
        .rank-badge.bronze { filter: drop-shadow(0 0 4px #cd7f32); }

        .dash-right { display: flex; flex-direction: column; gap: 1rem; }

        .next-match-row {
          background: var(--surface3);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          padding: 0.6rem 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 8px 8px 0px rgb(5 18 30);
        }
        .nmr-teams {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .nmr-vs { color: var(--green); font-size: 0.9rem; }

        .rule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }
        .rule-row:last-of-type { border-bottom: none; }

        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr; }
          .dash-standings { order: 2; }
          .dash-right { order: 1; }
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .welcome-banner { flex-direction: column; gap: 0.8rem; align-items: flex-start; }
          .welcome-pts { align-items: flex-start; flex-direction: row; gap: 8px; align-items: center; }
        }
      `}</style>
    </div>
  );
}
