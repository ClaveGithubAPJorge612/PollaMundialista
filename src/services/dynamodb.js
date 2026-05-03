/* ─────────────────────────────────────────────────────────────────────────────
   src/services/dynamodb.js
   Data access layer.
   ∙ Development  (VITE_ENV=development) → mock JSON in memory
   ∙ Production                          → AWS DynamoDB via SDK v3

   Install (prod only):
     npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/credential-providers

   DynamoDB tables expected:
     polla-users        PK: userId
     polla-matches      PK: matchId
     polla-predictions  PK: userId  SK: matchId
───────────────────────────────────────────────────────────────────────────── */

import {
  MATCHES, PREDICTIONS, STANDINGS, MOCK_USERS, calculatePoints,
} from '../data/mockData';

const IS_DEV = import.meta.env.VITE_ENV === 'development';

/* ═══════════════════════════════════════════════════════════
   DEV LAYER  –  in-memory store backed by mockData.js
═══════════════════════════════════════════════════════════ */

// Mutable copy so predictions can be saved in dev without refreshing
const _matches     = [...MATCHES];
const _predictions = [...PREDICTIONS];
const _users       = [...MOCK_USERS];

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

const devDB = {
  /* ── Matches ── */
  async getMatches({ phase, group } = {}) {
    await delay();
    let list = _matches;
    if (phase)  list = list.filter(m => m.phase === phase);
    if (group)  list = list.filter(m => m.group === group);
    return list;
  },

  async getMatchById(matchId) {
    await delay(100);
    return _matches.find(m => m.id === matchId) ?? null;
  },

  /* ── Users ── */
  async getStandings() {
    await delay();
    // Recalculate from current _predictions
    const stats = {};
    for (const u of _users) {
      stats[u.id] = { ...u, totalPoints: 0, predCount: 0, exactCount: 0, partialCount: 0 };
    }
    for (const p of _predictions) {
      if (!stats[p.userId]) continue;
      stats[p.userId].predCount++;
      if (p.points !== null) {
        stats[p.userId].totalPoints += p.points;
        if (p.points === 10) stats[p.userId].exactCount++;
        else if (p.points > 0) stats[p.userId].partialCount++;
      }
    }
    return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
  },

  async getUserById(userId) {
    await delay(100);
    return _users.find(u => u.id === userId) ?? null;
  },

  async updateUserProfile(userId, updates) {
    await delay(400);
    const idx = _users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado');
    _users[idx] = { ..._users[idx], ...updates };
    return _users[idx];
  },

  /* ── Predictions ── */
  async getUserPredictions(userId) {
    await delay();
    return _predictions.filter(p => p.userId === userId);
  },

  async savePrediction(userId, matchId, homeGoals, awayGoals) {
    await delay(400);
    const match = _matches.find(m => m.id === matchId);
    if (!match) throw new Error('Partido no encontrado');

    // Check if locked (past kickoff)
    const kickoff = new Date(match.kickoff);
    if (kickoff <= new Date()) throw new Error('El partido ya comenzó. No puedes modificar tu predicción.');

    const pointData = match.result ? calculatePoints({ homeGoals, awayGoals }, match.result) : null;

    const existing = _predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
    const pred = {
      id:         existing >= 0 ? _predictions[existing].id : `pred_dev_${Date.now()}`,
      userId, matchId, homeGoals, awayGoals,
      points:     pointData?.points ?? null,
      pointLabel: pointData?.label  ?? null,
      createdAt:  new Date().toISOString(),
    };

    if (existing >= 0) _predictions[existing] = pred;
    else               _predictions.push(pred);

    return pred;
  },
};

/* ═══════════════════════════════════════════════════════════
   PRODUCTION LAYER  –  DynamoDB SDK v3
═══════════════════════════════════════════════════════════ */

let _docClient = null;

async function getDocClient() {
  if (_docClient) return _docClient;

  // Solo importa si estamos en producción
  if (IS_DEV) return null;
  
  const { DynamoDBClient }         = await import('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
  const { fromCognitoIdentityPool }= await import('@aws-sdk/credential-providers');

  const credentials = fromCognitoIdentityPool({
    clientConfig:    { region: import.meta.env.VITE_AWS_REGION },
    identityPoolId:  import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
    logins: {},  // Populate with Cognito tokens when user is authenticated
  });

  const dynamo = new DynamoDBClient({
    region:      import.meta.env.VITE_AWS_REGION,
    credentials,
  });

  _docClient = DynamoDBDocumentClient.from(dynamo, {
    marshallOptions:   { removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
  });

  return _docClient;
}

const TABLES = {
  USERS:       import.meta.env.VITE_DYNAMO_USERS_TABLE       || 'polla-users',
  MATCHES:     import.meta.env.VITE_DYNAMO_MATCHES_TABLE     || 'polla-matches',
  PREDICTIONS: import.meta.env.VITE_DYNAMO_PREDICTIONS_TABLE || 'polla-predictions',
};

const prodDB = {
  async getMatches({ phase, group } = {}) {
    const { ScanCommand, QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    // In prod you'd use a GSI for phase/group filtering. Simple scan here:
    const { Items } = await client.send(new ScanCommand({ TableName: TABLES.MATCHES }));
    let list = Items ?? [];
    if (phase) list = list.filter(m => m.phase === phase);
    if (group) list = list.filter(m => m.group === group);
    return list;
  },

  async getMatchById(matchId) {
    const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Item } = await client.send(new GetCommand({ TableName: TABLES.MATCHES, Key: { matchId } }));
    return Item ?? null;
  },

  async getStandings() {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Items } = await client.send(new ScanCommand({ TableName: TABLES.USERS }));
    return (Items ?? []).sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  },

  async getUserById(userId) {
    const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Item } = await client.send(new GetCommand({ TableName: TABLES.USERS, Key: { userId } }));
    return Item ?? null;
  },

  async updateUserProfile(userId, updates) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const keys = Object.keys(updates);
    const expr = keys.map((k, i) => `#f${i} = :v${i}`).join(', ');
    const names = Object.fromEntries(keys.map((k, i) => [`#f${i}`, k]));
    const vals  = Object.fromEntries(keys.map((k, i) => [`:v${i}`, updates[k]]));
    await client.send(new UpdateCommand({
      TableName:                 TABLES.USERS,
      Key:                       { userId },
      UpdateExpression:          `SET ${expr}`,
      ExpressionAttributeNames:  names,
      ExpressionAttributeValues: vals,
    }));
    return { userId, ...updates };
  },

  async getUserPredictions(userId) {
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Items } = await client.send(new QueryCommand({
      TableName:                 TABLES.PREDICTIONS,
      KeyConditionExpression:    'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));
    return Items ?? [];
  },

  async savePrediction(userId, matchId, homeGoals, awayGoals) {
    const { PutCommand, GetCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();

    // Get match to check kickoff
    const { Item: match } = await client.send(new GetCommand({ TableName: TABLES.MATCHES, Key: { matchId } }));
    if (!match) throw new Error('Partido no encontrado');
    if (new Date(match.kickoff) <= new Date()) throw new Error('El partido ya comenzó.');

    const pred = {
      userId, matchId, homeGoals, awayGoals,
      points:    null,
      createdAt: new Date().toISOString(),
    };
    await client.send(new PutCommand({ TableName: TABLES.PREDICTIONS, Item: pred }));
    return pred;
  },
};

/* ═══════════════════════════════════════════════════════════
   EXPORTED UNIFIED API
═══════════════════════════════════════════════════════════ */

const db = IS_DEV ? devDB : prodDB;

export const getMatches         = (...args) => db.getMatches(...args);
export const getMatchById       = (...args) => db.getMatchById(...args);
export const getStandings       = ()        => db.getStandings();
export const getUserById        = (...args) => db.getUserById(...args);
export const updateUserProfile  = (...args) => db.updateUserProfile(...args);
export const getUserPredictions = (...args) => db.getUserPredictions(...args);
export const savePrediction     = (...args) => db.savePrediction(...args);
