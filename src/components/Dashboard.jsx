import { useEffect, useState } from 'react';
import { getUser } from '../services/dynamodb';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cambia el email por el del usuario autenticado
    getUser('correo@ejemplo.com').then(data => setUser(data.Item));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>Bienvenido, {user.email}</div>
      ) : (
        <div>Cargando usuario...</div>
      )}
    </div>
  );
}
