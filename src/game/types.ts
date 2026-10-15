export type GameMode = 'story' | 'survival';

export type GameStateStatus = 'menu' | 'playing' | 'paused' | 'stage_clear' | 'game_over' | 'victory';

export type StyleRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface ScarfSegment {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export interface AfterImage {
  x: number;
  y: number;
  facing: number;
  action: string;
  frame: number;
  alpha: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  wallClinging: boolean;
  wallSide: 1 | -1;
  jumpCount: number;
  maxJumps: number;
  
  // States
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  isSliding: boolean;
  slideTimer: number;
  isCrouching: boolean;
  
  // Combat
  isAttacking: boolean;
  attackIndex: number;
  attackTimer: number;
  attackCooldown: number;
  attackHitEnemies: Set<number>;
  
  // Defense
  isBlocking: boolean;
  parryWindow: number; // Perfect parry if hit during this window
  parryCooldown: number;
  isParrySuccess: boolean;
  parrySuccessTimer: number;

  // Stats
  health: number;
  maxHealth: number;
  spirit: number; // 0 to 100 for Ninjutsu
  maxSpirit: number;
  shurikens: number;
  maxShurikens: number;
  shurikenCooldown: number;
  hasDrone: boolean;
  droneAngle: number;
  droneCooldown: number;

  // Invulnerability
  invincibleTimer: number;

  // Visuals
  somersaultRotation: number;
  scarf: ScarfSegment[];
  afterImages: AfterImage[];
  color: string;
  bladeColor?: string;
  bladeSecondaryColor?: string;
  trailTimer: number;
}

export type EnemyType = 'kage_ninja' | 'shinobi_marksman' | 'cyber_ronin' | 'kunoichi_glider' | 'boss_kurogane';

export interface Enemy {
  id: number;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  health: number;
  maxHealth: number;
  damage: number;
  scoreValue: number;
  
  // AI State
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'staggered' | 'charging' | 'gliding' | 'teleporting' | 'dead';
  stateTimer: number;
  attackTimer: number;
  attackCooldown: number;
  staggerTimer: number;
  shieldActive?: boolean;
  shieldHp?: number;
  
  // Boss Specific
  bossPhase?: number;
  bossAttackPattern?: number;
  laserAngle?: number;
  chargeTargetX?: number;
  
  // Visuals
  invincibleTimer: number;
  cutInHalf?: boolean;
  cutAngle?: number;
  cutOffset?: number;
  deathTimer?: number;
  afterImages?: AfterImage[];
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  source: 'player' | 'enemy';
  damage: number;
  life: number;
  maxLife: number;
  type: 'shuriken' | 'kunai' | 'plasma_wave' | 'boss_laser' | 'drone_bolt' | 'dragon_wave';
  piercing?: boolean;
  rotation?: number;
  deflected?: boolean;
}

export interface Pickup {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'health' | 'spirit' | 'shuriken' | 'drone' | 'cypher_boost';
  value: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'plasma' | 'sakura' | 'smoke' | 'blood' | 'ring' | 'slash_arc';
  angle?: number;
  alpha?: number;
  scale?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  bold?: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
  wallClimbable?: boolean;
  hazard?: boolean;
  moving?: boolean;
  moveRangeX?: number;
  moveSpeedX?: number;
  startX?: number;
  style?: 'pagoda_roof' | 'cyber_beam' | 'neon_conduit' | 'torii_lintel' | 'floating_platform';
}

export interface StageData {
  id: number;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  goalX: number;
  goalY: number;
  platforms: Platform[];
  enemySpawns: { x: number; y: number; type: EnemyType }[];
  pickups: { x: number; y: number; type: Pickup['type']; value: number }[];
  hasBoss?: boolean;
  bossSpawn?: { x: number; y: number };
  theme: 'rooftops' | 'bamboo' | 'sanctum';
}

export interface GameStats {
  score: number;
  kills: number;
  parries: number;
  combos: number;
  maxCombo: number;
  damageTaken: number;
  timeElapsed: number;
  currentCombo: number;
  comboTimer: number;
  stylePoints: number;
  styleRank: StyleRank;
}
