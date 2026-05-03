/* ─────────────────────────────────────────────────────────────────────────────
   src/data/mockData.js
   Mock database for development (npm run dev).
   Mirrors the DynamoDB table structure exactly.
───────────────────────────────────────────────────────────────────────────── */

// ── Stadiums ──────────────────────────────────────────────────────────────────
export const STADIUMS = [
  { id: 'metlife',    name: 'MetLife Stadium',             city: 'East Rutherford, NJ', country: 'USA',    capacity: 82_500 },
  { id: 'atandt',     name: 'AT&T Stadium',                city: 'Arlington, TX',        country: 'USA',    capacity: 80_000 },
  { id: 'sofi',       name: 'SoFi Stadium',                city: 'Inglewood, CA',        country: 'USA',    capacity: 70_000 },
  { id: 'levis',      name: "Levi's Stadium",              city: 'Santa Clara, CA',      country: 'USA',    capacity: 68_500 },
  { id: 'lincoln',    name: 'Lincoln Financial Field',     city: 'Philadelphia, PA',     country: 'USA',    capacity: 69_800 },
  { id: 'arrowhead',  name: 'Arrowhead Stadium',           city: 'Kansas City, MO',      country: 'USA',    capacity: 76_416 },
  { id: 'empower',    name: 'Empower Field at Mile High',  city: 'Denver, CO',           country: 'USA',    capacity: 76_125 },
  { id: 'gillette',   name: 'Gillette Stadium',            city: 'Foxborough, MA',       country: 'USA',    capacity: 65_878 },
  { id: 'nrg',        name: 'NRG Stadium',                 city: 'Houston, TX',          country: 'USA',    capacity: 72_220 },
  { id: 'hardrock',   name: 'Hard Rock Stadium',           city: 'Miami Gardens, FL',    country: 'USA',    capacity: 64_767 },
  { id: 'lumen',      name: 'Lumen Field',                 city: 'Seattle, WA',          country: 'USA',    capacity: 68_740 },
  { id: 'bcplace',    name: 'BC Place',                    city: 'Vancouver',            country: 'Canada', capacity: 54_500 },
  { id: 'bmo',        name: 'BMO Field',                   city: 'Toronto',              country: 'Canada', capacity: 30_000 },
  { id: 'azteca',     name: 'Estadio Azteca',              city: 'Ciudad de México',     country: 'México', capacity: 83_357 },
  { id: 'akron',      name: 'Estadio Akron',               city: 'Guadalajara',          country: 'México', capacity: 49_850 },
  { id: 'bbva',       name: 'Estadio BBVA',                city: 'Monterrey',            country: 'México', capacity: 51_348 },
];

const S = STADIUMS;
const st = (id) => STADIUMS.find(s => s.id === id);

// ── Teams ─────────────────────────────────────────────────────────────────────
// group: group letter A–L
export const TEAMS = {
  // Group A
  usa:        { id: 'usa',        name: 'Estados Unidos', flag: '🇺🇸', group: 'A' },
  mexico:     { id: 'mexico',     name: 'México',         flag: '🇲🇽', group: 'A' },
  canada:     { id: 'canada',     name: 'Canadá',         flag: '🇨🇦', group: 'A' },
  honduras:   { id: 'honduras',   name: 'Honduras',       flag: '🇭🇳', group: 'A' },
  // Group B
  brazil:     { id: 'brazil',     name: 'Brasil',         flag: '🇧🇷', group: 'B' },
  colombia:   { id: 'colombia',   name: 'Colombia',       flag: '🇨🇴', group: 'B' },
  uruguay:    { id: 'uruguay',    name: 'Uruguay',        flag: '🇺🇾', group: 'B' },
  ecuador:    { id: 'ecuador',    name: 'Ecuador',        flag: '🇪🇨', group: 'B' },
  // Group C
  argentina:  { id: 'argentina',  name: 'Argentina',      flag: '🇦🇷', group: 'C' },
  chile:      { id: 'chile',      name: 'Chile',          flag: '🇨🇱', group: 'C' },
  peru:       { id: 'peru',       name: 'Perú',           flag: '🇵🇪', group: 'C' },
  bolivia:    { id: 'bolivia',    name: 'Bolivia',        flag: '🇧🇴', group: 'C' },
  // Group D
  france:     { id: 'france',     name: 'Francia',        flag: '🇫🇷', group: 'D' },
  morocco:    { id: 'morocco',    name: 'Marruecos',      flag: '🇲🇦', group: 'D' },
  senegal:    { id: 'senegal',    name: 'Senegal',        flag: '🇸🇳', group: 'D' },
  algeria:    { id: 'algeria',    name: 'Argelia',        flag: '🇩🇿', group: 'D' },
  // Group E
  spain:      { id: 'spain',      name: 'España',         flag: '🇪🇸', group: 'E' },
  germany:    { id: 'germany',    name: 'Alemania',       flag: '🇩🇪', group: 'E' },
  croatia:    { id: 'croatia',    name: 'Croacia',        flag: '🇭🇷', group: 'E' },
  austria:    { id: 'austria',    name: 'Austria',        flag: '🇦🇹', group: 'E' },
  // Group F
  england:    { id: 'england',    name: 'Inglaterra',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F' },
  netherlands:{ id: 'netherlands',name: 'Países Bajos',   flag: '🇳🇱', group: 'F' },
  belgium:    { id: 'belgium',    name: 'Bélgica',        flag: '🇧🇪', group: 'F' },
  denmark:    { id: 'denmark',    name: 'Dinamarca',      flag: '🇩🇰', group: 'F' },
  // Group G
  portugal:   { id: 'portugal',   name: 'Portugal',       flag: '🇵🇹', group: 'G' },
  poland:     { id: 'poland',     name: 'Polonia',        flag: '🇵🇱', group: 'G' },
  ukraine:    { id: 'ukraine',    name: 'Ucrania',        flag: '🇺🇦', group: 'G' },
  turkey:     { id: 'turkey',     name: 'Turquía',        flag: '🇹🇷', group: 'G' },
  // Group H
  italy:      { id: 'italy',      name: 'Italia',         flag: '🇮🇹', group: 'H' },
  serbia:     { id: 'serbia',     name: 'Serbia',         flag: '🇷🇸', group: 'H' },
  czechia:    { id: 'czechia',    name: 'Chequia',        flag: '🇨🇿', group: 'H' },
  slovakia:   { id: 'slovakia',   name: 'Eslovaquia',     flag: '🇸🇰', group: 'H' },
  // Group I
  japan:      { id: 'japan',      name: 'Japón',          flag: '🇯🇵', group: 'I' },
  southkorea: { id: 'southkorea', name: 'Corea del Sur',  flag: '🇰🇷', group: 'I' },
  australia:  { id: 'australia',  name: 'Australia',      flag: '🇦🇺', group: 'I' },
  saudiarabia:{ id: 'saudiarabia',name: 'Arabia Saudita', flag: '🇸🇦', group: 'I' },
  // Group J
  iran:       { id: 'iran',       name: 'Irán',           flag: '🇮🇷', group: 'J' },
  qatar:      { id: 'qatar',      name: 'Qatar',          flag: '🇶🇦', group: 'J' },
  egypt:      { id: 'egypt',      name: 'Egipto',         flag: '🇪🇬', group: 'J' },
  nigeria:    { id: 'nigeria',    name: 'Nigeria',        flag: '🇳🇬', group: 'J' },
  // Group K
  cameroon:   { id: 'cameroon',   name: 'Camerún',        flag: '🇨🇲', group: 'K' },
  ghana:      { id: 'ghana',      name: 'Ghana',          flag: '🇬🇭', group: 'K' },
  mali:       { id: 'mali',       name: 'Mali',           flag: '🇲🇱', group: 'K' },
  tunisia:    { id: 'tunisia',    name: 'Túnez',          flag: '🇹🇳', group: 'K' },
  // Group L
  costarica:  { id: 'costarica',  name: 'Costa Rica',     flag: '🇨🇷', group: 'L' },
  panama:     { id: 'panama',     name: 'Panamá',         flag: '🇵🇦', group: 'L' },
  jamaica:    { id: 'jamaica',    name: 'Jamaica',        flag: '🇯🇲', group: 'L' },
  elsalvador: { id: 'elsalvador', name: 'El Salvador',    flag: '🇸🇻', group: 'L' },
};

// ── Group definitions ─────────────────────────────────────────────────────────
// Each group: [T1, T2, T3, T4]  (matchday order)
const GROUP_DEF = {
  A: ['usa', 'mexico', 'canada', 'honduras'],
  B: ['brazil', 'colombia', 'uruguay', 'ecuador'],
  C: ['argentina', 'chile', 'peru', 'bolivia'],
  D: ['france', 'morocco', 'senegal', 'algeria'],
  E: ['spain', 'germany', 'croatia', 'austria'],
  F: ['england', 'netherlands', 'belgium', 'denmark'],
  G: ['portugal', 'poland', 'ukraine', 'turkey'],
  H: ['italy', 'serbia', 'czechia', 'slovakia'],
  I: ['japan', 'southkorea', 'australia', 'saudiarabia'],
  J: ['iran', 'qatar', 'egypt', 'nigeria'],
  K: ['cameroon', 'ghana', 'mali', 'tunisia'],
  L: ['costarica', 'panama', 'jamaica', 'elsalvador'],
};

// ── Match results for completed games ────────────────────────────────────────
// key: `${group}_MD${matchday}_${matchIndex}`  →  { homeGoals, awayGoals, scorers }
const RESULTS = {
  // ─ Group A ─
  A_MD1_1: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'usa', player: 'Pulisic', minute: 34 }, { team: 'usa', player: 'Reyna', minute: 67 }, { team: 'mexico', player: 'Jiménez', minute: 45 }] },
  A_MD1_2: { homeGoals: 0, awayGoals: 0, scorers: [] },
  A_MD2_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'usa', player: 'Adams', minute: 72 }] },
  A_MD2_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'mexico', player: 'Jiménez', minute: 20 }, { team: 'mexico', player: 'Lozano', minute: 88 }] },
  // ─ Group B ─
  B_MD1_1: { homeGoals: 3, awayGoals: 0, scorers: [{ team: 'brazil', player: 'Vinicius Jr.', minute: 12 }, { team: 'brazil', player: 'Rodrygo', minute: 55 }, { team: 'brazil', player: 'Endrick', minute: 80 }] },
  B_MD1_2: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'uruguay', player: 'Núñez', minute: 38 }] },
  B_MD2_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'brazil', player: 'Vinicius Jr.', minute: 61 }] },
  B_MD2_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'colombia', player: 'Díaz L.', minute: 29 }, { team: 'colombia', player: 'Córdoba', minute: 70 }] },
  // ─ Group C ─
  C_MD1_1: { homeGoals: 3, awayGoals: 0, scorers: [{ team: 'argentina', player: 'Messi', minute: 11 }, { team: 'argentina', player: 'Álvarez', minute: 44 }, { team: 'argentina', player: 'Messi', minute: 77 }] },
  C_MD1_2: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'peru', player: 'Guerrero', minute: 33 }, { team: 'peru', player: 'Flores', minute: 60 }, { team: 'bolivia', player: 'Moreno', minute: 85 }] },
  C_MD2_1: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'argentina', player: 'Messi', minute: 24 }, { team: 'argentina', player: 'Di María', minute: 66 }] },
  C_MD2_2: { homeGoals: 3, awayGoals: 0, scorers: [{ team: 'chile', player: 'Vidal', minute: 15 }, { team: 'chile', player: 'Sánchez', minute: 52 }, { team: 'chile', player: 'Sánchez', minute: 74 }] },
  // ─ Group D ─
  D_MD1_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'france', player: 'Mbappé', minute: 58 }] },
  D_MD1_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'senegal', player: 'Diatta', minute: 30 }, { team: 'senegal', player: 'Sarr', minute: 75 }] },
  D_MD2_1: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'france', player: 'Mbappé', minute: 9 }, { team: 'france', player: 'Griezmann', minute: 55 }] },
  D_MD2_2: { homeGoals: 1, awayGoals: 1, scorers: [{ team: 'morocco', player: 'En-Nesyri', minute: 40 }, { team: 'algeria', player: 'Mahrez', minute: 65 }] },
  // ─ Group E ─
  E_MD1_1: { homeGoals: 2, awayGoals: 2, scorers: [{ team: 'spain', player: 'Pedri', minute: 23 }, { team: 'germany', player: 'Müller', minute: 45 }, { team: 'spain', player: 'Morata', minute: 60 }, { team: 'germany', player: 'Gnabry', minute: 78 }] },
  E_MD1_2: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'croatia', player: 'Modrić', minute: 49 }] },
  E_MD2_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'spain', player: 'Gavi', minute: 82 }] },
  E_MD2_2: { homeGoals: 3, awayGoals: 0, scorers: [{ team: 'germany', player: 'Müller', minute: 18 }, { team: 'germany', player: 'Havertz', minute: 55 }, { team: 'germany', player: 'Gnabry', minute: 88 }] },
  // ─ Group F ─
  F_MD1_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'england', player: 'Kane', minute: 37 }] },
  F_MD1_2: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'belgium', player: 'Doku', minute: 22 }, { team: 'belgium', player: 'De Bruyne', minute: 67 }, { team: 'denmark', player: 'Eriksen', minute: 50 }] },
  F_MD2_1: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'england', player: 'Kane', minute: 14 }, { team: 'england', player: 'Saka', minute: 70 }, { team: 'belgium', player: 'Lukaku', minute: 45 }] },
  F_MD2_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'netherlands', player: 'Gakpo', minute: 35 }, { team: 'netherlands', player: 'Depay', minute: 60 }] },
  // ─ Group G ─
  G_MD1_1: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'portugal', player: 'Ronaldo', minute: 28 }, { team: 'portugal', player: 'B.Silva', minute: 71 }] },
  G_MD1_2: { homeGoals: 1, awayGoals: 1, scorers: [{ team: 'ukraine', player: 'Mudryk', minute: 43 }, { team: 'turkey', player: 'Calhanoglu', minute: 60 }] },
  G_MD2_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'portugal', player: 'Ronaldo', minute: 55 }] },
  G_MD2_2: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'poland', player: 'Lewandowski', minute: 30 }, { team: 'poland', player: 'Zalewski', minute: 66 }, { team: 'turkey', player: 'Yilmaz', minute: 44 }] },
  // ─ Group H ─
  H_MD1_1: { homeGoals: 0, awayGoals: 0, scorers: [] },
  H_MD1_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'czechia', player: 'Schick', minute: 25 }, { team: 'czechia', player: 'Kuchta', minute: 78 }] },
  H_MD2_1: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'italy', player: 'Immobile', minute: 33 }, { team: 'italy', player: 'Barella', minute: 77 }] },
  H_MD2_2: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'serbia', player: 'Mitrović', minute: 59 }] },
  // ─ Group I ─
  I_MD1_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'japan', player: 'Kubo', minute: 65 }] },
  I_MD1_2: { homeGoals: 2, awayGoals: 0, scorers: [{ team: 'australia', player: 'Hrustic', minute: 40 }, { team: 'australia', player: 'Leckie', minute: 74 }] },
  // ─ Group J ─
  J_MD1_1: { homeGoals: 1, awayGoals: 2, scorers: [{ team: 'qatar', player: 'Al-Haydos', minute: 31 }, { team: 'qatar', player: 'Muntari', minute: 72 }, { team: 'iran', player: 'Azmoun', minute: 50 }] },
  J_MD1_2: { homeGoals: 0, awayGoals: 1, scorers: [{ team: 'nigeria', player: 'Osimhen', minute: 44 }] },
  // ─ Group K ─
  K_MD1_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'cameroon', player: 'Aboubakar', minute: 55 }] },
  K_MD1_2: { homeGoals: 2, awayGoals: 1, scorers: [{ team: 'mali', player: 'Koné', minute: 20 }, { team: 'mali', player: 'Traoré', minute: 60 }, { team: 'tunisia', player: 'Msakni', minute: 48 }] },
  // ─ Group L ─
  L_MD1_1: { homeGoals: 1, awayGoals: 0, scorers: [{ team: 'costarica', player: 'Campbell', minute: 38 }] },
  L_MD1_2: { homeGoals: 0, awayGoals: 2, scorers: [{ team: 'elsalvador', player: 'Reyes', minute: 22 }, { team: 'elsalvador', player: 'Rodríguez', minute: 80 }] },
};

// ── Match schedule skeleton ────────────────────────────────────────────────────
// Dates / times / stadiums (spread across the tournament calendar)
const SCHEDULE = {
  A: {
    MD1: [
      { date: '2026-06-11', time: '18:00', stadium: 'azteca'  },
      { date: '2026-06-11', time: '21:00', stadium: 'bcplace' },
    ],
    MD2: [
      { date: '2026-06-16', time: '15:00', stadium: 'bmo'    },
      { date: '2026-06-16', time: '18:00', stadium: 'azteca' },
    ],
    MD3: [
      { date: '2026-06-21', time: '20:00', stadium: 'azteca'  },
      { date: '2026-06-21', time: '20:00', stadium: 'bcplace' },
    ],
  },
  B: {
    MD1: [
      { date: '2026-06-12', time: '15:00', stadium: 'metlife'  },
      { date: '2026-06-12', time: '18:00', stadium: 'hardrock' },
    ],
    MD2: [
      { date: '2026-06-17', time: '12:00', stadium: 'nrg'    },
      { date: '2026-06-17', time: '15:00', stadium: 'metlife' },
    ],
    MD3: [
      { date: '2026-06-22', time: '20:00', stadium: 'metlife'  },
      { date: '2026-06-22', time: '20:00', stadium: 'hardrock' },
    ],
  },
  C: {
    MD1: [
      { date: '2026-06-12', time: '21:00', stadium: 'atandt'   },
      { date: '2026-06-13', time: '12:00', stadium: 'sofi'     },
    ],
    MD2: [
      { date: '2026-06-17', time: '18:00', stadium: 'atandt'  },
      { date: '2026-06-17', time: '21:00', stadium: 'sofi'    },
    ],
    MD3: [
      { date: '2026-06-22', time: '20:00', stadium: 'atandt'  },
      { date: '2026-06-22', time: '20:00', stadium: 'sofi'    },
    ],
  },
  D: {
    MD1: [
      { date: '2026-06-13', time: '15:00', stadium: 'levis'    },
      { date: '2026-06-13', time: '18:00', stadium: 'lincoln'  },
    ],
    MD2: [
      { date: '2026-06-18', time: '12:00', stadium: 'levis'   },
      { date: '2026-06-18', time: '15:00', stadium: 'lincoln' },
    ],
    MD3: [
      { date: '2026-06-23', time: '20:00', stadium: 'levis'   },
      { date: '2026-06-23', time: '20:00', stadium: 'lincoln' },
    ],
  },
  E: {
    MD1: [
      { date: '2026-06-13', time: '21:00', stadium: 'arrowhead' },
      { date: '2026-06-14', time: '12:00', stadium: 'empower'   },
    ],
    MD2: [
      { date: '2026-06-18', time: '18:00', stadium: 'arrowhead' },
      { date: '2026-06-18', time: '21:00', stadium: 'empower'   },
    ],
    MD3: [
      { date: '2026-06-23', time: '20:00', stadium: 'arrowhead' },
      { date: '2026-06-23', time: '20:00', stadium: 'empower'   },
    ],
  },
  F: {
    MD1: [
      { date: '2026-06-14', time: '15:00', stadium: 'gillette' },
      { date: '2026-06-14', time: '18:00', stadium: 'lumen'    },
    ],
    MD2: [
      { date: '2026-06-19', time: '12:00', stadium: 'gillette' },
      { date: '2026-06-19', time: '15:00', stadium: 'lumen'    },
    ],
    MD3: [
      { date: '2026-06-24', time: '20:00', stadium: 'gillette' },
      { date: '2026-06-24', time: '20:00', stadium: 'lumen'    },
    ],
  },
  G: {
    MD1: [
      { date: '2026-06-14', time: '21:00', stadium: 'akron'    },
      { date: '2026-06-15', time: '12:00', stadium: 'bbva'     },
    ],
    MD2: [
      { date: '2026-06-19', time: '18:00', stadium: 'akron'   },
      { date: '2026-06-19', time: '21:00', stadium: 'bbva'    },
    ],
    MD3: [
      { date: '2026-06-24', time: '20:00', stadium: 'akron'   },
      { date: '2026-06-24', time: '20:00', stadium: 'bbva'    },
    ],
  },
  H: {
    MD1: [
      { date: '2026-06-15', time: '15:00', stadium: 'atandt'  },
      { date: '2026-06-15', time: '18:00', stadium: 'sofi'    },
    ],
    MD2: [
      { date: '2026-06-20', time: '12:00', stadium: 'atandt' },
      { date: '2026-06-20', time: '15:00', stadium: 'sofi'   },
    ],
    MD3: [
      { date: '2026-06-25', time: '20:00', stadium: 'atandt' },
      { date: '2026-06-25', time: '20:00', stadium: 'sofi'   },
    ],
  },
  I: {
    MD1: [
      { date: '2026-06-15', time: '21:00', stadium: 'levis'    },
      { date: '2026-06-16', time: '12:00', stadium: 'lumen'    },
    ],
    MD2: [
      { date: '2026-06-21', time: '12:00', stadium: 'levis'  },
      { date: '2026-06-21', time: '15:00', stadium: 'lumen'  },
    ],
    MD3: [
      { date: '2026-06-25', time: '20:00', stadium: 'levis'  },
      { date: '2026-06-25', time: '20:00', stadium: 'lumen'  },
    ],
  },
  J: {
    MD1: [
      { date: '2026-06-16', time: '15:00', stadium: 'nrg'      },
      { date: '2026-06-16', time: '18:00', stadium: 'lincoln'  },
    ],
    MD2: [
      { date: '2026-06-21', time: '18:00', stadium: 'nrg'     },
      { date: '2026-06-21', time: '21:00', stadium: 'lincoln' },
    ],
    MD3: [
      { date: '2026-06-26', time: '20:00', stadium: 'nrg'     },
      { date: '2026-06-26', time: '20:00', stadium: 'lincoln' },
    ],
  },
  K: {
    MD1: [
      { date: '2026-06-16', time: '21:00', stadium: 'arrowhead' },
      { date: '2026-06-17', time: '12:00', stadium: 'empower'   },
    ],
    MD2: [
      { date: '2026-06-22', time: '12:00', stadium: 'arrowhead' },
      { date: '2026-06-22', time: '15:00', stadium: 'empower'   },
    ],
    MD3: [
      { date: '2026-06-26', time: '20:00', stadium: 'arrowhead' },
      { date: '2026-06-26', time: '20:00', stadium: 'empower'   },
    ],
  },
  L: {
    MD1: [
      { date: '2026-06-17', time: '15:00', stadium: 'hardrock' },
      { date: '2026-06-17', time: '18:00', stadium: 'bbva'     },
    ],
    MD2: [
      { date: '2026-06-22', time: '18:00', stadium: 'hardrock' },
      { date: '2026-06-22', time: '21:00', stadium: 'bbva'     },
    ],
    MD3: [
      { date: '2026-06-26', time: '20:00', stadium: 'hardrock' },
      { date: '2026-06-26', time: '20:00', stadium: 'bbva'     },
    ],
  },
};

// ── Generate matches ──────────────────────────────────────────────────────────
function generateMatches() {
  const matches = [];
  const now = new Date(); // real "now"

  for (const [group, teams] of Object.entries(GROUP_DEF)) {
    const [t1, t2, t3, t4] = teams;
    const matchdayPairs = [
      { md: 1, pairs: [[t1, t2], [t3, t4]] },
      { md: 2, pairs: [[t1, t3], [t2, t4]] },
      { md: 3, pairs: [[t1, t4], [t2, t3]] },
    ];

    for (const { md, pairs } of matchdayPairs) {
      const scheds = SCHEDULE[group][`MD${md}`];

      pairs.forEach(([home, away], i) => {
        const resKey = `${group}_MD${md}_${i + 1}`;
        const sched = scheds[i];
        const stadium = st(sched.stadium);
        const dateTimeStr = `${sched.date}T${sched.time}:00`;
        const kickoffDate = new Date(dateTimeStr);
        const resultData = RESULTS[resKey] ?? null;
        const isFinished = resultData !== null;

        matches.push({
          id: `match_${group}_MD${md}_${i + 1}`,
          group,
          phase: 'group',
          matchday: md,
          homeTeam: TEAMS[home],
          awayTeam: TEAMS[away],
          date: sched.date,
          time: sched.time,
          kickoff: dateTimeStr,
          stadium: stadium?.name ?? '',
          city: stadium?.city ?? '',
          country: stadium?.country ?? '',
          capacity: stadium?.capacity ?? 0,
          result: resultData ? { homeGoals: resultData.homeGoals, awayGoals: resultData.awayGoals } : null,
          scorers: resultData?.scorers ?? [],
          status: isFinished ? 'finished' : (kickoffDate <= now ? 'live' : 'upcoming'),
        });
      });
    }
  }

  // Knockout placeholders
  const knockoutRounds = [
    { phase: 'r32', label: 'Dieciseisavos', count: 16, startDate: '2026-06-28' },
    { phase: 'r16', label: 'Octavos',        count: 8,  startDate: '2026-07-05' },
    { phase: 'qf',  label: 'Cuartos',        count: 4,  startDate: '2026-07-12' },
    { phase: 'sf',  label: 'Semifinal',       count: 2,  startDate: '2026-07-15' },
    { phase: 'fp',  label: 'Tercer Puesto',   count: 1,  startDate: '2026-07-18' },
    { phase: 'final', label: 'Final',         count: 1,  startDate: '2026-07-19' },
  ];

  const koStadiums = ['metlife', 'azteca', 'sofi', 'atandt', 'levis', 'hardrock', 'nrg', 'lumen'];

  for (const { phase, count, startDate } of knockoutRounds) {
    for (let i = 0; i < count; i++) {
      const stad = st(koStadiums[i % koStadiums.length]);
      const d = new Date(startDate);
      d.setDate(d.getDate() + Math.floor(i / 2));
      const dateStr = d.toISOString().split('T')[0];
      matches.push({
        id: `match_${phase}_${i + 1}`,
        group: null,
        phase,
        matchday: null,
        homeTeam: null,
        awayTeam: null,
        date: dateStr,
        time: i % 2 === 0 ? '16:00' : '20:00',
        kickoff: `${dateStr}T${i % 2 === 0 ? '16' : '20'}:00:00`,
        stadium: stad?.name ?? '',
        city: stad?.city ?? '',
        country: stad?.country ?? '',
        capacity: stad?.capacity ?? 0,
        result: null,
        scorers: [],
        status: 'upcoming',
        tbd: true,
      });
    }
  }

  return matches;
}

export const MATCHES = generateMatches();

// ── Scoring function ──────────────────────────────────────────────────────────
export function calculatePoints(prediction, result) {
  if (!result) return null;
  const pH = prediction.homeGoals;
  const pA = prediction.awayGoals;
  const rH = result.homeGoals;
  const rA = result.awayGoals;

  if (pH === rH && pA === rA) return { points: 10, label: 'Resultado exacto 🎯' };
  if (pH === rH || pA === rA) return { points: 5,  label: 'Parcial (un marcador) ✅' };
  if ((pH + pA) === (rH + rA)) return { points: 5, label: 'Total de goles ⚽' };
  if ((pH - pA) === (rH - rA)) return { points: 3, label: 'Diferencia de goles 📊' };
  return { points: 0, label: 'Sin puntos ❌' };
}

// ── Mock users ────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id: 'user_001', username: 'Alfonso',    email: 'alfonso@example.com',   avatar: '🦁', totalPoints: 0, predCount: 0 },
  { id: 'user_002', username: 'María',      email: 'maria@example.com',     avatar: '🦊', totalPoints: 0, predCount: 0 },
  { id: 'user_003', username: 'Carlos',     email: 'carlos@example.com',    avatar: '🐯', totalPoints: 0, predCount: 0 },
  { id: 'user_004', username: 'Daniela',    email: 'daniela@example.com',   avatar: '🐼', totalPoints: 0, predCount: 0 },
  { id: 'user_005', username: 'Roberto',    email: 'roberto@example.com',   avatar: '🦅', totalPoints: 0, predCount: 0 },
  { id: 'user_006', username: 'Valentina',  email: 'valentina@example.com', avatar: '🦋', totalPoints: 0, predCount: 0 },
];

// ── Mock predictions ──────────────────────────────────────────────────────────
// Raw predictions (homeGoals, awayGoals) for each user per matchId
const RAW_PREDS = {
  // Alfonso (user_001) – MD1 + MD2 of groups A-H
  user_001: {
    match_A_MD1_1: [2, 0], match_A_MD1_2: [0, 0], match_A_MD2_1: [1, 0], match_A_MD2_2: [2, 1],
    match_B_MD1_1: [3, 0], match_B_MD1_2: [1, 0], match_B_MD2_1: [2, 0], match_B_MD2_2: [1, 1],
    match_C_MD1_1: [3, 0], match_C_MD1_2: [2, 0], match_C_MD2_1: [2, 1], match_C_MD2_2: [2, 0],
    match_D_MD1_1: [1, 1], match_D_MD1_2: [2, 0], match_D_MD2_1: [2, 0], match_D_MD2_2: [1, 0],
    match_E_MD1_1: [2, 1], match_E_MD1_2: [1, 0], match_E_MD2_1: [1, 0], match_E_MD2_2: [3, 0],
    match_F_MD1_1: [2, 0], match_F_MD1_2: [2, 1], match_F_MD2_1: [1, 0], match_F_MD2_2: [2, 0],
    match_G_MD1_1: [2, 0], match_G_MD1_2: [1, 1], match_G_MD2_1: [1, 0], match_G_MD2_2: [2, 0],
    match_H_MD1_1: [1, 0], match_H_MD1_2: [2, 0], match_H_MD2_1: [2, 0], match_H_MD2_2: [1, 0],
  },
  // María
  user_002: {
    match_A_MD1_1: [1, 1], match_A_MD1_2: [1, 0], match_A_MD2_1: [2, 0], match_A_MD2_2: [1, 0],
    match_B_MD1_1: [2, 1], match_B_MD1_2: [0, 1], match_B_MD2_1: [1, 0], match_B_MD2_2: [2, 0],
    match_C_MD1_1: [3, 0], match_C_MD1_2: [1, 1], match_C_MD2_1: [1, 0], match_C_MD2_2: [3, 0],
    match_D_MD1_1: [1, 0], match_D_MD1_2: [1, 0], match_D_MD2_1: [2, 0], match_D_MD2_2: [1, 1],
    match_E_MD1_1: [1, 2], match_E_MD1_2: [1, 0], match_E_MD2_1: [2, 0], match_E_MD2_2: [2, 0],
    match_F_MD1_1: [1, 0], match_F_MD1_2: [2, 1], match_F_MD2_1: [2, 1], match_F_MD2_2: [1, 0],
    match_G_MD1_1: [1, 0], match_G_MD1_2: [0, 0], match_G_MD2_1: [1, 0], match_G_MD2_2: [2, 1],
    match_H_MD1_1: [0, 0], match_H_MD1_2: [2, 0], match_H_MD2_1: [2, 0], match_H_MD2_2: [1, 0],
  },
  // Others: generate random-ish
  user_003: { match_A_MD1_1:[2,1],match_B_MD1_1:[2,0],match_C_MD1_1:[2,0],match_D_MD1_1:[1,0],match_E_MD1_1:[2,2],match_F_MD1_1:[1,0],match_G_MD1_1:[2,0],match_H_MD1_1:[1,1],match_A_MD2_1:[1,0],match_B_MD2_1:[1,0],match_C_MD2_1:[2,0],match_D_MD2_1:[1,0] },
  user_004: { match_A_MD1_1:[3,1],match_B_MD1_1:[3,0],match_C_MD1_1:[3,0],match_D_MD1_1:[2,0],match_E_MD1_1:[1,1],match_F_MD1_1:[2,0],match_G_MD1_1:[2,0],match_H_MD1_1:[0,0],match_A_MD2_1:[1,0],match_B_MD2_1:[1,0],match_C_MD2_1:[2,1],match_D_MD2_1:[2,0] },
  user_005: { match_A_MD1_1:[1,0],match_B_MD1_1:[2,1],match_C_MD1_1:[3,1],match_D_MD1_1:[0,0],match_E_MD1_1:[2,2],match_F_MD1_1:[1,0],match_G_MD1_1:[1,0],match_H_MD1_1:[0,0] },
  user_006: { match_A_MD1_1:[2,1],match_B_MD1_1:[4,0],match_C_MD1_1:[3,0],match_D_MD1_1:[1,0],match_E_MD1_1:[2,1],match_F_MD1_1:[1,0],match_G_MD1_1:[2,0],match_H_MD1_1:[1,1],match_A_MD2_1:[1,1],match_B_MD2_1:[1,0],match_C_MD2_1:[2,0],match_D_MD2_1:[2,0] },
};

// Build full prediction objects with calculated points
function buildPredictions() {
  const preds = [];
  let predId = 1;

  for (const [userId, matchPreds] of Object.entries(RAW_PREDS)) {
    for (const [matchId, [homeGoals, awayGoals]] of Object.entries(matchPreds)) {
      const match = MATCHES.find(m => m.id === matchId);
      if (!match) continue;
      const pointData = match.result ? calculatePoints({ homeGoals, awayGoals }, match.result) : null;
      preds.push({
        id: `pred_${String(predId++).padStart(4, '0')}`,
        userId,
        matchId,
        homeGoals,
        awayGoals,
        points: pointData?.points ?? null,
        pointLabel: pointData?.label ?? null,
        createdAt: new Date(`${match.date}T08:00:00`).toISOString(),
      });
    }
  }
  return preds;
}

export const PREDICTIONS = buildPredictions();

// ── Compute user standings ────────────────────────────────────────────────────
function computeStandings() {
  const stats = {};
  for (const u of MOCK_USERS) {
    stats[u.id] = { ...u, totalPoints: 0, predCount: 0, exactCount: 0, partialCount: 0 };
  }
  for (const p of PREDICTIONS) {
    if (!stats[p.userId]) continue;
    stats[p.userId].predCount++;
    if (p.points !== null) {
      stats[p.userId].totalPoints += p.points;
      if (p.points === 10) stats[p.userId].exactCount++;
      else if (p.points >= 3) stats[p.userId].partialCount++;
    }
  }
  return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
}

export const STANDINGS = computeStandings();

// ── Group standings ───────────────────────────────────────────────────────────
export function computeGroupStandings() {
  const groups = {};

  for (const group of Object.keys(GROUP_DEF)) {
    groups[group] = {};
    for (const teamId of GROUP_DEF[group]) {
      groups[group][teamId] = { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
  }

  for (const match of MATCHES) {
    if (match.phase !== 'group' || !match.result || match.tbd) continue;
    const { homeTeam, awayTeam, group, result: { homeGoals, awayGoals } } = match;
    if (!homeTeam || !awayTeam) continue;
    const h = groups[group]?.[homeTeam.id];
    const a = groups[group]?.[awayTeam.id];
    if (!h || !a) continue;

    h.played++; h.gf += homeGoals; h.ga += awayGoals;
    a.played++; a.gf += awayGoals; a.ga += homeGoals;

    if (homeGoals > awayGoals)      { h.won++;   h.pts += 3; a.lost++; }
    else if (homeGoals < awayGoals) { a.won++;   a.pts += 3; h.lost++; }
    else                            { h.drawn++; h.pts += 1; a.drawn++; a.pts += 1; }

    h.gd = h.gf - h.ga;
    a.gd = a.gf - a.ga;
  }

  const result = {};
  for (const [group, teamsObj] of Object.entries(groups)) {
    result[group] = Object.values(teamsObj).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    );
  }
  return result;
}

// ── Top Scorers ───────────────────────────────────────────────────────────────
export function computeTopScorers() {
  const scorers = {};
  for (const match of MATCHES) {
    if (!match.scorers?.length) continue;
    for (const s of match.scorers) {
      const key = `${s.player}_${s.team}`;
      if (!scorers[key]) scorers[key] = { player: s.player, team: TEAMS[s.team]?.name ?? s.team, flag: TEAMS[s.team]?.flag ?? '', goals: 0 };
      scorers[key].goals++;
    }
  }
  return Object.values(scorers).sort((a, b) => b.goals - a.goals);
}

// ── Logged-in mock user ───────────────────────────────────────────────────────
export const MOCK_CURRENT_USER = {
  ...MOCK_USERS[0],
  sub: 'mock-cognito-sub-001',
};
