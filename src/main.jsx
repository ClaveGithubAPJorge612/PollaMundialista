/* ─────────────────────────────────────────────────────────────────────────────
   src/main.jsx
───────────────────────────────────────────────────────────────────────────── */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flag-icons/css/flag-icons.min.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
