export interface LeaderboardEntry {
  id: string;
  callsign: string;
  score: number;
  styleRank: string;
  kills: number;
  parries: number;
  maxCombo: number;
  mode: 'story' | 'survival';
  stageOrWave: string;
  timestamp: string;
}

export interface GlobalStats {
  totalKillsWorldwide: number;
  totalParriesWorldwide: number;
  totalMissionsCleared: number;
  kuroganeDefeats: number;
}

export interface MissionIntel {
  id: number;
  code: string;
  objective: string;
  threatLevel: string;
  primaryThreats: string[];
  intel: string;
}

export interface BladeStyle {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  description: string;
  unlockedByDefault: boolean;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data.leaderboard || [];
  } catch (err) {
    console.warn('[API] Could not fetch leaderboard:', err);
    return [];
  }
}

export async function submitScoreToLeaderboard(entry: {
  callsign: string;
  score: number;
  styleRank: string;
  kills: number;
  parries: number;
  maxCombo: number;
  mode: 'story' | 'survival';
  stageOrWave: string;
}): Promise<{ success: boolean; rank?: number }> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Submission failed');
    return await res.json();
  } catch (err) {
    console.warn('[API] Score submission error:', err);
    return { success: false };
  }
}

export async function fetchGlobalStats(): Promise<GlobalStats | null> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    console.warn('[API] Could not fetch global stats:', err);
    return null;
  }
}

export async function recordCombatStats(data: {
  kills: number;
  parries: number;
  missionCleared?: boolean;
  bossDefeated?: boolean;
}) {
  try {
    await fetch('/api/stats/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('[API] Could not increment stats:', err);
  }
}

export async function fetchMissions(): Promise<MissionIntel[]> {
  try {
    const res = await fetch('/api/missions');
    if (!res.ok) throw new Error('Failed to fetch missions');
    const data = await res.json();
    return data.missions || [];
  } catch (err) {
    console.warn('[API] Could not fetch missions:', err);
    return [];
  }
}

export async function fetchBladeStyles(): Promise<BladeStyle[]> {
  try {
    const res = await fetch('/api/blade-styles');
    if (!res.ok) throw new Error('Failed to fetch blade styles');
    const data = await res.json();
    return data.styles || [];
  } catch (err) {
    console.warn('[API] Could not fetch blade styles:', err);
    return [];
  }
}
