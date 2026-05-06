import { readFileSync } from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' }); // Cambia tu región aquí
const docClient = DynamoDBDocumentClient.from(client);

// Lee los archivos
const matches = JSON.parse(readFileSync('otros/polla-matches-fixed.json', 'utf-8'));
const teams = JSON.parse(readFileSync('otros/polla-teams-fixed.json', 'utf-8'));

async function loadData() {
  console.log('⏳ Cargando matches...');
  for (const match of matches) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'polla-matches',
        Item: match
      }));
    } catch (err) {
      console.error(`Error en ${match.matchId}:`, err.message);
    }
  }
  console.log(`✅ ${matches.length} matches cargados`);

  console.log('\n⏳ Cargando teams...');
  for (const team of teams) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'polla-teams',
        Item: team
      }));
    } catch (err) {
      console.error(`Error en ${team.teamId}:`, err.message);
    }
  }
  console.log(`✅ ${teams.length} teams cargados`);
  process.exit(0);
}

loadData().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
