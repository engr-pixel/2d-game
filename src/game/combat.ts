import { Player, Enemy, Projectile, Particle, FloatingText, Pickup, GameStats, StyleRank } from './types';
import { soundEngine } from './audio';

export interface CombatResult {
  hitStopFrames: number;
  screenShake: number;
}

export function handleCombatInteractions(
  player: Player,
  enemies: Enemy[],
  projectiles: Projectile[],
  pickups: Pickup[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  stats: GameStats
): CombatResult {
  let hitStop = 0;
  let screenShake = 0;

  // 1. Player Sword Slash Hitbox vs Enemies & Enemy Projectiles
  if (player.isAttacking) {
    const reachX = player.attackIndex === 2 ? 82 : 68;
    const reachY = player.attackIndex === 2 ? 65 : 55;
    const slashBox = {
      x: player.facing === 1 ? player.x : player.x - reachX,
      y: player.y - reachY,
      width: reachX,
      height: reachY + 10,
    };

    // Slicing incoming projectiles mid-air (Classic Strider feature)
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.source === 'enemy') {
        if (
          p.x >= slashBox.x &&
          p.x <= slashBox.x + slashBox.width &&
          p.y >= slashBox.y &&
          p.y <= slashBox.y + slashBox.height
        ) {
          // Slice projectile!
          soundEngine.playHit(false);
          projectiles.splice(i, 1);
          screenShake = Math.max(screenShake, 3);
          floatingTexts.push({
            id: Math.random(),
            x: p.x,
            y: p.y - 10,
            text: 'SLASH DEFLECT!',
            color: '#38bdf8',
            size: 14,
            life: 30,
            maxLife: 30,
            vy: -1.2,
          });
          // Spark explosion
          for (let k = 0; k < 6; k++) {
            particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              size: 3,
              color: '#38bdf8',
              life: 15,
              maxLife: 15,
              type: 'spark',
            });
          }
        }
      }
    }

    // Slash enemies
    for (const enemy of enemies) {
      if (enemy.state === 'dead' || enemy.invincibleTimer > 0) continue;
      if (player.attackHitEnemies.has(enemy.id)) continue;

      const enemyBox = {
        x: enemy.x - enemy.width / 2,
        y: enemy.y - enemy.height,
        width: enemy.width,
        height: enemy.height,
      };

      if (checkOverlap(slashBox, enemyBox)) {
        player.attackHitEnemies.add(enemy.id);

        // Check Cyber Ronin Shield front block
        const isBehind = (player.facing === 1 && enemy.facing === 1) || (player.facing === -1 && enemy.facing === -1);
        if (enemy.type === 'cyber_ronin' && enemy.shieldActive && !isBehind && player.attackIndex !== 2) {
          // Deflected by shield!
          soundEngine.playParry();
          player.vx = -player.facing * 5;
          screenShake = Math.max(screenShake, 4);
          floatingTexts.push({
            id: Math.random(),
            x: enemy.x,
            y: enemy.y - enemy.height - 10,
            text: 'GUARDED! (ATTACK FROM BEHIND)',
            color: '#fbbf24',
            size: 13,
            life: 35,
            maxLife: 35,
            vy: -1,
          });
          continue;
        }

        // Calculate damage
        const baseDmg = player.attackIndex === 0 ? 32 : player.attackIndex === 1 ? 42 : 65;
        const damage = Math.round(baseDmg * (1 + (stats.currentCombo > 5 ? 0.25 : 0)));
        enemy.health -= damage;
        enemy.invincibleTimer = 8;
        enemy.vx = player.facing * (player.attackIndex === 2 ? 8 : 4);

        // Hit FX
        soundEngine.playHit(player.attackIndex === 2);
        hitStop = Math.max(hitStop, player.attackIndex === 2 ? 5 : 3);
        screenShake = Math.max(screenShake, player.attackIndex === 2 ? 8 : 5);

        // Update Combo & Style
        stats.currentCombo++;
        stats.comboTimer = 200; // ~3.3 seconds
        stats.maxCombo = Math.max(stats.maxCombo, stats.currentCombo);
        stats.score += damage * 10 * Math.max(1, Math.floor(stats.currentCombo / 3));
        stats.stylePoints += 50 + stats.currentCombo * 10;
        updateStyleRank(stats);

        // Spirit gauge refill
        player.spirit = Math.min(player.maxSpirit, player.spirit + 14);

        // Floating damage text
        floatingTexts.push({
          id: Math.random(),
          x: enemy.x + (Math.random() - 0.5) * 20,
          y: enemy.y - enemy.height / 2,
          text: `${damage}`,
          color: player.attackIndex === 2 ? '#ec4899' : '#38bdf8',
          size: player.attackIndex === 2 ? 22 : 17,
          life: 40,
          maxLife: 40,
          vy: -1.5,
          bold: player.attackIndex === 2,
        });

        // Slash impact particles
        spawnSlashSparks(enemy.x, enemy.y - enemy.height / 2, player.facing, particles);

        // Check if enemy defeated
        if (enemy.health <= 0) {
          killEnemy(enemy, player, pickups, particles, floatingTexts, stats);
        }
      }
    }
  }

  // 2. Projectiles vs Characters
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life--;
    if (p.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Player Projectiles vs Enemies
    if (p.source === 'player') {
      let hitAny = false;
      for (const enemy of enemies) {
        if (enemy.state === 'dead') continue;
        if (Math.hypot(p.x - enemy.x, p.y - (enemy.y - enemy.height / 2)) < p.radius + enemy.width / 2) {
          enemy.health -= p.damage;
          enemy.invincibleTimer = 6;
          soundEngine.playHit(p.type === 'dragon_wave');
          hitAny = true;

          stats.currentCombo++;
          stats.comboTimer = 180;
          stats.score += p.damage * 8;
          updateStyleRank(stats);

          floatingTexts.push({
            id: Math.random(),
            x: enemy.x,
            y: enemy.y - enemy.height - 5,
            text: `${p.damage}`,
            color: '#38bdf8',
            size: 18,
            life: 35,
            maxLife: 35,
            vy: -1.2,
          });

          if (enemy.health <= 0) {
            killEnemy(enemy, player, pickups, particles, floatingTexts, stats);
          }

          if (!p.piercing) break;
        }
      }

      if (hitAny && !p.piercing) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    // Enemy Projectiles vs Player
    else if (p.source === 'enemy') {
      const pBox = {
        x: player.x - player.width / 2,
        y: player.y - player.height,
        width: player.width,
        height: player.height,
      };

      if (p.x >= pBox.x && p.x <= pBox.x + pBox.width && p.y >= pBox.y && p.y <= pBox.y + pBox.height) {
        // Check Parry!
        if (player.parryWindow > 0) {
          // PERFECT PARRY PROJECTILE DEFLECTION!
          soundEngine.playParry();
          p.source = 'player';
          p.vx = -p.vx * 1.8;
          p.vy = -p.vy * 1.8;
          p.damage *= 2;
          p.color = '#38bdf8';
          p.deflected = true;

          player.isParrySuccess = true;
          player.parrySuccessTimer = 15;
          player.spirit = Math.min(player.maxSpirit, player.spirit + 25);
          stats.parries++;
          stats.score += 300;
          stats.stylePoints += 200;
          updateStyleRank(stats);
          hitStop = Math.max(hitStop, 6);
          screenShake = Math.max(screenShake, 7);

          floatingTexts.push({
            id: Math.random(),
            x: player.x,
            y: player.y - player.height - 20,
            text: '★ PERFECT PARRY! ★',
            color: '#fbbf24',
            size: 20,
            life: 50,
            maxLife: 50,
            vy: -1.5,
            bold: true,
          });

          // Ring spark
          particles.push({
            x: player.x,
            y: player.y - player.height / 2,
            vx: 0,
            vy: 0,
            size: 40,
            color: '#fbbf24',
            life: 20,
            maxLife: 20,
            type: 'ring',
          });
          continue;
        }

        // Check Normal Block
        if (player.isBlocking) {
          soundEngine.playHit(false);
          player.health -= Math.round(p.damage * 0.25);
          player.vx = (p.vx > 0 ? 1 : -1) * 3;
          projectiles.splice(i, 1);
          floatingTexts.push({
            id: Math.random(),
            x: player.x,
            y: player.y - player.height - 10,
            text: 'BLOCKED',
            color: '#38bdf8',
            size: 14,
            life: 30,
            maxLife: 30,
            vy: -1,
          });
          continue;
        }

        // Direct Hit on Player
        if (player.invincibleTimer <= 0) {
          player.health -= p.damage;
          player.invincibleTimer = 35;
          stats.damageTaken += p.damage;
          stats.currentCombo = 0;
          soundEngine.playHit(true);
          screenShake = Math.max(screenShake, 9);
          projectiles.splice(i, 1);
        }
      }
    }
  }

  // 3. Enemy Melee Attacks vs Player
  for (const enemy of enemies) {
    if (enemy.state === 'dead' || enemy.state !== 'attack' || enemy.attackTimer <= 0) continue;

    const attackReach = enemy.type === 'boss_kurogane' ? 65 : 45;
    const enemyAttackBox = {
      x: enemy.facing === 1 ? enemy.x : enemy.x - attackReach,
      y: enemy.y - enemy.height,
      width: attackReach,
      height: enemy.height,
    };

    const playerBox = {
      x: player.x - player.width / 2,
      y: player.y - player.height,
      width: player.width,
      height: player.height,
    };

    if (checkOverlap(enemyAttackBox, playerBox)) {
      // Check Perfect Parry on Melee
      if (player.parryWindow > 0) {
        soundEngine.playParry();
        enemy.state = 'staggered';
        enemy.staggerTimer = 80; // 1.3s opening
        enemy.vx = -enemy.facing * 6;

        player.isParrySuccess = true;
        player.parrySuccessTimer = 18;
        player.spirit = Math.min(player.maxSpirit, player.spirit + 35);
        stats.parries++;
        stats.score += 500;
        stats.stylePoints += 300;
        updateStyleRank(stats);

        hitStop = Math.max(hitStop, 8);
        screenShake = Math.max(screenShake, 8);

        floatingTexts.push({
          id: Math.random(),
          x: enemy.x,
          y: enemy.y - enemy.height - 25,
          text: '★ STAGGER COUNTER! ★',
          color: '#fbbf24',
          size: 22,
          life: 55,
          maxLife: 55,
          vy: -1.6,
          bold: true,
        });

        particles.push({
          x: (player.x + enemy.x) / 2,
          y: player.y - player.height / 2,
          vx: 0,
          vy: 0,
          size: 55,
          color: '#fbbf24',
          life: 25,
          maxLife: 25,
          type: 'ring',
        });
        continue;
      }

      // Check Normal Block
      if (player.isBlocking) {
        soundEngine.playHit(false);
        const reducedDmg = Math.round(enemy.damage * 0.25);
        player.health -= reducedDmg;
        player.vx = enemy.facing * 4;
        enemy.attackTimer = 0; // End attack swing
        floatingTexts.push({
          id: Math.random(),
          x: player.x,
          y: player.y - player.height - 10,
          text: `BLOCKED (-${reducedDmg})`,
          color: '#38bdf8',
          size: 14,
          life: 30,
          maxLife: 30,
          vy: -1,
        });
        continue;
      }

      // Hit Player
      if (player.invincibleTimer <= 0) {
        player.health -= enemy.damage;
        player.invincibleTimer = 40;
        player.vx = enemy.facing * 7;
        player.vy = -4;
        stats.damageTaken += enemy.damage;
        stats.currentCombo = 0;
        soundEngine.playHit(true);
        screenShake = Math.max(screenShake, 11);
        enemy.attackTimer = 0;
      }
    }
  }

  // 4. Pickups collection
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pickup = pickups[i];
    pickup.life--;
    if (pickup.life <= 0) {
      pickups.splice(i, 1);
      continue;
    }

    if (Math.hypot(player.x - pickup.x, player.y - player.height / 2 - pickup.y) < 32) {
      soundEngine.playPickup();
      switch (pickup.type) {
        case 'health':
          player.health = Math.min(player.maxHealth, player.health + pickup.value);
          floatingTexts.push({
            id: Math.random(),
            x: pickup.x,
            y: pickup.y - 15,
            text: `+${pickup.value} HP`,
            color: '#22c55e',
            size: 16,
            life: 35,
            maxLife: 35,
            vy: -1.2,
            bold: true,
          });
          break;

        case 'spirit':
          player.spirit = Math.min(player.maxSpirit, player.spirit + pickup.value);
          floatingTexts.push({
            id: Math.random(),
            x: pickup.x,
            y: pickup.y - 15,
            text: `+${pickup.value} SPIRIT`,
            color: '#ec4899',
            size: 16,
            life: 35,
            maxLife: 35,
            vy: -1.2,
            bold: true,
          });
          break;

        case 'shuriken':
          player.shurikens = Math.min(player.maxShurikens, player.shurikens + pickup.value);
          floatingTexts.push({
            id: Math.random(),
            x: pickup.x,
            y: pickup.y - 15,
            text: `+${pickup.value} SHURIKENS`,
            color: '#38bdf8',
            size: 16,
            life: 35,
            maxLife: 35,
            vy: -1.2,
            bold: true,
          });
          break;

        case 'drone':
          player.hasDrone = true;
          floatingTexts.push({
            id: Math.random(),
            x: pickup.x,
            y: pickup.y - 20,
            text: 'OPTION SATELLITE ONLINE!',
            color: '#a855f7',
            size: 18,
            life: 45,
            maxLife: 45,
            vy: -1.4,
            bold: true,
          });
          break;

        case 'cypher_boost':
          player.spirit = 100;
          player.health = Math.min(player.maxHealth, player.health + 30);
          floatingTexts.push({
            id: Math.random(),
            x: pickup.x,
            y: pickup.y - 20,
            text: 'CYPHER OVERDRIVE READY!',
            color: '#38bdf8',
            size: 20,
            life: 50,
            maxLife: 50,
            vy: -1.5,
            bold: true,
          });
          break;
      }
      pickups.splice(i, 1);
    }
  }

  // Decay combo timer
  if (stats.comboTimer > 0) {
    stats.comboTimer--;
    if (stats.comboTimer <= 0) {
      stats.currentCombo = 0;
      updateStyleRank(stats);
    }
  }

  return { hitStopFrames: hitStop, screenShake };
}

function killEnemy(
  enemy: Enemy,
  player: Player,
  pickups: Pickup[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  stats: GameStats
) {
  enemy.state = 'dead';
  enemy.cutInHalf = true;
  enemy.cutAngle = (Math.random() - 0.5) * 0.4 + (player.facing === 1 ? 0.3 : -0.3);
  enemy.cutOffset = 0;
  enemy.deathTimer = 40;

  soundEngine.playEnemyDeath();
  stats.kills++;
  stats.score += enemy.scoreValue;
  stats.stylePoints += 150;
  updateStyleRank(stats);

  // Spark burst
  for (let i = 0; i < 18; i++) {
    particles.push({
      x: enemy.x,
      y: enemy.y - enemy.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: 4 + Math.random() * 3,
      color: i % 2 === 0 ? '#38bdf8' : '#ec4899',
      life: 25,
      maxLife: 25,
      type: 'spark',
    });
  }

  // Random item drop
  const rand = Math.random();
  if (rand < 0.35) {
    pickups.push({
      id: Date.now() + Math.random(),
      x: enemy.x,
      y: enemy.y - 15,
      vx: 0,
      vy: 0,
      type: 'health',
      value: 25,
      life: 600, // 10 seconds
    });
  } else if (rand < 0.6) {
    pickups.push({
      id: Date.now() + Math.random(),
      x: enemy.x,
      y: enemy.y - 15,
      vx: 0,
      vy: 0,
      type: 'spirit',
      value: 30,
      life: 600,
    });
  } else if (rand < 0.75) {
    pickups.push({
      id: Date.now() + Math.random(),
      x: enemy.x,
      y: enemy.y - 15,
      vx: 0,
      vy: 0,
      type: 'shuriken',
      value: 5,
      life: 600,
    });
  }
}

function checkOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnSlashSparks(x: number, y: number, dir: 1 | -1, particles: Particle[]) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      vx: dir * (Math.random() * 6 + 2),
      vy: (Math.random() - 0.5) * 8,
      size: 4,
      color: '#38bdf8',
      life: 20,
      maxLife: 20,
      type: 'spark',
    });
  }
}

function updateStyleRank(stats: GameStats) {
  const pts = stats.stylePoints;
  if (pts > 3500) stats.styleRank = 'SSS';
  else if (pts > 2400) stats.styleRank = 'SS';
  else if (pts > 1600) stats.styleRank = 'S';
  else if (pts > 1000) stats.styleRank = 'A';
  else if (pts > 550) stats.styleRank = 'B';
  else if (pts > 200) stats.styleRank = 'C';
  else stats.styleRank = 'D';
}
