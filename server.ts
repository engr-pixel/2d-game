import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Leaderboard store (with realistic high-rank cyber-ninja legends)
interface LeaderboardEntry {
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

const leaderboard: LeaderboardEntry[] = [
  {
    id: 'legend-1',
    callsign: 'STRIDER_HIRYU',
    score: 84520,
    styleRank: 'SSS',
    kills: 142,
    parries: 38,
    maxCombo: 64,
    mode: 'story',
    stageOrWave: 'Citadel Clear',
    timestamp: '2026-10-14T21:10:00Z',
  },
  {
    id: 'legend-2',
    callsign: 'SHINOBI_KAGE',
    score: 67340,
    styleRank: 'SS',
    kills: 118,
    parries: 29,
    maxCombo: 48,
    mode: 'survival',
    stageOrWave: 'Wave 18',
    timestamp: '2026-10-15T02:40:00Z',
  },
  {
    id: 'legend-3',
    callsign: 'CYBER_RAIDEN',
    score: 52190,
    styleRank: 'S',
    kills: 95,
    parries: 22,
    maxCombo: 36,
    mode: 'story',
    stageOrWave: 'Stage 3',
    timestamp: '2026-10-15T04:15:00Z',
  },
  {
    id: 'legend-4',
    callsign: 'GHOST_BLADE_99',
    score: 41200,
    styleRank: 'A',
    kills: 74,
    parries: 16,
    maxCombo: 28,
    mode: 'survival',
    stageOrWave: 'Wave 12',
    timestamp: '2026-10-15T06:05:00Z',
  },
  {
    id: 'legend-5',
    callsign: 'RONIN_SLAYER',
    score: 33850,
    styleRank: 'B',
    kills: 58,
    parries: 11,
    maxCombo: 21,
    mode: 'story',
    stageOrWave: 'Stage 2',
    timestamp: '2026-10-15T07:22:00Z',
  },
];

// Global Shinobi Operations Telemetry
const globalStats = {
  totalKillsWorldwide: 14890,
  totalParriesWorldwide: 4210,
  totalMissionsCleared: 840,
  kuroganeDefeats: 312,
};

// Available Cyber-Blade Customizations
const bladeCustomizations = [
  {
    id: 'cyan_plasma',
    name: 'Cyan Cypher (Standard Issue)',
    color: '#06b6d4',
    secondaryColor: '#38bdf8',
    description: 'High-frequency particle edge tuned for cutting ballistic alloys.',
    unlockedByDefault: true,
  },
  {
    id: 'crimson_fury',
    name: 'Crimson Dragon (Kurogane Bane)',
    color: '#ef4444',
    secondaryColor: '#f87171',
    description: 'Superheated thermal plasma channel for intense incendiary strikes.',
    unlockedByDefault: true,
  },
  {
    id: 'void_purple',
    name: 'Void Kunoichi (Shadow Phase)',
    color: '#a855f7',
    secondaryColor: '#c084fc',
    description: 'Bends light along the cutting plane, leaving violet afterimages.',
    unlockedByDefault: true,
  },
  {
    id: 'golden_sun',
    name: 'Golden Ronin (Daimyo Relic)',
    color: '#fbbf24',
    secondaryColor: '#fde047',
    description: 'Ancient folded titanium blade infused with solar capacitors.',
    unlockedByDefault: true,
  },
  {
    id: 'emerald_lotus',
    name: 'Emerald Shinobi (Neo-Bamboo)',
    color: '#10b981',
    secondaryColor: '#34d399',
    description: 'Bio-luminescent edge generating sharp emerald energy shockwaves.',
    unlockedByDefault: true,
  },
];

// 1. Healthcheck Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    app: 'Strider: Shinobi Protocol Engine',
    version: '1.2.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 2. Leaderboard API
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  // Sort descending by score
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 25);
  res.json({
    success: true,
    count: sorted.length,
    leaderboard: sorted,
  });
});

app.post('/api/leaderboard', (req: Request, res: Response) => {
  const { callsign, score, styleRank, kills, parries, maxCombo, mode, stageOrWave } = req.body;

  if (!callsign || typeof score !== 'number') {
    res.status(400).json({ success: false, error: 'Invalid submission payload' });
    return;
  }

  const cleanCallsign = String(callsign).trim().slice(0, 16).toUpperCase() || 'ANONYMOUS_NINJA';

  const newEntry: LeaderboardEntry = {
    id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    callsign: cleanCallsign,
    score: Math.max(0, Math.floor(score)),
    styleRank: styleRank || 'C',
    kills: Number(kills) || 0,
    parries: Number(parries) || 0,
    maxCombo: Number(maxCombo) || 0,
    mode: mode === 'survival' ? 'survival' : 'story',
    stageOrWave: stageOrWave || 'Sector 1',
    timestamp: new Date().toISOString(),
  };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);

  // Keep top 50 in memory
  if (leaderboard.length > 50) {
    leaderboard.length = 50;
  }

  const rank = leaderboard.findIndex((e) => e.id === newEntry.id) + 1;

  res.status(201).json({
    success: true,
    rank,
    entry: newEntry,
  });
});

// 3. Telemetry / Global Shinobi Operations Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    stats: globalStats,
  });
});

app.post('/api/stats/increment', (req: Request, res: Response) => {
  const { kills, parries, missionCleared, bossDefeated } = req.body;
  if (typeof kills === 'number') globalStats.totalKillsWorldwide += Math.max(0, kills);
  if (typeof parries === 'number') globalStats.totalParriesWorldwide += Math.max(0, parries);
  if (missionCleared) globalStats.totalMissionsCleared += 1;
  if (bossDefeated) globalStats.kuroganeDefeats += 1;

  res.json({ success: true, stats: globalStats });
});

// 4. Mission Dossiers & Intel Briefings
app.get('/api/missions', (_req: Request, res: Response) => {
  res.json({
    success: true,
    missions: [
      {
        id: 1,
        code: 'DISTRICT 0: SHADOW ROOFTOPS',
        objective: 'Infiltrate the Neo-Kyoto skyline and breach the security perimeter.',
        threatLevel: 'MODERATE',
        primaryThreats: ['Kage-Genin Dual Blades', 'Shinobi Kunai Snipers'],
        intel: 'Rooftops are connected by high-voltage neon conduits. Wall kicking between towers is required.',
      },
      {
        id: 2,
        code: 'SECTOR 9: NEON BAMBOO & TORII ARCH',
        objective: 'Scale the vertical pagoda shafts and neutralize cyber samurai guard patrols.',
        threatLevel: 'SEVERE',
        primaryThreats: ['Armored Cyber Ronin', 'Aerial Kunoichi Gliders'],
        intel: 'Cyber Ronin carry energy barriers. Slide underneath them or parry their heavy swings to shatter their stance.',
      },
      {
        id: 3,
        code: 'THE CRIMSON SANCTUM: GRANDMASTER KUROGANE',
        objective: 'Infiltrate the storm-swept central spire and eliminate Mecha-Daimyo Kurogane.',
        threatLevel: 'EXTREME',
        primaryThreats: ['Grandmaster Kurogane (Daimyo)', 'Overdrive Thunder Arcs'],
        intel: 'Under 50% HP, Kurogane enters Phase 2 Berserk Overdrive. Time your parries precisely against his teleporting slashes.',
      },
    ],
  });
});

// 5. Weapon Customization
app.get('/api/blade-styles', (_req: Request, res: Response) => {
  res.json({
    success: true,
    styles: bladeCustomizations,
  });
});

// Setup Dev vs Production static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[STRIDER ENGINE] Server online on port ${PORT} (${isDev ? 'Development' : 'Production'})`);
  });
}

startServer().catch((err) => {
  console.error('[STRIDER ENGINE] Failed to start server:', err);
  process.exit(1);
});
