import { MATCHES, TEAMS } from '../src/data/mockData.js';

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

console.log(JSON.stringify(matchesForDB, null, 2));
