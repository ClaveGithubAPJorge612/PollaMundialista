/* ─────────────────────────────────────────────────────────────────────────────
   src/components/MyProfile.jsx
   User profile: view info, change username/avatar, change password, see stats.
───────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserPredictions, updateUserProfile } from '../services/dynamodb';

const AVATARS = ['⚽', '🦁', '🦊', '🐯', '🐼', '🦅', '🦋', '🦖', '🔥', '⚡', '🌟', '🎯', '🏆', '🎪', '🚀'];

export default function MyProfile() {
  const { user, updatePassword, setUser } = useAuth();

  const [tab, setTab]         = useState('info');
  const [preds, setPreds]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Info form
  const [username, setUsername]   = useState(user?.username ?? '');
  const [avatar, setAvatar]       = useState(user?.avatar ?? '⚽');
  const [infoMsg, setInfoMsg]     = useState('');
  const [infoErr, setInfoErr]     = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  // Password form
  const [oldPwd, setOldPwd]     = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [confPwd, setConfPwd]   = useState('');
  const [pwdMsg, setPwdMsg]     = useState('');
  const [pwdErr, setPwdErr]     = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    getUserPredictions(user.id).then(p => { setPreds(p); setLoading(false); });
  }, [user.id]);

  /* ── Info save ── */
  const saveInfo = async () => {
    if (!username.trim()) { setInfoErr('El nombre no puede estar vacío.'); return; }
    setSavingInfo(true); setInfoErr(''); setInfoMsg('');
    try {
      const updated = await updateUserProfile(user.id, { username: username.trim(), avatar });
      setUser(prev => ({ ...prev, ...updated }));
      setInfoMsg('✅ Perfil actualizado correctamente.');
    } catch (e) {
      setInfoErr(e.message);
    } finally {
      setSavingInfo(false);
    }
  };

  /* ── Password save ── */
  const savePwd = async () => {
    if (!oldPwd || !newPwd || !confPwd) { setPwdErr('Completa todos los campos.'); return; }
    if (newPwd !== confPwd)              { setPwdErr('Las contraseñas nuevas no coinciden.'); return; }
    if (newPwd.length < 8)              { setPwdErr('Mínimo 8 caracteres.'); return; }
    setSavingPwd(true); setPwdErr(''); setPwdMsg('');
    const res = await updatePassword(oldPwd, newPwd);
    setSavingPwd(false);
    if (res.success) { setPwdMsg('✅ Contraseña actualizada.'); setOldPwd(''); setNewPwd(''); setConfPwd(''); }
    else              setPwdErr(res.error);
  };

  /* ── Stats ── */
  const totalPts   = preds.reduce((s, p) => s + (p.points ?? 0), 0);
  const exactCount = preds.filter(p => p.points === 10).length;
  const partial5   = preds.filter(p => p.points === 5).length;
  const partial3   = preds.filter(p => p.points === 3).length;
  const zeros      = preds.filter(p => p.points === 0).length;
  const pending    = preds.filter(p => p.points === null).length;
  const accuracy   = preds.filter(p => p.points !== null).length > 0
    ? Math.round((preds.filter(p => (p.points ?? 0) > 0).length / preds.filter(p => p.points !== null).length) * 100)
    : 0;

  return (
    <div className="section-wrap fade-up">
      <h1 className="section-title">👤 Mi Perfil</h1>
      <p className="section-subtitle">Configuración y estadísticas</p>

      {/* Profile header card */}
      <div className="profile-header card">
        <div className="ph-avatar">{user?.avatar ?? '⚽'}</div>
        <div>
          <div className="bangers ph-name">{user?.username}</div>
          <div className="ph-email">{user?.email}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-green">🏆 {totalPts} pts</span>
            <span className="badge badge-purple">🎯 {exactCount} exactos</span>
            <span className="badge badge-cream">{accuracy}% acierto</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {[['info', '⚙️ Datos'], ['password', '🔒 Contraseña'], ['stats', '📊 Stats']].map(([id, label]) => (
          <button
            key={id}
            className={`filter-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {tab === 'info' && (
        <div className="card profile-form">
          <div className="form-group">
            <label className="form-label">Nombre de jugador</label>
            <input className="input" type="text" value={username} onChange={e => { setUsername(e.target.value); setInfoErr(''); setInfoMsg(''); }} maxLength={30} />
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="input" type="email" value={user?.email ?? ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>El correo no puede modificarse aquí.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button
                  key={a}
                  className={`avatar-btn ${avatar === a ? 'avatar-selected' : ''}`}
                  onClick={() => { setAvatar(a); setInfoMsg(''); }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {infoErr && <div className="auth-alert auth-alert-error">⚠️ {infoErr}</div>}
          {infoMsg && <div className="auth-alert auth-alert-success">{infoMsg}</div>}

          <button className="btn btn-primary" disabled={savingInfo} onClick={saveInfo}>
            {savingInfo ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      )}

      {/* ── PASSWORD TAB ── */}
      {tab === 'password' && (
        <div className="card profile-form">
          <div className="form-group">
            <label className="form-label">Contraseña actual</label>
            <input className="input" type="password" value={oldPwd} onChange={e => { setOldPwd(e.target.value); setPwdErr(''); setPwdMsg(''); }} autoComplete="current-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Nueva contraseña</label>
            <input className="input" type="password" value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdErr(''); }} placeholder="Mín. 8 caracteres" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar nueva contraseña</label>
            <input className="input" type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} autoComplete="new-password" />
          </div>

          {/* Password strength */}
          {newPwd && (
            <div className="pwd-strength">
              {[
                { label: '8+ caracteres', ok: newPwd.length >= 8 },
                { label: 'Mayúsculas',    ok: /[A-Z]/.test(newPwd) },
                { label: 'Minúsculas',    ok: /[a-z]/.test(newPwd) },
                { label: 'Números',       ok: /\d/.test(newPwd) },
              ].map(r => (
                <span key={r.label} className={`pwd-rule ${r.ok ? 'ok' : ''}`}>
                  {r.ok ? '✓' : '○'} {r.label}
                </span>
              ))}
            </div>
          )}

          {pwdErr && <div className="auth-alert auth-alert-error">⚠️ {pwdErr}</div>}
          {pwdMsg && <div className="auth-alert auth-alert-success">{pwdMsg}</div>}

          <button className="btn btn-primary" disabled={savingPwd} onClick={savePwd}>
            {savingPwd ? 'Actualizando...' : '🔒 Cambiar contraseña'}
          </button>
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === 'stats' && (
        <div>
          {loading ? <div className="spinner" /> : (
            <>
              <div className="stats-grid">
                {[
                  { icon: '🏆', label: 'Puntos totales',  val: totalPts,    color: '#ffd700' },
                  { icon: '🎯', label: 'Exactos (10 pts)', val: exactCount,  color: 'var(--green)' },
                  { icon: '✅', label: 'Parciales (5 pts)', val: partial5,   color: 'var(--light-green)' },
                  { icon: '📊', label: 'Diferencia (3 pts)', val: partial3,  color: '#ffc040' },
                  { icon: '❌', label: 'Sin puntos',       val: zeros,       color: '#ff9999' },
                  { icon: '⏳', label: 'Pendientes',       val: pending,     color: 'var(--text-dim)' },
                  { icon: '📋', label: 'Total predicciones', val: preds.length, color: 'var(--cream)' },
                  { icon: '🎯', label: 'Tasa de acierto',  val: `${accuracy}%`, color: 'var(--green)' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <span className="stat-icon">{s.icon}</span>
                    <span className="stat-value bangers" style={{ color: s.color }}>{s.val}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Score breakdown bar */}
              {preds.filter(p => p.points !== null).length > 0 && (
                <div className="card" style={{ marginTop: '1rem' }}>
                  <h3 className="bangers" style={{ marginBottom: '0.8rem', fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--text-dim)' }}>
                    Distribución de resultados
                  </h3>
                  <div className="breakdown-bar">
                    {[
                      { val: exactCount, color: 'var(--green)',       label: 'Exactos' },
                      { val: partial5,   color: 'var(--light-green)', label: '5 pts' },
                      { val: partial3,   color: '#ffc040',            label: '3 pts' },
                      { val: zeros,      color: '#ff7070',            label: '0 pts' },
                    ].map(seg => {
                      const total = preds.filter(p => p.points !== null).length;
                      const pct = total > 0 ? (seg.val / total) * 100 : 0;
                      return pct > 0 ? (
                        <div
                          key={seg.label}
                          className="bb-seg"
                          style={{ width: `${pct}%`, background: seg.color }}
                          title={`${seg.label}: ${seg.val} (${Math.round(pct)}%)`}
                        />
                      ) : null;
                    })}
                  </div>
                  <div className="breakdown-legend">
                    {[
                      { color: 'var(--green)',       label: `Exactos (${exactCount})` },
                      { color: 'var(--light-green)', label: `5 pts (${partial5})` },
                      { color: '#ffc040',            label: `3 pts (${partial3})` },
                      { color: '#ff7070',            label: `0 pts (${zeros})` },
                    ].map(l => (
                      <span key={l.label} className="bl-item">
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: l.color, marginRight: 4 }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        .profile-header {
          display: flex; align-items: center; gap: 1.2rem;
          margin-bottom: 1.2rem;
          background: linear-gradient(135deg, var(--surface2), var(--surface3));
          border-color: var(--border-hl);
          flex-wrap: wrap;
        }
        .ph-avatar { font-size: 3.5rem; filter: drop-shadow(0 0 10px rgba(110,207,66,0.4)); }
        .ph-name   { font-size: 1.8rem; letter-spacing: 3px; }
        .ph-email  { color: var(--text-dim); font-size: 0.9rem; }

        .profile-tabs { display: flex; gap: 6px; margin-bottom: 1.2rem; flex-wrap: wrap; }
        .profile-form { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }

        .avatar-grid {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .avatar-btn {
          width: 42px; height: 42px;
          background: var(--surface3);
          border: 1.5px solid var(--border);
          border-radius: var(--r-sm);
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-btn:hover { border-color: var(--green); background: var(--glass); }
        .avatar-selected  { border-color: var(--green); background: rgba(110,207,66,0.15); box-shadow: 0 0 8px rgba(110,207,66,0.3); }

        .pwd-strength {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 8px;
          background: var(--surface3);
          border-radius: var(--r-sm);
          border: 1px solid var(--border);
        }
        .pwd-rule {
          font-size: 0.78rem;
          color: var(--text-dim);
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .pwd-rule.ok { color: var(--green); border-color: var(--border-hl); background: rgba(110,207,66,0.08); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.8rem;
        }

        .breakdown-bar {
          display: flex; height: 20px; border-radius: 10px; overflow: hidden;
          background: var(--surface3); margin-bottom: 8px;
        }
        .bb-seg { height: 100%; transition: width 0.3s; }
        .breakdown-legend { display: flex; flex-wrap: wrap; gap: 10px; }
        .bl-item { font-size: 0.8rem; color: var(--text-dim); display: flex; align-items: center; }

        .auth-alert { border-radius: var(--r-sm); padding: 0.7rem 1rem; font-size: 0.9rem; border: 1px solid; }
        .auth-alert-error   { background: rgba(255,80,80,0.1); color: #ff9999; border-color: rgba(255,80,80,0.3); }
        .auth-alert-success { background: rgba(110,207,66,0.1); color: var(--light-green); border-color: var(--border-hl); }

        .form-label { font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-dim); font-weight: 600; }
        .form-group { display: flex; flex-direction: column; gap: 5px; }

        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
