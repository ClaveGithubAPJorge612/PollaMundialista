/* ─────────────────────────────────────────────────────────────────────────────
   src/services/auth.js
   Cognito auth wrapper.
   In development (VITE_ENV=development) it uses a localStorage mock.
   In production it uses amazon-cognito-identity-js.

   Install (prod only):
     npm install amazon-cognito-identity-js
───────────────────────────────────────────────────────────────────────────── */

import { MOCK_CURRENT_USER } from '../data/mockData';

const IS_DEV = import.meta.env.VITE_ENV === 'development';

// ── Cognito config (ignored in dev) ──────────────────────────────────────────
const POOL_DATA = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID  ?? '',
  ClientId:   import.meta.env.VITE_COGNITO_CLIENT_ID     ?? '',
};

// ── Lazy-load Cognito (tree-shaken away in dev builds) ────────────────────────
let _userPool = null;
async function getUserPool() {
  if (IS_DEV) return null;
  if (_userPool) return _userPool;
  const { CognitoUserPool } = await import('amazon-cognito-identity-js');
  _userPool = new CognitoUserPool(POOL_DATA);
  return _userPool;
}

/* ─────────────────── DEV MOCK HELPERS ─────────────────── */

const DEV_SESSION_KEY = 'polla_dev_user';

function devGetSession() {
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function devSetSession(user) {
  localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(user));
}

function devClearSession() {
  localStorage.removeItem(DEV_SESSION_KEY);
}

/* ─────────────────── PUBLIC API ─────────────────── */

/**
 * Returns the currently authenticated user object, or null.
 * Shape: { id, sub, username, email, avatar }
 */
export async function getCurrentUser() {
  if (IS_DEV) {
    return devGetSession();
  }

  return new Promise(async (resolve) => {
    const pool = await getUserPool();
    const cognitoUser = pool.getCurrentUser();
    if (!cognitoUser) { resolve(null); return; }

    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) { resolve(null); return; }
      cognitoUser.getUserAttributes((attrErr, attrs) => {
        if (attrErr) { resolve(null); return; }
        const attrMap = {};
        attrs.forEach(a => { attrMap[a.getName()] = a.getValue(); });
        resolve({
          id:       attrMap['sub'],
          sub:      attrMap['sub'],
          username: attrMap['preferred_username'] || attrMap['email'].split('@')[0],
          email:    attrMap['email'],
          avatar:   attrMap['custom:avatar'] || '⚽',
        });
      });
    });
  });
}

/**
 * Sign in with email + password.
 * Returns user object on success, throws on failure.
 */
export async function signIn(email, password) {
  if (IS_DEV) {
    // Mock: accept any credentials
    await new Promise(r => setTimeout(r, 800));
    if (!email || !password) throw new Error('Email y contraseña son requeridos.');
    const user = { ...MOCK_CURRENT_USER, email };
    devSetSession(user);
    return user;
  }

  const { CognitoUser, AuthenticationDetails } = await import('amazon-cognito-identity-js');
  const pool = await getUserPool();

  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        cognitoUser.getUserAttributes((err, attrs) => {
          if (err) { reject(err); return; }
          const m = {};
          attrs.forEach(a => { m[a.getName()] = a.getValue(); });
          resolve({
            id:       m['sub'],
            sub:      m['sub'],
            username: m['preferred_username'] || email.split('@')[0],
            email:    m['email'],
            avatar:   m['custom:avatar'] || '⚽',
          });
        });
      },
      onFailure: (err) => {
        const msgs = {
          UserNotFoundException:        'No existe una cuenta con ese correo.',
          NotAuthorizedException:       'Contraseña incorrecta.',
          UserNotConfirmedException:    'Debes confirmar tu cuenta primero.',
        };
        reject(new Error(msgs[err.code] || err.message));
      },
      newPasswordRequired: () => {
        reject(new Error('Se requiere cambio de contraseña. Contacta al administrador.'));
      },
    });
  });
}

/**
 * Register a new user.
 * Returns { needsConfirmation: true } on success, throws on failure.
 */
export async function signUp(username, email, password) {
  if (IS_DEV) {
    await new Promise(r => setTimeout(r, 800));
    if (!username || !email || !password) throw new Error('Todos los campos son requeridos.');
    return { needsConfirmation: false, user: { ...MOCK_CURRENT_USER, username, email } };
  }

  const { CognitoUserAttribute } = await import('amazon-cognito-identity-js');
  const pool = await getUserPool();

  return new Promise((resolve, reject) => {
    const attrs = [
      new CognitoUserAttribute({ Name: 'email',                Value: email }),
      new CognitoUserAttribute({ Name: 'preferred_username',   Value: username }),
    ];

    pool.signUp(email, password, attrs, null, (err, result) => {
      if (err) {
        const msgs = {
          UsernameExistsException:      'Ya existe una cuenta con ese correo.',
          InvalidPasswordException:     'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números.',
        };
        reject(new Error(msgs[err.code] || err.message));
        return;
      }
      resolve({ needsConfirmation: !result.userConfirmed, sub: result.userSub });
    });
  });
}

/**
 * Confirm registration with OTP code.
 */
export async function confirmSignUp(email, code) {
  if (IS_DEV) {
    await new Promise(r => setTimeout(r, 600));
    return true;
  }

  const { CognitoUser } = await import('amazon-cognito-identity-js');
  const pool = await getUserPool();

  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) reject(new Error(err.message));
      else resolve(true);
    });
  });
}

/**
 * Sign out current user.
 */
export async function signOut() {
  if (IS_DEV) {
    devClearSession();
    return;
  }

  const pool = await getUserPool();
  const cognitoUser = pool.getCurrentUser();
  cognitoUser?.signOut();
}

/**
 * Change password for the current user.
 */
export async function changePassword(email, oldPassword, newPassword) {
  if (IS_DEV) {
    await new Promise(r => setTimeout(r, 600));
    return true;
  }

  const { CognitoUser, AuthenticationDetails } = await import('amazon-cognito-identity-js');
  const pool = await getUserPool();

  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: oldPassword });
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => {
        cognitoUser.changePassword(oldPassword, newPassword, (err) => {
          if (err) reject(new Error(err.message));
          else resolve(true);
        });
      },
      onFailure: (err) => reject(new Error(err.message)),
    });
  });
}
