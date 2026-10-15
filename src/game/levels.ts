import { StageData, Platform } from './types';

export const STAGES: StageData[] = [
  {
    id: 1,
    title: 'DISTRICT 0: SHADOW ROOFTOPS',
    subtitle: 'Infiltrate the Neo-Kyoto skyline and breach the perimeter.',
    width: 3800,
    height: 900,
    spawnX: 100,
    spawnY: 600,
    goalX: 3600,
    goalY: 550,
    theme: 'rooftops',
    platforms: [
      // Starting ground
      { x: 0, y: 700, width: 600, height: 200, style: 'pagoda_roof' },
      
      // Pagoda roof tier 1
      { x: 250, y: 550, width: 220, height: 30, oneWay: true, style: 'pagoda_roof' },
      
      // First gap to building 2
      { x: 750, y: 650, width: 500, height: 250, style: 'pagoda_roof' },
      { x: 850, y: 500, width: 300, height: 30, oneWay: true, style: 'pagoda_roof' },
      { x: 920, y: 380, width: 160, height: 25, oneWay: true, style: 'pagoda_roof' },

      // High cyber beam bridge
      { x: 1350, y: 600, width: 450, height: 300, style: 'cyber_beam' },
      { x: 1400, y: 460, width: 180, height: 25, oneWay: true, style: 'floating_platform' },

      // Wall climb tower 1 (left wall)
      { x: 1950, y: 300, width: 60, height: 600, wallClimbable: true, style: 'neon_conduit' },
      // Wall climb tower 2 (right wall)
      { x: 2200, y: 300, width: 60, height: 600, wallClimbable: true, style: 'neon_conduit' },
      // Bottom of the wall shaft (hazard spikes below)
      { x: 1950, y: 880, width: 310, height: 40, hazard: true, style: 'neon_conduit' },
      // Mid platform inside wall shaft
      { x: 2040, y: 560, width: 100, height: 20, oneWay: true, style: 'floating_platform' },
      // Top platform of tower
      { x: 1900, y: 300, width: 400, height: 40, style: 'pagoda_roof' },

      // Rooftop descent section
      { x: 2450, y: 480, width: 450, height: 420, style: 'pagoda_roof' },
      { x: 2550, y: 360, width: 250, height: 30, oneWay: true, style: 'pagoda_roof' },

      // Moving cyber platform over void
      { x: 2980, y: 520, width: 140, height: 25, oneWay: true, moving: true, moveRangeX: 180, moveSpeedX: 1.5, startX: 2980, style: 'floating_platform' },

      // Extraction extraction rooftop & torii gate
      { x: 3300, y: 600, width: 500, height: 300, style: 'pagoda_roof' },
      { x: 3450, y: 470, width: 220, height: 30, oneWay: true, style: 'torii_lintel' }
    ],
    enemySpawns: [
      { x: 450, y: 650, type: 'kage_ninja' },
      { x: 950, y: 450, type: 'shinobi_marksman' },
      { x: 1100, y: 600, type: 'kage_ninja' },
      { x: 1550, y: 550, type: 'cyber_ronin' },
      { x: 2100, y: 260, type: 'shinobi_marksman' },
      { x: 2600, y: 430, type: 'kunoichi_glider' },
      { x: 2750, y: 430, type: 'cyber_ronin' },
      { x: 3450, y: 550, type: 'kage_ninja' },
      { x: 3550, y: 550, type: 'cyber_ronin' }
    ],
    pickups: [
      { x: 350, y: 500, type: 'shuriken', value: 5 },
      { x: 1000, y: 340, type: 'drone', value: 1 },
      { x: 1500, y: 420, type: 'health', value: 35 },
      { x: 2090, y: 520, type: 'spirit', value: 50 },
      { x: 2700, y: 320, type: 'cypher_boost', value: 1 },
      { x: 3550, y: 430, type: 'health', value: 50 }
    ]
  },
  {
    id: 2,
    title: 'SECTOR 9: NEON BAMBOO & TORII ARCH',
    subtitle: 'Ascend the sacred cyber-forest guarded by elite Ronin units.',
    width: 4200,
    height: 950,
    spawnX: 120,
    spawnY: 650,
    goalX: 4000,
    goalY: 500,
    theme: 'bamboo',
    platforms: [
      // Start
      { x: 0, y: 750, width: 700, height: 200, style: 'torii_lintel' },
      { x: 300, y: 600, width: 250, height: 25, oneWay: true, style: 'floating_platform' },

      // High torii gate structure
      { x: 850, y: 700, width: 450, height: 250, style: 'torii_lintel' },
      { x: 950, y: 540, width: 250, height: 30, oneWay: true, style: 'torii_lintel' },
      { x: 1000, y: 400, width: 160, height: 25, oneWay: true, style: 'torii_lintel' },

      // Multi-tier bamboo platforms
      { x: 1450, y: 620, width: 280, height: 30, oneWay: true, style: 'floating_platform' },
      { x: 1850, y: 520, width: 280, height: 30, oneWay: true, style: 'floating_platform' },
      
      // Moving cyber platforms
      { x: 2200, y: 460, width: 140, height: 25, oneWay: true, moving: true, moveRangeX: 200, moveSpeedX: 2.0, startX: 2200, style: 'floating_platform' },
      
      // Pagoda fortress approach
      { x: 2600, y: 650, width: 600, height: 300, style: 'pagoda_roof' },
      { x: 2750, y: 490, width: 300, height: 30, oneWay: true, style: 'pagoda_roof' },
      { x: 2850, y: 350, width: 200, height: 25, oneWay: true, style: 'pagoda_roof' },

      // Tower wall climb
      { x: 3350, y: 250, width: 50, height: 700, wallClimbable: true, style: 'neon_conduit' },
      { x: 3550, y: 250, width: 50, height: 700, wallClimbable: true, style: 'neon_conduit' },
      { x: 3350, y: 920, width: 250, height: 40, hazard: true, style: 'neon_conduit' },
      { x: 3420, y: 500, width: 80, height: 20, oneWay: true, style: 'floating_platform' },

      // Top sanctum gate
      { x: 3750, y: 550, width: 450, height: 400, style: 'torii_lintel' },
      { x: 3850, y: 400, width: 250, height: 30, oneWay: true, style: 'torii_lintel' }
    ],
    enemySpawns: [
      { x: 500, y: 700, type: 'kage_ninja' },
      { x: 1050, y: 500, type: 'cyber_ronin' },
      { x: 1080, y: 360, type: 'shinobi_marksman' },
      { x: 1550, y: 580, type: 'kunoichi_glider' },
      { x: 1950, y: 480, type: 'shinobi_marksman' },
      { x: 2750, y: 600, type: 'cyber_ronin' },
      { x: 2900, y: 450, type: 'kunoichi_glider' },
      { x: 3450, y: 200, type: 'shinobi_marksman' },
      { x: 3900, y: 500, type: 'cyber_ronin' },
      { x: 4050, y: 500, type: 'kage_ninja' }
    ],
    pickups: [
      { x: 400, y: 550, type: 'spirit', value: 40 },
      { x: 1050, y: 350, type: 'drone', value: 1 },
      { x: 2000, y: 470, type: 'health', value: 40 },
      { x: 2950, y: 300, type: 'shuriken', value: 8 },
      { x: 3950, y: 350, type: 'cypher_boost', value: 1 }
    ]
  },
  {
    id: 3,
    title: 'THE CRIMSON SANCTUM: KUROGANE',
    subtitle: 'Confront Grandmaster Kurogane atop the storm-struck central citadel.',
    width: 2400,
    height: 850,
    spawnX: 150,
    spawnY: 620,
    goalX: 2200,
    goalY: 620,
    hasBoss: true,
    bossSpawn: { x: 1700, y: 600 },
    theme: 'sanctum',
    platforms: [
      // Grand Arena main floor
      { x: 0, y: 680, width: 2400, height: 200, style: 'pagoda_roof' },

      // Left vantage platform
      { x: 250, y: 520, width: 260, height: 25, oneWay: true, style: 'pagoda_roof' },
      { x: 300, y: 380, width: 160, height: 25, oneWay: true, style: 'torii_lintel' },

      // Center high dueling terrace
      { x: 800, y: 480, width: 400, height: 30, oneWay: true, style: 'pagoda_roof' },
      { x: 920, y: 340, width: 160, height: 25, oneWay: true, style: 'floating_platform' },

      // Right vantage platform
      { x: 1450, y: 520, width: 260, height: 25, oneWay: true, style: 'pagoda_roof' },
      { x: 1500, y: 380, width: 160, height: 25, oneWay: true, style: 'torii_lintel' },

      // Side wall climb boundaries for aerial wall flips
      { x: 20, y: 200, width: 40, height: 500, wallClimbable: true, style: 'neon_conduit' },
      { x: 2340, y: 200, width: 40, height: 500, wallClimbable: true, style: 'neon_conduit' }
    ],
    enemySpawns: [
      { x: 700, y: 640, type: 'kage_ninja' },
      { x: 1300, y: 640, type: 'cyber_ronin' }
    ],
    pickups: [
      { x: 380, y: 330, type: 'health', value: 40 },
      { x: 1000, y: 290, type: 'drone', value: 1 },
      { x: 1580, y: 330, type: 'spirit', value: 50 }
    ]
  }
];

export function getSurvivalStage(): StageData {
  return {
    id: 99,
    title: 'ENDLESS SHINOBI GAUNTLET',
    subtitle: 'Survive infinite escalations of cyber-ninja assassins.',
    width: 2200,
    height: 850,
    spawnX: 300,
    spawnY: 600,
    goalX: 99999, // Endless
    goalY: 600,
    theme: 'sanctum',
    platforms: [
      { x: 0, y: 680, width: 2200, height: 200, style: 'pagoda_roof' },
      { x: 200, y: 520, width: 250, height: 25, oneWay: true, style: 'pagoda_roof' },
      { x: 750, y: 480, width: 350, height: 25, oneWay: true, style: 'floating_platform' },
      { x: 1300, y: 520, width: 250, height: 25, oneWay: true, style: 'pagoda_roof' },
      { x: 825, y: 330, width: 200, height: 20, oneWay: true, style: 'torii_lintel' },
      { x: 15, y: 150, width: 40, height: 550, wallClimbable: true, style: 'neon_conduit' },
      { x: 2145, y: 150, width: 40, height: 550, wallClimbable: true, style: 'neon_conduit' }
    ],
    enemySpawns: [],
    pickups: [
      { x: 925, y: 280, type: 'drone', value: 1 },
      { x: 300, y: 470, type: 'shuriken', value: 10 }
    ]
  };
}
