/* ─────────────────────────────────────────────────────────────────────────────
   src/services/adminService.js
   High-level admin operations orchestrating DynamoDB functions.
───────────────────────────────────────────────────────────────────────────── */

import {
  getMatchPredictions, updateMatch, updatePredictionPoints,
  getUserPredictions, updateUserStatsAfterRecalc,
} from './dynamodb';
import { calculatePoints } from '../data/mockData';

export async function saveMatchResult(matchId, homeGoals, awayGoals, scorers) {
  // 1. Update match with result and scorers
  await updateMatch(matchId, {
    status: 'finished',
    homeGoals,
    awayGoals,
    result: { homeGoals, awayGoals },
    scorers,
  });

  // 2. Fetch all predictions for this match
  const preds = await getMatchPredictions(matchId);

  // 3. Recalculate points for each prediction
  const result = { homeGoals, awayGoals };
  for (const pred of preds) {
    const pts = calculatePoints(
      { homeGoals: pred.homeGoals, awayGoals: pred.awayGoals },
      result
    );
    await updatePredictionPoints(pred.userId, matchId, pts.points, pts.label);
  }

  // 4. Update user standings
  const affectedUserIds = [...new Set(preds.map(p => p.userId))];
  for (const userId of affectedUserIds) {
    const allPreds = await getUserPredictions(userId);
    const totalPoints = allPreds.reduce((sum, p) => sum + (p.points ?? 0), 0);
    const exactCount = allPreds.filter(p => p.points === 10).length;
    const partialCount = allPreds.filter(p => p.points && p.points >= 3 && p.points < 10).length;
    const predCount = allPreds.length;

    await updateUserStatsAfterRecalc(userId, { totalPoints, exactCount, partialCount, predCount });
  }

  return { updatedPredictions: preds.length, affectedUsers: affectedUserIds.length };
}

export async function updateKnockoutTeams(matchId, homeTeam, awayTeam) {
  return await updateMatch(matchId, {
    homeTeam,
    awayTeam,
    tbd: false,
  });
}

export async function updateTopScorers(matchId, scorers) {
  return await updateMatch(matchId, { scorers });
}
