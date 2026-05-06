import { TEAMS } from '../src/data/mockData.js';

const teamsForDB = Object.entries(TEAMS).map(([teamId, team]) => ({
  teamId: team.id,
  group: team.group,
  name: team.name,
  flag: team.flag
}));

console.log(JSON.stringify(teamsForDB, null, 2));
