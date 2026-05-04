// Mapeo de team IDs (ISO alpha-3) a country codes de flag-icons (ISO alpha-2)
export const TEAM_TO_FLAG = {
  // Group A
  mex: 'mx',
  rsa: 'za',
  kor: 'kr',
  cze: 'cz',
  // Group B
  can: 'ca',
  bih: 'ba',
  qat: 'qa',
  sui: 'ch',
  // Group C
  bra: 'br',
  mar: 'ma',
  hai: 'ht',
  sco: 'gb-sct',
  // Group D
  usa: 'us',
  par: 'py',
  aus: 'au',
  tur: 'tr',
  // Group E
  ger: 'de',
  cuw: 'cw',
  civ: 'ci',
  ecu: 'ec',
  // Group F
  ned: 'nl',
  jpn: 'jp',
  swe: 'se',
  tun: 'tn',
  // Group G
  bel: 'be',
  egy: 'eg',
  irn: 'ir',
  nzl: 'nz',
  // Group H
  esp: 'es',
  cpv: 'cv',
  ksa: 'sa',
  uru: 'uy',
  // Group I
  fra: 'fr',
  sen: 'sn',
  irq: 'iq',
  nor: 'no',
  // Group J
  arg: 'ar',
  alg: 'dz',
  aut: 'at',
  jor: 'jo',
  // Group K
  por: 'pt',
  cod: 'cd',
  uzb: 'uz',
  col: 'co',
  // Group L
  eng: 'gb-eng',
  cro: 'hr',
  gha: 'gh',
  pan: 'pa',
};

export function FlagIcon({ teamId, size = '1.2rem' }) {
  const countryCode = TEAM_TO_FLAG[teamId] || 'un';
  return (
    <span
      className={`fi fi-${countryCode}`}
      style={{
        display: 'inline-block',
        fontSize: size,
        lineHeight: '1',
        marginRight: '0.25rem',
      }}
      title={teamId}
    />
  );
}
