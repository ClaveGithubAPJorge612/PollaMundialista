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
  MATCHES, PREDICTIONS, STANDINGS, MOCK_USERS, MOCK_TEAMS, calculatePoints,
} from '../data/mockData';

const IS_DEV = import.meta.env.VITE_ENV === 'development';

/* ═══════════════════════════════════════════════════════════
   DEV LAYER  –  in-memory store backed by mockData.js
═══════════════════════════════════════════════════════════ */

// Mutable copies for dev environment with localStorage persistence
const _initMatches = () => {
  const stored = localStorage.getItem('dev_matches');
  return stored ? JSON.parse(stored) : [...MATCHES];
};

const _initPredictions = () => {
  const stored = localStorage.getItem('dev_predictions');
  return stored ? JSON.parse(stored) : [];
};

const _matches     = _initMatches();
const _predictions = _initPredictions();
const _users       = [...MOCK_USERS];
const _teams       = [...MOCK_TEAMS];

const _saveMatches = () => localStorage.setItem('dev_matches', JSON.stringify(_matches));
const _savePredictions = () => localStorage.setItem('dev_predictions', JSON.stringify(_predictions));

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
    return _matches.find(m => m.matchId === matchId) ?? null;
  },

  /* ── Match Admin Ops ── */
  async getMatchPredictions(matchId) {
    await delay();
    return _predictions.filter(p => p.matchId === matchId);
  },

  async updateMatch(matchId, updates) {
    await delay(400);
    const idx = _matches.findIndex(m => m.matchId === matchId);
    if (idx === -1) throw new Error('Partido no encontrado');
    _matches[idx] = { ..._matches[idx], ...updates };
    _saveMatches();
    return _matches[idx];
  },

  async updatePredictionPoints(userId, matchId, points, pointLabel) {
    await delay(300);
    const idx = _predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
    if (idx === -1) throw new Error('Predicción no encontrada');
    _predictions[idx] = { ..._predictions[idx], points, pointLabel };
    _savePredictions();
    return _predictions[idx];
  },

  /* ── Teams ── */
  async getTeams() {
    await delay();
    return [..._teams];
  },

  async updateTeamGroup(teamId, group) {
    await delay(300);
    const idx = _teams.findIndex(t => t.teamId === teamId);
    if (idx === -1) throw new Error('Equipo no encontrado');
    _teams[idx] = { ..._teams[idx], group };
    return _teams[idx];
  },

  /* ── User Stats ── */
  async getAllUsers() {
    await delay();
    return [..._users];
  },

  async updateUserStatsAfterRecalc(userId, stats) {
    await delay(300);
    const idx = _users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado');
    _users[idx] = { ..._users[idx], ...stats };
    return _users[idx];
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
    const match = _matches.find(m => m.matchId === matchId);
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

    _savePredictions();
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

const TABLES_PROD = {
  ...TABLES,
  TEAMS: import.meta.env.VITE_DYNAMO_TEAMS_TABLE || 'polla-teams',
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

  async getMatchPredictions(matchId) {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Items } = await client.send(new ScanCommand({
      TableName: TABLES.PREDICTIONS,
      FilterExpression: 'matchId = :mid',
      ExpressionAttributeValues: { ':mid': matchId },
    }));
    return Items ?? [];
  },

  async updateMatch(matchId, updates) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const keys = Object.keys(updates);
    const expr = keys.map((k, i) => `#f${i} = :v${i}`).join(', ');
    const names = Object.fromEntries(keys.map((k, i) => [`#f${i}`, k]));
    const vals  = Object.fromEntries(keys.map((k, i) => [`:v${i}`, updates[k]]));
    await client.send(new UpdateCommand({
      TableName: TABLES.MATCHES,
      Key: { matchId },
      UpdateExpression: `SET ${expr}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: vals,
    }));
    return { matchId, ...updates };
  },

  async updatePredictionPoints(userId, matchId, points, pointLabel) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    await client.send(new UpdateCommand({
      TableName: TABLES.PREDICTIONS,
      Key: { userId, matchId },
      UpdateExpression: 'SET points = :pts, pointLabel = :lbl',
      ExpressionAttributeValues: { ':pts': points, ':lbl': pointLabel },
    }));
    return { userId, matchId, points, pointLabel };
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

  async getTeams() {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Items } = await client.send(new ScanCommand({ TableName: TABLES_PROD.TEAMS }));
    return Items ?? [];
  },

  async updateTeamGroup(teamId, group) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    await client.send(new UpdateCommand({
      TableName: TABLES_PROD.TEAMS,
      Key: { teamId },
      UpdateExpression: 'SET #g = :grp',
      ExpressionAttributeNames: { '#g': 'group' },
      ExpressionAttributeValues: { ':grp': group },
    }));
    return { teamId, group };
  },

  async getAllUsers() {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const { Items } = await client.send(new ScanCommand({ TableName: TABLES.USERS }));
    return Items ?? [];
  },

  async updateUserStatsAfterRecalc(userId, stats) {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const client = await getDocClient();
    const keys = Object.keys(stats);
    const expr = keys.map((k, i) => `#f${i} = :v${i}`).join(', ');
    const names = Object.fromEntries(keys.map((k, i) => [`#f${i}`, k]));
    const vals  = Object.fromEntries(keys.map((k, i) => [`:v${i}`, stats[k]]));
    await client.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: `SET ${expr}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: vals,
    }));
    return { userId, ...stats };
  },
};

/* ═══════════════════════════════════════════════════════════
   EXPORTED UNIFIED API
═══════════════════════════════════════════════════════════ */

const db = IS_DEV ? devDB : prodDB;

export const getMatches            = (...args) => db.getMatches(...args);
export const getMatchById          = (...args) => db.getMatchById(...args);
export const getMatchPredictions   = (...args) => db.getMatchPredictions(...args);
export const updateMatch           = (...args) => db.updateMatch(...args);
export const updatePredictionPoints = (...args) => db.updatePredictionPoints(...args);
export const getStandings          = ()        => db.getStandings();
export const getUserById           = (...args) => db.getUserById(...args);
export const updateUserProfile     = (...args) => db.updateUserProfile(...args);
export const getUserPredictions    = (...args) => db.getUserPredictions(...args);
export const savePrediction        = (...args) => db.savePrediction(...args);
export const getTeams             = (...args) => db.getTeams(...args);
export const updateTeamGroup       = (...args) => db.updateTeamGroup(...args);
export const getAllUsers          = (...args) => db.getAllUsers(...args);
export const updateUserStatsAfterRecalc = (...args) => db.updateUserStatsAfterRecalc(...args);
