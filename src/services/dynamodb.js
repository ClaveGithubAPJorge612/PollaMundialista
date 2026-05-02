// Servicio base para DynamoDB

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mocks para desarrollo
const mockUsers = [
  { email: 'demo@correo.com', nombre: 'Usuario Demo', points: 100, role: 'user' },
  { email: 'admin@correo.com', nombre: 'Admin', points: 200, role: 'admin' },
];
const mockMatches = [
  { id: 'M1', local: 'México', visitante: 'USA', fecha: '2026-06-11 14:00', golesLocal: '', golesVisitante: '' },
  { id: 'M2', local: 'Argentina', visitante: 'Francia', fecha: '2026-06-12 16:00', golesLocal: '', golesVisitante: '' },
];

// Métodos principales con mocks
export async function getUser(email) {
  if (USE_MOCK) {
    return { Item: mockUsers.find(u => u.email === email) || null };
  }
  // --- Real DynamoDB ---
  const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');
  const REGION = import.meta.env.VITE_AWS_REGION;
  const client = new DynamoDBClient({ region: REGION });
  const ddbDocClient = DynamoDBDocumentClient.from(client);
  return ddbDocClient.send(new GetCommand({
    TableName: 'Usuarios',
    Key: { email }
  }));
}

export async function getUsers() {
  if (USE_MOCK) {
    return { Items: mockUsers };
  }
  // Implementa la consulta real aquí
  return { Items: [] };
}

export async function getMatches() {
  if (USE_MOCK) {
    return { Items: mockMatches };
  }
  // Implementa la consulta real aquí
  return { Items: [] };
}

export async function putUser(user) {
  if (USE_MOCK) {
    mockUsers.push(user);
    return { success: true };
  }
  // Implementa el guardado real aquí
  return { success: false };
}
