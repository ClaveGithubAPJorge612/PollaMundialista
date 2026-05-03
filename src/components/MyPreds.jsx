/* ─────────────────────────────────────────────────────────────────────────────
   src/components/MyPreds.jsx
   User's predictions: past results + upcoming open picks.
───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState, useCallback } from 'react';
import { getMatches, getUserPredictions, savePrediction } from '../services/dynamodb';
import { useAuth } from '../hooks/useAuth';

/* ── Point badge ── */
function PointsBadge({ pts }) {
  if (pts === null || pts === undefined) return <span className="badge badge-cream">Pendiente</span>;
  if (pts === 10) return <span className="badge badge-gold">🎯 10 pts</span>;
  if (pts === 5)  return <span className="badge badge-green">✅ 5 pts</span>;
  if (pts === 3)  return <span className="badge" style={{ background: 'rgba(255,200,0,0.12)', color: '#ffc040', border: '1px solid rgba(255,200,0,0.3)' }}>📊 3 pts</span>;
  return <span className="badge" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff9999', border: '1px solid rgba(255,80,80,0.25)' }}>❌ 0 pts</span>;
}

/* ── Single prediction row ── */
function PredRow({ match, pred, onSave, saving }) {
  const isLocked = new Date(match.kickoff) <= new Date();
  const isFinished = match.status === 'finished';

  const [home, setHome] = useState(pred?.homeGoals ?? '');
  const [away, setAway] = useState(pred?.awayGoals ?? '');
  const [dirty, setDirty] = useState(false);
  const [localErr, setLocalErr] = useState('');
  const [saved, setSaved] = useState(false);

  const change = (setter) => (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    setter(v);
    setDirty(true);
    setLocalErr('');
    setSaved(false);
  };

  const handleSave = async () => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a)) { setLocalErr('Ingresa ambos marcadores.'); return; }
    if (h < 0 || a < 0)       { setLocalErr('Los goles no pueden ser negativos.'); return; }
    try {
      await onSave(match.id, h, a);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setLocalErr(e.message);
    }
  };

  const kickoffStr = new Date(match.kickoff).toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`pred-row ${isFinished ? 'pred-finished' : ''} ${isLocked && !isFinished ? 'pred-locked' : ''}`}>
      <div className="pred-meta">
        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Grupo {match.group} · J{match.matchday}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{kickoffStr}</span>
        {isLocked && <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,80,80,0.1)', color: '#ff9999', border: '1px solid rgba(255,80,80,0.2)' }}>🔒 Cerrado</span>}
      </div>

      <div className="pred-body">
        {/* Teams + score inputs */}
        <div className="pred-teams">
          <span className="pred-team">{match.homeTeam.flag} {match.homeTeam.name}</span>

          <div className="pred-score-area">
            {isLocked ? (
              <>
                <span className="score-display bangers">
                  {pred ? `${pred.homeGoals} - ${pred.awayGoals}` : '? - ?'}
                </span>
                {isFinished && match.result && (
                  <span className="score-real bangers">
                    ({match.result.homeGoals} - {match.result.awayGoals})
                  </span>
                )}
              </>
            ) : (
              <div className="score-inputs">
                <input
                  className="score-input"
                  type="text"
                  inputMode="numeric"
                  value={home}
                  onChange={change(setHome)}
                  placeholder="0"
                  maxLength={2}
                />
                <span className="bangers" style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>-</span>
                <input
                  className="score-input"
                  type="text"
                  inputMode="numeric"
                  value={away}
                  onChange={change(setAway)}
                  placeholder="0"
                  maxLength={2}
                />
              </div>
            )}
          </div>

          <span className="pred-team" style={{ textAlign: 'right' }}>{match.awayTeam.name} {match.awayTeam.flag}</span>
        </div>

        {/* Actions + badges */}
        <div className="pred-actions">
          {isFinished && <PointsBadge pts={pred?.points} />}
          {isFinished && pred?.pointLabel && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{pred.pointLabel}</span>
          )}
          {!isLocked && (
            <>
              <button
                className="btn btn-primary"
                style={{ padding: '5px 16px', fontSize: '0.85rem' }}
                disabled={!dirty || saving}
                onClick={handleSave}
              >
                {saving ? '...' : saved ? '✓ Guardado' : pred ? 'Actualizar' : 'Guardar'}
              </button>
              {localErr && <span style={{ fontSize: '0.78rem', color: '#ff9999' }}>{localErr}</span>}
            </>
          )}
          {!isLocked && !pred && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sin predicción aún</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function MyPreds() {
  const { user } = useAuth();
  const [matches, setMatches]     = useState([]);
  const [preds, setPreds]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState('all'); // all | open | finished

  useEffect(() => {
    (async () => {
      const [m, p] = await Promise.all([
        getMatches({ phase: 'group' }),
        getUserPredictions(user.id),
      ]);
      setMatches(m.filter(x => !x.tbd && x.homeTeam));
      setPreds(p);
      setLoading(false);
    })();
  }, [user.id]);

  const handleSave = useCallback(async (matchId, homeGoals, awayGoals) => {
    setSaving(true);
    try {
      const saved = await savePrediction(user.id, matchId, homeGoals, awayGoals);
      setPreds(prev => {
        const idx = prev.findIndex(p => p.matchId === matchId);
        if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
        return [...prev, saved];
      });
    } finally {
      setSaving(false);
    }
  }, [user.id]);

  const predMap = Object.fromEntries(preds.map(p => [p.matchId, p]));

  const filteredMatches = matches.filter(m => {
    if (filter === 'open')     return m.status === 'upcoming';
    if (filter === 'finished') return m.status === 'finished';
    return true;
  });

  // Group by matchday
  const byMatchday = {};
  for (const m of filteredMatches) {
    const key = m.matchday;
    if (!byMatchday[key]) byMatchday[key] = [];
    byMatchday[key].push(m);
  }

  // Summary stats
  const totalPts     = preds.reduce((s, p) => s + (p.points ?? 0), 0);
  const exactCount   = preds.filter(p => p.points === 10).length;
  const pending      = preds.filter(p => p.points === null).length;
  const openMatches  = matches.filter(m => m.status === 'upcoming').length;

  if (loading) return <div className="section-wrap"><div className="spinner" /></div>;

  return (
    <div className="section-wrap fade-up">
      <h1 className="section-title">⚽ Mis Predicciones</h1>
      <p className="section-subtitle">Fase de grupos · Mundial 2026</p>

      {/* Summary */}
      <div className="preds-summary">
        <div className="ps-item">
          <span className="bangers ps-val" style={{ color: '#ffd700' }}>{totalPts}</span>
          <span className="ps-lbl">Puntos</span>
        </div>
        <div className="ps-sep" />
        <div className="ps-item">
          <span className="bangers ps-val" style={{ color: 'var(--green)' }}>{exactCount}</span>
          <span className="ps-lbl">Exactos</span>
        </div>
        <div className="ps-sep" />
        <div className="ps-item">
          <span className="bangers ps-val" style={{ color: 'var(--light-green)' }}>{preds.length}</span>
          <span className="ps-lbl">Predicciones</span>
        </div>
        <div className="ps-sep" />
        <div className="ps-item">
          <span className="bangers ps-val" style={{ color: 'var(--cream)' }}>{openMatches}</span>
          <span className="ps-lbl">Abiertos</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {[['all','Todos'], ['open','Abiertos'], ['finished','Finalizados']].map(([v, l]) => (
          <button
            key={v}
            className={`filter-tab ${filter === v ? 'active' : ''}`}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Matchday sections */}
      {Object.keys(byMatchday).sort().map(md => (
        <div key={md} className="matchday-section">
          <div className="matchday-title bangers">Jornada {md}</div>
          <div className="pred-list">
            {byMatchday[md]
              .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
              .map(m => (
                <PredRow
                  key={m.id}
                  match={m}
                  pred={predMap[m.id]}
                  onSave={handleSave}
                  saving={saving}
                />
              ))}
          </div>
        </div>
      ))}

      {filteredMatches.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📋</div>
          <p>No hay partidos en esta vista</p>
        </div>
      )}

      <style>{`
        .preds-summary {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 1rem;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          justify-content: space-around;
        }
        .ps-item { display: flex; flex-direction: column; align-items: center; padding: 0.2rem 1.2rem; }
        .ps-val { font-size: 2rem; line-height: 1; }
        .ps-lbl { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .ps-sep { width: 1px; height: 40px; background: var(--border); }

        .filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
        }
        .filter-tab {
          padding: 6px 16px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text-dim);
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
        }
        .filter-tab.active, .filter-tab:hover { background: rgba(110,207,66,0.12); color: var(--green); border-color: var(--green); }

        .matchday-section { margin-bottom: 1.5rem; }
        .matchday-title {
          font-size: 1.2rem;
          letter-spacing: 2px;
          color: var(--text-dim);
          margin-bottom: 0.6rem;
          padding-left: 4px;
          border-left: 3px solid var(--purple);
          padding-left: 10px;
        }

        .pred-list { display: flex; flex-direction: column; gap: 0.6rem; }

        .pred-row {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 0.8rem 1rem;
          transition: border-color 0.2s;
        }
        .pred-row:hover { border-color: var(--border-hl); }
        .pred-row.pred-finished { border-color: rgba(110,207,66,0.2); }
        .pred-row.pred-locked   { opacity: 0.85; }

        .pred-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .pred-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .pred-teams {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 240px;
        }
        .pred-team {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pred-team:last-child { text-align: right; }

        .pred-score-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .score-display {
          font-size: 1.4rem;
          letter-spacing: 2px;
          color: var(--green);
        }
        .score-real {
          font-size: 0.85rem;
          color: var(--text-dim);
          letter-spacing: 1px;
        }

        .score-inputs {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .score-input {
          width: 44px;
          height: 40px;
          background: var(--surface3);
          border: 1.5px solid var(--border);
          border-radius: var(--r-sm);
          color: var(--cream);
          font-family: var(--font-display);
          font-size: 1.3rem;
          text-align: center;
          outline: none;
          transition: border-color 0.18s;
        }
        .score-input:focus { border-color: var(--green); }

        .pred-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-dim);
          font-size: 1rem;
        }

        @media (max-width: 600px) {
          .pred-teams { flex-wrap: wrap; }
          .pred-body { flex-direction: column; align-items: flex-start; }
          .pred-actions { justify-content: flex-start; }
          .ps-sep { display: none; }
        }
      `}</style>
    </div>
  );
}
