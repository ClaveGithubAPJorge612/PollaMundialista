import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMatches, getTeams } from '../services/dynamodb';
import * as adminService from '../services/adminService';
import { TEAMS } from '../data/mockData';
import { FlagIcon } from '../utils/flagUtils';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('results');

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255, 80, 80, 0.1)',
          border: '2px solid #ff5050',
          borderRadius: 'var(--r-md)',
          padding: '2rem',
          color: '#ff5050',
          fontFamily: 'var(--font-body)',
        }}>
          ❌ No tienes permisos para acceder a este panel.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>🛡 Panel de Administrador</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'results', label: '⚽ Resultados' },
          { id: 'knockout', label: '🏆 Llaves' },
          { id: 'scorers', label: '👟 Goleadores' },
          { id: 'groups', label: '📊 Grupos' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: tab === t.id ? 'var(--green)' : 'var(--surface2)',
              border: `2px solid ${tab === t.id ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)',
              color: tab === t.id ? '#000' : '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: tab === t.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'results' && <MatchResultEditor />}
      {tab === 'knockout' && <KnockoutEditor />}
      {tab === 'scorers' && <ScorersEditor />}
      {tab === 'groups' && <GroupsEditor />}
    </div>
  );
}

function MatchResultEditor() {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [scorers, setScorers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getMatches({ phase: 'group' });
      setMatches(data.filter(m => m.status !== 'finished'));
    })();
  }, []);

  const selectedMatch = matches.find(m => m.matchId === selectedMatchId);

  const handleAddScorer = () => {
    setScorers([...scorers, { player: '', team: '', minute: '' }]);
  };

  const handleRemoveScorer = (idx) => {
    setScorers(scorers.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedMatchId || homeGoals === '' || awayGoals === '') {
      setMessage('❌ Completa todos los campos');
      return;
    }
    setSaving(true);
    try {
      const result = await adminService.saveMatchResult(selectedMatchId, parseInt(homeGoals), parseInt(awayGoals), scorers);
      setMessage(`✅ ${result.updatedPredictions} predicciones actualizadas, ${result.affectedUsers} usuarios recalculados`);
      setHomeGoals('');
      setAwayGoals('');
      setScorers([]);
      const data = await getMatches({ phase: 'group' });
      setMatches(data.filter(m => m.status !== 'finished'));
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Selecciona partido:</label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          <option value="">-- Selecciona --</option>
          {matches.map(m => (
            <option key={m.matchId} value={m.matchId}>
              [{m.homeTeam?.id}] {m.homeTeam?.name} vs [{m.awayTeam?.id}] {m.awayTeam?.name} — {m.date}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Goles Local:</label>
              <input
                type="number"
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Goles Visitante:</label>
              <input
                type="number"
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Goleadores:</label>
            {scorers.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Jugador"
                  value={s.player}
                  onChange={(e) => {
                    const newScorers = [...scorers];
                    newScorers[idx].player = e.target.value;
                    setScorers(newScorers);
                  }}
                  style={{
                    flex: 2,
                    padding: '0.5rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <select
                  value={s.team}
                  onChange={(e) => {
                    const newScorers = [...scorers];
                    newScorers[idx].team = e.target.value;
                    setScorers(newScorers);
                  }}
                  style={{
                    flex: 1.5,
                    padding: '0.5rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <option value="">Equipo</option>
                  <option value={selectedMatch.homeTeam?.id}>{selectedMatch.homeTeam?.name}</option>
                  <option value={selectedMatch.awayTeam?.id}>{selectedMatch.awayTeam?.name}</option>
                </select>
                <input
                  type="number"
                  placeholder="Min"
                  value={s.minute}
                  onChange={(e) => {
                    const newScorers = [...scorers];
                    newScorers[idx].minute = e.target.value;
                    setScorers(newScorers);
                  }}
                  min="0"
                  max="120"
                  style={{
                    flex: 0.8,
                    padding: '0.5rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  onClick={() => handleRemoveScorer(idx)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 80, 80, 0.2)',
                    border: 'none',
                    borderRadius: 'var(--r-sm)',
                    color: '#ff5050',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddScorer}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--glass)',
                border: '1px dashed var(--green)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--green)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              + Agregar goleador
            </button>
          </div>

          {message && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: message.includes('✅') ? 'rgba(110, 207, 66, 0.15)' : 'rgba(255, 80, 80, 0.15)',
              border: `1px solid ${message.includes('✅') ? 'var(--green)' : '#ff5050'}`,
              borderRadius: 'var(--r-md)',
              color: message.includes('✅') ? 'var(--green)' : '#ff5050',
              fontFamily: 'var(--font-body)',
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '1rem',
              background: saving ? 'var(--surface2)' : 'var(--green)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              color: saving ? 'var(--text-dim)' : '#000',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar y Recalcular'}
          </button>
        </>
      )}
    </div>
  );
}

function KnockoutEditor() {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getMatches();
      setMatches(data.filter(m => m.tbd === true || !m.homeTeam || !m.awayTeam));
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedMatchId || !homeTeamId || !awayTeamId) {
      setMessage('❌ Selecciona los dos equipos');
      return;
    }
    setSaving(true);
    try {
      const homeTeam = Object.values(TEAMS).find(t => t.id === homeTeamId);
      const awayTeam = Object.values(TEAMS).find(t => t.id === awayTeamId);
      await adminService.updateKnockoutTeams(selectedMatchId, homeTeam, awayTeam);
      setMessage('✅ Equipos asignados');
      setHomeTeamId('');
      setAwayTeamId('');
      const data = await getMatches();
      setMatches(data.filter(m => m.tbd === true || !m.homeTeam || !m.awayTeam));
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Partido TBD:</label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          <option value="">-- Selecciona --</option>
          {matches.map(m => (
            <option key={m.matchId} value={m.matchId}>
              {m.phase} — {m.date}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Equipo Local:</label>
          <select
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="">-- Selecciona --</option>
            {Object.values(TEAMS).map(t => (
              <option key={t.id} value={t.id}>[{t.id}] {t.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Equipo Visitante:</label>
          <select
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="">-- Selecciona --</option>
            {Object.values(TEAMS).map(t => (
              <option key={t.id} value={t.id}>[{t.id}] {t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: message.includes('✅') ? 'rgba(110, 207, 66, 0.15)' : 'rgba(255, 80, 80, 0.15)',
          border: `1px solid ${message.includes('✅') ? 'var(--green)' : '#ff5050'}`,
          borderRadius: 'var(--r-md)',
          color: message.includes('✅') ? 'var(--green)' : '#ff5050',
          fontFamily: 'var(--font-body)',
        }}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '1rem',
          background: saving ? 'var(--surface2)' : 'var(--green)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          color: saving ? 'var(--text-dim)' : '#000',
          fontWeight: '600',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {saving ? '⏳ Guardando...' : '💾 Asignar equipos'}
      </button>
    </div>
  );
}

function ScorersEditor() {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [scorers, setScorers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getMatches();
      setMatches(data.filter(m => m.status === 'finished'));
    })();
  }, []);

  useEffect(() => {
    const match = matches.find(m => m.matchId === selectedMatchId);
    if (match) {
      setScorers([...(match.scorers || [])]);
    }
  }, [selectedMatchId, matches]);

  const handleSave = async () => {
    if (!selectedMatchId) {
      setMessage('❌ Selecciona un partido');
      return;
    }
    setSaving(true);
    try {
      await adminService.updateTopScorers(selectedMatchId, scorers);
      setMessage('✅ Goleadores guardados');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Selecciona partido:</label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          <option value="">-- Selecciona --</option>
          {matches.map(m => (
            <option key={m.matchId} value={m.matchId}>
              [{m.homeTeam?.id}] {m.homeTeam?.name} vs [{m.awayTeam?.id}] {m.awayTeam?.name} — {m.date}
            </option>
          ))}
        </select>
      </div>

      {selectedMatchId && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Goleadores:</label>
            {scorers.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Jugador"
                  value={s.player}
                  onChange={(e) => {
                    const newScorers = [...scorers];
                    newScorers[idx].player = e.target.value;
                    setScorers(newScorers);
                  }}
                  style={{
                    flex: 2,
                    padding: '0.5rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <input
                  type="number"
                  placeholder="Min"
                  value={s.minute}
                  onChange={(e) => {
                    const newScorers = [...scorers];
                    newScorers[idx].minute = e.target.value;
                    setScorers(newScorers);
                  }}
                  min="0"
                  max="120"
                  style={{
                    flex: 0.8,
                    padding: '0.5rem',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  onClick={() => setScorers(scorers.filter((_, i) => i !== idx))}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 80, 80, 0.2)',
                    border: 'none',
                    borderRadius: 'var(--r-sm)',
                    color: '#ff5050',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => setScorers([...scorers, { player: '', team: '', minute: '' }])}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--glass)',
                border: '1px dashed var(--green)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--green)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              + Agregar goleador
            </button>
          </div>

          {message && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: message.includes('✅') ? 'rgba(110, 207, 66, 0.15)' : 'rgba(255, 80, 80, 0.15)',
              border: `1px solid ${message.includes('✅') ? 'var(--green)' : '#ff5050'}`,
              borderRadius: 'var(--r-md)',
              color: message.includes('✅') ? 'var(--green)' : '#ff5050',
              fontFamily: 'var(--font-body)',
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '1rem',
              background: saving ? 'var(--surface2)' : 'var(--green)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              color: saving ? 'var(--text-dim)' : '#000',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar goleadores'}
          </button>
        </>
      )}
    </div>
  );
}

function GroupsEditor() {
  const [teams, setTeams] = useState([]);
  const [editedTeams, setEditedTeams] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getTeams();
      setTeams(data);
      const map = {};
      data.forEach(t => (map[t.teamId] = t.group));
      setEditedTeams(map);
    })();
  }, []);

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const teamsPerGroup = groups.map(g => teams.filter(t => editedTeams[t.teamId] === g).sort((a, b) => a.teamName.localeCompare(b.teamName)));

  const handleSave = async () => {
    setSaving(true);
    try {
      const changes = teams.filter(t => editedTeams[t.teamId] !== t.group);
      for (const team of changes) {
        await import('../services/dynamodb').then(m => m.updateTeamGroup(team.teamId, editedTeams[team.teamId]));
      }
      setMessage(`✅ ${changes.length} equipos reasignados`);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {groups.map((g, idx) => (
          <div key={g} style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '1rem',
          }}>
            <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>Grupo {g}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {teamsPerGroup[idx].map(t => (
                <div key={t.teamId} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <FlagIcon teamId={t.teamId} size="1.3rem" />
                  <select
                    value={t.teamId}
                    onChange={(e) => {
                      const newTeamId = e.target.value;
                      const newTeam = teams.find(tm => tm.teamId === newTeamId);
                      if (newTeam) {
                        setEditedTeams({ ...editedTeams, [newTeamId]: g, [t.teamId]: editedTeams[t.teamId] });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      background: 'var(--surface3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      color: '#fff',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {teams.map(team => (
                      <option key={team.teamId} value={team.teamId}>{team.teamName}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: message.includes('✅') ? 'rgba(110, 207, 66, 0.15)' : 'rgba(255, 80, 80, 0.15)',
          border: `1px solid ${message.includes('✅') ? 'var(--green)' : '#ff5050'}`,
          borderRadius: 'var(--r-md)',
          color: message.includes('✅') ? 'var(--green)' : '#ff5050',
          fontFamily: 'var(--font-body)',
        }}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '1rem 2rem',
          background: saving ? 'var(--surface2)' : 'var(--green)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          color: saving ? 'var(--text-dim)' : '#000',
          fontWeight: '600',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {saving ? '⏳ Guardando...' : '💾 Guardar configuración de grupos'}
      </button>
    </div>
  );
}
