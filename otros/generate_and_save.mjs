import { MATCHES, TEAMS } from '../src/data/mockData.js';
import { writeFileSync } from 'fs';

// Generate matches
const matchesForDB = MATCHES.filter(m => m.phase === 'group').map(m => ({
  matchId: m.matchId,
  group: m.group,
  phase: m.phase,
  matchday: m.matchday,
  date: m.date,
  time: m.time,
  kickoff: m.kickoff,
  stadium: m.stadium,
  city: m.city,
  country: m.country,
  capacity: m.capacity,
  homeTeam: m.homeTeam ? {
    id: m.homeTeam.id,
    name: m.homeTeam.name,
    flag: m.homeTeam.flag,
    group: m.homeTeam.group
  } : null,
  awayTeam: m.awayTeam ? {
    id: m.awayTeam.id,
    name: m.awayTeam.name,
    flag: m.awayTeam.flag,
    group: m.awayTeam.group
  } : null,
  result: null,
  scorers: [],
  status: 'upcoming',
  tbd: false
}));

// Generate teams
const teamsForDB = Object.entries(TEAMS).map(([teamId, team]) => ({
  teamId: team.id,
  group: team.group,
  name: team.name,
  flag: team.flag
}));

// Write without BOM
writeFileSync('otros/polla-matches-fixed.json', JSON.stringify(matchesForDB, null, 2), 'utf8');
writeFileSync('otros/polla-teams-fixed.json', JSON.stringify(teamsForDB, null, 2), 'utf8');

console.log('✅ Archivos generados sin BOM');
console.log(`   - polla-matches-fixed.json: ${matchesForDB.length} matches`);
console.log(`   - polla-teams-fixed.json: ${teamsForDB.length} teams`);
