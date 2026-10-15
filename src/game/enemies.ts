import { Enemy, EnemyType, Player, Platform, Projectile, Particle, FloatingText } from './types';
import { soundEngine } from './audio';

export function createEnemy(id: number, type: EnemyType, x: number, y: number): Enemy {
  switch (type) {
    case 'kage_ninja':
      return {
        id,
        type,
        name: 'Kage-Genin',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 26,
        height: 48,
        facing: -1,
        grounded: false,
        health: 45,
        maxHealth: 45,
        damage: 16,
        scoreValue: 150,
        state: 'patrol',
        stateTimer: 60,
        attackTimer: 0,
        attackCooldown: 0,
        staggerTimer: 0,
        invincibleTimer: 0,
      };

    case 'shinobi_marksman':
      return {
        id,
        type,
        name: 'Shinobi Marksman',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 24,
        height: 46,
        facing: -1,
        grounded: false,
        health: 35,
        maxHealth: 35,
        damage: 14,
        scoreValue: 200,
        state: 'patrol',
        stateTimer: 90,
        attackTimer: 0,
        attackCooldown: 60,
        staggerTimer: 0,
        invincibleTimer: 0,
      };

    case 'cyber_ronin':
      return {
        id,
        type,
        name: 'Cyber Ronin',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 34,
        height: 56,
        facing: -1,
        grounded: false,
        health: 90,
        maxHealth: 90,
        damage: 26,
        scoreValue: 350,
        state: 'patrol',
        stateTimer: 100,
        attackTimer: 0,
        attackCooldown: 80,
        staggerTimer: 0,
        invincibleTimer: 0,
        shieldActive: true,
        shieldHp: 40,
      };

    case 'kunoichi_glider':
      return {
        id,
        type,
        name: 'Kunoichi Glider',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 28,
        height: 44,
        facing: -1,
        grounded: false,
        health: 50,
        maxHealth: 50,
        damage: 18,
        scoreValue: 300,
        state: 'gliding',
        stateTimer: 120,
        attackTimer: 0,
        attackCooldown: 90,
        staggerTimer: 0,
        invincibleTimer: 0,
      };

    case 'boss_kurogane':
      return {
        id,
        type,
        name: 'GRANDMASTER KUROGANE',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 44,
        height: 68,
        facing: -1,
        grounded: false,
        health: 480,
        maxHealth: 480,
        damage: 32,
        scoreValue: 2500,
        state: 'idle',
        stateTimer: 45,
        attackTimer: 0,
        attackCooldown: 60,
        staggerTimer: 0,
        invincibleTimer: 0,
        bossPhase: 1,
        bossAttackPattern: 0,
        afterImages: [],
      };
  }
}

export function updateEnemy(
  enemy: Enemy,
  player: Player,
  platforms: Platform[],
  projectiles: Projectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  dt: number = 1
) {
  // Invincibility & Stagger decay
  if (enemy.invincibleTimer > 0) enemy.invincibleTimer -= dt;
  if (enemy.staggerTimer > 0) {
    enemy.staggerTimer -= dt;
    enemy.vx *= 0.8;
    applyGravity(enemy, platforms, dt);
    return;
  }

  // Handle Death / Cut In Half animation
  if (enemy.state === 'dead') {
    if (enemy.deathTimer !== undefined) {
      enemy.deathTimer -= dt;
      if (enemy.cutOffset !== undefined) {
        enemy.cutOffset += 0.8 * dt;
      }
    }
    return;
  }

  // Cooldowns
  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  if (enemy.attackTimer > 0) enemy.attackTimer -= dt;

  const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
  const dirToPlayer = player.x > enemy.x ? 1 : -1;

  switch (enemy.type) {
    case 'kage_ninja':
      updateKageNinja(enemy, player, distToPlayer, dirToPlayer, platforms, particles, dt);
      break;

    case 'shinobi_marksman':
      updateShinobiMarksman(enemy, player, distToPlayer, dirToPlayer, platforms, projectiles, particles, dt);
      break;

    case 'cyber_ronin':
      updateCyberRonin(enemy, player, distToPlayer, dirToPlayer, platforms, particles, dt);
      break;

    case 'kunoichi_glider':
      updateKunoichiGlider(enemy, player, distToPlayer, dirToPlayer, platforms, projectiles, particles, dt);
      break;

    case 'boss_kurogane':
      updateBossKurogane(enemy, player, distToPlayer, dirToPlayer, platforms, projectiles, particles, floatingTexts, dt);
      break;
  }

  // Apply gravity and platform collisions (unless flying/teleporting)
  if (enemy.type !== 'kunoichi_glider' && enemy.state !== 'teleporting') {
    applyGravity(enemy, platforms, dt);
  }
}

function updateKageNinja(
  enemy: Enemy,
  player: Player,
  distToPlayer: number,
  dirToPlayer: 1 | -1,
  platforms: Platform[],
  particles: Particle[],
  dt: number
) {
  enemy.facing = dirToPlayer;

  if (distToPlayer < 450) {
    // Chase & leap
    enemy.state = 'chase';
    enemy.vx = dirToPlayer * 4.2;

    // Melee attack range
    if (distToPlayer < 48 && enemy.attackCooldown <= 0) {
      enemy.state = 'attack';
      enemy.attackTimer = 18;
      enemy.attackCooldown = 50;
      enemy.vx = dirToPlayer * 6.5; // Lunge forward
      soundEngine.playSlash(0);
    }

    // Leap over gaps or if player is on higher ledge
    if (enemy.grounded && player.y < enemy.y - 40 && Math.random() < 0.04) {
      enemy.vy = -10.5;
      enemy.grounded = false;
    }
  } else {
    // Idle patrol
    enemy.state = 'patrol';
    enemy.stateTimer -= dt;
    if (enemy.stateTimer <= 0) {
      enemy.stateTimer = 90;
      enemy.vx = (Math.random() > 0.5 ? 1 : -1) * 2;
      enemy.facing = enemy.vx > 0 ? 1 : -1;
    }
  }
}

function updateShinobiMarksman(
  enemy: Enemy,
  player: Player,
  distToPlayer: number,
  dirToPlayer: 1 | -1,
  platforms: Platform[],
  projectiles: Projectile[],
  particles: Particle[],
  dt: number
) {
  enemy.facing = dirToPlayer;

  if (distToPlayer < 650) {
    // If player is too close, try to back off
    if (distToPlayer < 100 && enemy.grounded) {
      enemy.vx = -dirToPlayer * 3.5;
    } else {
      enemy.vx *= 0.8;
    }

    // Fire glowing kunai
    if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = 75;
      enemy.attackTimer = 15;
      soundEngine.playShuriken();

      // Launch Kunai toward player
      const angle = Math.atan2(player.y - 20 - (enemy.y - 20), player.x - enemy.x);
      projectiles.push({
        id: Date.now() + Math.random(),
        x: enemy.x + enemy.facing * 16,
        y: enemy.y - 20,
        vx: Math.cos(angle) * 10,
        vy: Math.sin(angle) * 10,
        radius: 6,
        color: '#f97316',
        source: 'enemy',
        damage: 16,
        life: 80,
        maxLife: 80,
        type: 'kunai',
        rotation: angle,
      });
    }
  }
}

function updateCyberRonin(
  enemy: Enemy,
  player: Player,
  distToPlayer: number,
  dirToPlayer: 1 | -1,
  platforms: Platform[],
  particles: Particle[],
  dt: number
) {
  enemy.facing = dirToPlayer;

  if (distToPlayer < 400) {
    if (distToPlayer > 60) {
      enemy.state = 'chase';
      enemy.vx = dirToPlayer * 2.8;
    } else {
      // In melee range
      if (enemy.attackCooldown <= 0) {
        enemy.state = 'attack';
        enemy.attackTimer = 25;
        enemy.attackCooldown = 75;
        enemy.vx = dirToPlayer * 4.0;
        soundEngine.playSlash(1);
      } else {
        enemy.vx = 0;
      }
    }
  } else {
    enemy.state = 'patrol';
    enemy.vx = 0;
  }
}

function updateKunoichiGlider(
  enemy: Enemy,
  player: Player,
  distToPlayer: number,
  dirToPlayer: 1 | -1,
  platforms: Platform[],
  projectiles: Projectile[],
  particles: Particle[],
  dt: number
) {
  enemy.facing = dirToPlayer;

  // Floats sinusoidal wave in air
  enemy.stateTimer += dt * 0.05;
  enemy.y += Math.sin(enemy.stateTimer) * 1.5;

  if (distToPlayer < 500) {
    enemy.vx = dirToPlayer * 3.2;

    // Aerial shuriken spread
    if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = 90;
      soundEngine.playShuriken();

      [-0.2, 0, 0.2].forEach((spread) => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x) + spread;
        projectiles.push({
          id: Date.now() + Math.random(),
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 9,
          vy: Math.sin(angle) * 9,
          radius: 6,
          color: '#a855f7',
          source: 'enemy',
          damage: 15,
          life: 70,
          maxLife: 70,
          type: 'shuriken',
        });
      });
    }
  }
}

function updateBossKurogane(
  boss: Enemy,
  player: Player,
  distToPlayer: number,
  dirToPlayer: 1 | -1,
  platforms: Platform[],
  projectiles: Projectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  dt: number
) {
  // Phase 2 transition
  if (boss.health < boss.maxHealth * 0.5 && boss.bossPhase === 1) {
    boss.bossPhase = 2;
    soundEngine.playNinjutsu();
    floatingTexts.push({
      id: Math.random(),
      x: boss.x,
      y: boss.y - 70,
      text: 'KUROGANE: SHINOBI OVERDRIVE!!',
      color: '#ef4444',
      size: 24,
      life: 90,
      maxLife: 90,
      vy: -1,
      bold: true,
    });
    // Shockwave burst
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      particles.push({
        x: boss.x,
        y: boss.y - 30,
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 7,
        size: 7,
        color: '#ef4444',
        life: 30,
        maxLife: 30,
        type: 'plasma',
      });
    }
  }

  // Attack cycle
  boss.stateTimer -= dt;
  if (boss.stateTimer <= 0) {
    boss.bossAttackPattern = (boss.bossAttackPattern! + 1) % 4;
    boss.stateTimer = boss.bossPhase === 2 ? 65 : 85;

    switch (boss.bossAttackPattern) {
      case 0: // Triple Blade Strike
        boss.state = 'attack';
        boss.facing = dirToPlayer;
        boss.vx = dirToPlayer * 9;
        soundEngine.playSlash(2);
        break;

      case 1: // Teleport behind player
        boss.state = 'teleporting';
        particles.push({
          x: boss.x,
          y: boss.y - 30,
          vx: 0,
          vy: 0,
          size: 30,
          color: '#ec4899',
          life: 20,
          maxLife: 20,
          type: 'ring',
        });
        boss.x = player.x - dirToPlayer * 80;
        boss.y = player.y;
        boss.facing = dirToPlayer;
        soundEngine.playDash();
        break;

      case 2: // Ranged Shockwave Arc
        boss.facing = dirToPlayer;
        soundEngine.playSlash(1);
        const waveCount = boss.bossPhase === 2 ? 3 : 1;
        for (let i = 0; i < waveCount; i++) {
          const offsetAngle = (i - Math.floor(waveCount / 2)) * 0.2;
          projectiles.push({
            id: Date.now() + Math.random(),
            x: boss.x + boss.facing * 35,
            y: boss.y - 25,
            vx: boss.facing * 11 * Math.cos(offsetAngle),
            vy: 11 * Math.sin(offsetAngle),
            radius: 24,
            color: '#ef4444',
            source: 'enemy',
            damage: 28,
            life: 60,
            maxLife: 60,
            type: 'plasma_wave',
          });
        }
        break;

      case 3: // Charge & High Jump Downward Crush
        boss.vy = -13;
        boss.grounded = false;
        boss.vx = dirToPlayer * 6;
        break;
    }
  }

  if (boss.state === 'attack') {
    boss.vx *= 0.94;
  }
}

function applyGravity(enemy: Enemy, platforms: Platform[], dt: number) {
  enemy.vy = Math.min(enemy.vy + 0.58, 14);
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  enemy.grounded = false;

  for (const plat of platforms) {
    if (plat.hazard) continue;

    // Platform collision
    if (
      enemy.vy >= 0 &&
      enemy.y >= plat.y &&
      enemy.y - enemy.vy * dt <= plat.y + 4 &&
      enemy.x + enemy.width / 2 > plat.x &&
      enemy.x - enemy.width / 2 < plat.x + plat.width
    ) {
      enemy.y = plat.y;
      enemy.vy = 0;
      enemy.grounded = true;
    }
  }
}
