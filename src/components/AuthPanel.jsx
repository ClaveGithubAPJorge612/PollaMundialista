/* ─────────────────────────────────────────────────────────────────────────────
   src/components/AuthPanel.jsx
   Full-page authentication: login / register / confirm OTP
───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const MODE = { LOGIN: 'login', REGISTER: 'register', CONFIRM: 'confirm' };

export default function AuthPanel() {
  const { login, register, confirm, error, loading, clearError } = useAuth();

  const [mode, setMode] = useState(MODE.LOGIN);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_pwd: '', code: '' });
  const [localErr, setLocalErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setLocalErr('');
    clearError();
  };

  const switchMode = (m) => {
    setMode(m);
    setLocalErr('');
    setSuccessMsg('');
    clearError();
  };

  /* ── Submit handlers ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setLocalErr('Completa todos los campos.'); return; }
    await login(form.email, form.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirm_pwd) {
      setLocalErr('Completa todos los campos.'); return;
    }
    if (form.password !== form.confirm_pwd) {
      setLocalErr('Las contraseñas no coinciden.'); return;
    }
    if (form.password.length < 8) {
      setLocalErr('La contraseña debe tener mínimo 8 caracteres.'); return;
    }

    const result = await register(form.username, form.email, form.password);
    if (result.success) {
      if (result.needsConfirmation) {
        setPendingEmail(form.email);
        setMode(MODE.CONFIRM);
        setSuccessMsg('Te enviamos un código de confirmación a tu correo.');
      } else {
        // Auto-logged in (dev mode)
        setSuccessMsg('¡Registro exitoso!');
      }
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!form.code) { setLocalErr('Ingresa el código de confirmación.'); return; }
    const result = await confirm(pendingEmail, form.code);
    if (result.success) {
      setSuccessMsg('¡Cuenta verificada! Ahora puedes iniciar sesión.');
      setMode(MODE.LOGIN);
    }
  };

  const displayError = localErr || error;

  return (
    <div className="auth-root">
      {/* Background pattern */}
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-container fade-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-trophy">🏆</div>
          <h1 className="bangers auth-title">POLLA MUNDIAL 2026</h1>
          <p className="auth-subtitle">Liga de Pronósticos ⚽</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          {mode !== MODE.CONFIRM && (
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === MODE.LOGIN    ? 'active' : ''}`} onClick={() => switchMode(MODE.LOGIN)}>
                Iniciar sesión
              </button>
              <button className={`auth-tab ${mode === MODE.REGISTER ? 'active' : ''}`} onClick={() => switchMode(MODE.REGISTER)}>
                Registrarse
              </button>
            </div>
          )}

          {/* Alerts */}
          {displayError && (
            <div className="auth-alert auth-alert-error">⚠️ {displayError}</div>
          )}
          {successMsg && (
            <div className="auth-alert auth-alert-success">✅ {successMsg}</div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === MODE.LOGIN && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="input" type="email" placeholder="tu@correo.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : '⚡ Entrar al juego'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === MODE.REGISTER && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Nombre de jugador</label>
                <input className="input" type="text" placeholder="Tu nombre en la polla" value={form.username} onChange={set('username')} autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="input" type="email" placeholder="tu@correo.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="input" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={set('password')} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input className="input" type="password" placeholder="Repite la contraseña" value={form.confirm_pwd} onChange={set('confirm_pwd')} autoComplete="new-password" />
              </div>
              <div className="auth-rules">
                <span>🔒 Mín. 8 caracteres · mayúsculas · números</span>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : '🚀 Crear mi cuenta'}
              </button>
            </form>
          )}

          {/* ── CONFIRM FORM ── */}
          {mode === MODE.CONFIRM && (
            <form onSubmit={handleConfirm} className="auth-form">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center' }}>
                Ingresa el código de 6 dígitos enviado a <strong style={{ color: 'var(--green)' }}>{pendingEmail}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Código de verificación</label>
                <input className="input code-input" type="text" placeholder="123456" maxLength={6} value={form.code} onChange={set('code')} autoComplete="one-time-code" inputMode="numeric" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : '✅ Verificar cuenta'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }} onClick={() => switchMode(MODE.LOGIN)}>
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        <p className="auth-footer">
          🌍 USA · Canadá · México — Mundial FIFA 2026
        </p>
      </div>

      <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Background */
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .auth-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(110,207,66,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110,207,66,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
        }
        .auth-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, var(--purple), transparent);
          top: -100px; left: -150px;
        }
        .auth-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, var(--dark-green), transparent);
          bottom: -100px; right: -100px;
        }

        /* Container */
        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        /* Logo */
        .auth-logo { text-align: center; }
        .auth-trophy { font-size: 3.5rem; filter: drop-shadow(0 0 20px rgba(110,207,66,0.5)); margin-bottom: 0.5rem; }
        .auth-title {
          font-size: 2.2rem;
          letter-spacing: 4px;
          background: linear-gradient(135deg, var(--green), var(--light-green), var(--cream));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          margin-bottom: 4px;
        }
        .auth-subtitle { color: var(--text-dim); font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; }

        /* Card */
        .auth-card {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 1.8rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        /* Tabs */
        .auth-tabs {
          display: flex;
          background: var(--bg);
          border-radius: var(--r-sm);
          padding: 3px;
          margin-bottom: 1.5rem;
        }
        .auth-tab {
          flex: 1;
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: calc(var(--r-sm) - 2px);
          color: var(--text-dim);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }
        .auth-tab.active { background: var(--surface3); color: var(--green); }

        /* Alerts */
        .auth-alert {
          border-radius: var(--r-sm);
          padding: 0.7rem 1rem;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          border: 1px solid;
        }
        .auth-alert-error   { background: rgba(255,80,80,0.1); color: #ff9999; border-color: rgba(255,80,80,0.3); }
        .auth-alert-success { background: rgba(110,207,66,0.1); color: var(--light-green); border-color: var(--border-hl); }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 0.9rem; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-label { font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-dim); font-weight: 600; }

        .auth-rules { font-size: 0.75rem; color: var(--text-dim); text-align: center; }

        .btn-full { width: 100%; margin-top: 0.4rem; }

        .code-input {
          text-align: center;
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 8px;
        }

        .btn-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Footer */
        .auth-footer { color: var(--text-dim); font-size: 0.8rem; letter-spacing: 1px; text-align: center; }
      `}</style>
    </div>
  );
}
