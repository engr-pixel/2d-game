import { Player, Platform, ScarfSegment, Projectile, Particle, FloatingText } from './types';
import { soundEngine } from './audio';

const GRAVITY = 0.58;
const MAX_FALL_SPEED = 14;
const RUN_SPEED = 7.2;
const DASH_SPEED = 14.5;
const SLIDE_SPEED = 11.0;
const JUMP_FORCE = -12.5;
const DOUBLE_JUMP_FORCE = -11.0;
const WALL_JUMP_FORCE_X = 9.0;
const WALL_JUMP_FORCE_Y = -11.5;
const WALL_SLIDE_SPEED = 2.2;

export function createPlayer(x: number, y: number): Player {
  // Initialize scarf segments
  const scarf: ScarfSegment[] = [];
  for (let i = 0; i < 9; i++) {
    scarf.push({
      x: x - i * 4,
      y: y - 10 + i * 2,
      prevX: x - i * 4,
      prevY: y - 10 + i * 2,
    });
  }

  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width: 28,
    height: 52,
    facing: 1,
    grounded: false,
    wallClinging: false,
    wallSide: 1,
    jumpCount: 0,
    maxJumps: 2,

    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    isSliding: false,
    slideTimer: 0,
    isCrouching: false,

    isAttacking: false,
    attackIndex: 0,
    attackTimer: 0,
    attackCooldown: 0,
    attackHitEnemies: new Set<number>(),

    isBlocking: false,
    parryWindow: 0,
    parryCooldown: 0,
    isParrySuccess: false,
    parrySuccessTimer: 0,

    health: 100,
    maxHealth: 100,
    spirit: 50,
    maxSpirit: 100,
    shurikens: 10,
    maxShurikens: 15,
    shurikenCooldown: 0,
    hasDrone: false,
    droneAngle: 0,
    droneCooldown: 0,

    invincibleTimer: 0,

    somersaultRotation: 0,
    scarf,
    afterImages: [],
    color: '#06b6d4',
    trailTimer: 0,
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  block: boolean;
  dash: boolean;
  shuriken: boolean;
  ninjutsu: boolean;
}

export function updatePlayer(
  player: Player,
  input: InputState,
  prevInput: InputState,
  platforms: Platform[],
  projectiles: Projectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  dt: number = 1
) {
  // Update cooldown timers
  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  if (player.attackCooldown > 0) player.attackCooldown -= dt;
  if (player.parryCooldown > 0) player.parryCooldown -= dt;
  if (player.shurikenCooldown > 0) player.shurikenCooldown -= dt;
  if (player.droneCooldown > 0) player.droneCooldown -= dt;
  if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
  if (player.parrySuccessTimer > 0) player.parrySuccessTimer -= dt;

  // Update scarf physics
  updateScarf(player);

  // Update afterimages
  for (let i = player.afterImages.length - 1; i >= 0; i--) {
    player.afterImages[i].alpha -= 0.05 * dt;
    if (player.afterImages[i].alpha <= 0) {
      player.afterImages.splice(i, 1);
    }
  }

  // Handle Blocking / Parrying
  if (input.block && !player.isDashing && !player.isSliding) {
    if (!player.isBlocking && player.parryCooldown <= 0) {
      // Just pressed block -> activate parry window
      player.isBlocking = true;
      player.parryWindow = 12; // 12 frames ~ 200ms
    }
    player.isBlocking = true;
    if (player.parryWindow > 0) player.parryWindow -= dt;
    // Slow down during block
    if (player.grounded) {
      player.vx *= 0.8;
    }
  } else {
    player.isBlocking = false;
    player.parryWindow = 0;
  }

  // Handle Dashing
  const jumpJustPressed = input.jump && !prevInput.jump;
  const attackJustPressed = input.attack && !prevInput.attack;
  const dashJustPressed = input.dash && !prevInput.dash;
  const shurikenJustPressed = input.shuriken && !prevInput.shuriken;
  const ninjutsuJustPressed = input.ninjutsu && !prevInput.ninjutsu;

  if (dashJustPressed && player.dashCooldown <= 0 && !player.isDashing && !player.isBlocking) {
    if (input.down && player.grounded) {
      // Crouch slide
      player.isSliding = true;
      player.slideTimer = 18;
      player.dashCooldown = 28;
      player.vx = player.facing * SLIDE_SPEED;
      soundEngine.playDash();
      spawnSlideParticles(player, particles);
    } else {
      // Air or ground cyber dash
      player.isDashing = true;
      player.dashTimer = 14;
      player.dashCooldown = 24;
      const dashDir = input.left ? -1 : input.right ? 1 : player.facing;
      player.facing = dashDir as 1 | -1;
      player.vx = dashDir * DASH_SPEED;
      player.vy = 0;
      soundEngine.playDash();
    }
  }

  // Update Dash State
  if (player.isDashing) {
    player.dashTimer -= dt;
    player.vy = 0; // Maintain height during horizontal dash
    spawnAfterImage(player, '#06b6d4');
    if (player.dashTimer <= 0) {
      player.isDashing = false;
      player.vx = player.facing * RUN_SPEED * 0.8;
    }
  }

  // Update Slide State
  if (player.isSliding) {
    player.slideTimer -= dt;
    player.height = 32; // Lower profile
    spawnAfterImage(player, '#ec4899');
    if (player.slideTimer <= 0 || !player.grounded) {
      player.isSliding = false;
      player.height = 52;
    }
  } else {
    player.height = 52;
  }

  // Handle Attack Combo
  if (attackJustPressed && player.attackCooldown <= 0 && !player.isBlocking) {
    initiateAttack(player, projectiles, particles);
  }

  if (player.isAttacking) {
    player.attackTimer -= dt;
    if (player.attackTimer <= 0) {
      player.isAttacking = false;
    }
  }

  // Handle Shuriken Throw
  if (shurikenJustPressed && player.shurikenCooldown <= 0 && player.shurikens > 0) {
    player.shurikens--;
    player.shurikenCooldown = 15;
    soundEngine.playShuriken();
    projectiles.push({
      id: Date.now() + Math.random(),
      x: player.x + player.facing * 20,
      y: player.y - 12,
      vx: player.facing * 16,
      vy: 0,
      radius: 7,
      color: '#06b6d4',
      source: 'player',
      damage: 30,
      life: 60,
      maxLife: 60,
      type: 'shuriken',
      rotation: 0,
    });
  }

  // Handle Ninjutsu Overdrive
  if (ninjutsuJustPressed && player.spirit >= 100) {
    player.spirit = 0;
    soundEngine.playNinjutsu();
    floatingTexts.push({
      id: Math.random(),
      x: player.x,
      y: player.y - 60,
      text: '忍法: 龍神斬 (RYU-JIN OVERDRIVE)',
      color: '#ec4899',
      size: 20,
      life: 70,
      maxLife: 70,
      vy: -1,
      bold: true,
    });

    // Massive screen clearing dragon wave
    projectiles.push({
      id: Date.now() + Math.random(),
      x: player.x + player.facing * 30,
      y: player.y - 20,
      vx: player.facing * 14,
      vy: 0,
      radius: 40,
      color: '#ec4899',
      source: 'player',
      damage: 180,
      life: 90,
      maxLife: 90,
      type: 'dragon_wave',
      piercing: true,
    });

    // Ring explosion particles
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      particles.push({
        x: player.x,
        y: player.y - 20,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        size: 8,
        color: i % 2 === 0 ? '#ec4899' : '#06b6d4',
        life: 30,
        maxLife: 30,
        type: 'plasma',
      });
    }
  }

  // Handle Drone Orbit & Fire
  if (player.hasDrone) {
    player.droneAngle += 0.08 * dt;
    if (player.droneCooldown <= 0) {
      player.droneCooldown = 35; // Fires every ~0.6s
      soundEngine.playDroneLaser();
      const droneX = player.x + Math.cos(player.droneAngle) * 36;
      const droneY = player.y - 25 + Math.sin(player.droneAngle) * 16;
      projectiles.push({
        id: Date.now() + Math.random(),
        x: droneX,
        y: droneY,
        vx: player.facing * 15,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 4,
        color: '#a855f7',
        source: 'player',
        damage: 18,
        life: 50,
        maxLife: 50,
        type: 'drone_bolt',
      });
    }
  }

  // Horizontal Movement (if not dashing / sliding)
  if (!player.isDashing && !player.isSliding) {
    if (input.left && !input.right) {
      player.vx = -RUN_SPEED;
      player.facing = -1;
    } else if (input.right && !input.left) {
      player.vx = RUN_SPEED;
      player.facing = 1;
    } else {
      player.vx *= player.grounded ? 0.65 : 0.88;
      if (Math.abs(player.vx) < 0.2) player.vx = 0;
    }
  }

  // Crouch state
  player.isCrouching = input.down && player.grounded && !player.isDashing && !player.isSliding;

  // Jumping & Wall Jump
  if (jumpJustPressed) {
    if (player.wallClinging) {
      // Wall Kick (Strider style kick off the wall)
      player.vy = WALL_JUMP_FORCE_Y;
      player.vx = -player.wallSide * WALL_JUMP_FORCE_X;
      player.facing = (-player.wallSide) as 1 | -1;
      player.wallClinging = false;
      player.jumpCount = 1;
      soundEngine.playJump();
      spawnWallSparks(player, particles);
    } else if (player.grounded) {
      // Ground Jump
      player.vy = JUMP_FORCE;
      player.grounded = false;
      player.jumpCount = 1;
      soundEngine.playJump();
    } else if (player.jumpCount < player.maxJumps) {
      // Acrobatic somersault Double Jump
      player.vy = DOUBLE_JUMP_FORCE;
      player.jumpCount++;
      player.somersaultRotation = 0;
      soundEngine.playJump();
      spawnSomersaultParticles(player, particles);
    }
  }

  // Variable Jump Height (releasing jump early truncates ascent)
  if (!input.jump && player.vy < -4) {
    player.vy *= 0.65;
  }

  // Gravity & Wall Cling
  if (!player.isDashing) {
    if (player.wallClinging) {
      player.vy = Math.min(player.vy + GRAVITY * 0.4, WALL_SLIDE_SPEED);
      if (Math.random() < 0.3) {
        particles.push({
          x: player.x + player.wallSide * 14,
          y: player.y + 10,
          vx: -player.wallSide * (Math.random() * 2),
          vy: -Math.random() * 2,
          size: 3,
          color: '#06b6d4',
          life: 15,
          maxLife: 15,
          type: 'spark',
        });
      }
    } else {
      player.vy = Math.min(player.vy + GRAVITY, MAX_FALL_SPEED);
    }
  }

  // Acrobatic somersault rotation when jumping in air
  if (!player.grounded && !player.wallClinging) {
    player.somersaultRotation += player.facing * 0.25 * dt;
  } else {
    player.somersaultRotation = 0;
  }

  // Apply Movement & Collisions
  moveAndCollide(player, platforms, input, dt);
}

function initiateAttack(player: Player, projectiles: Projectile[], particles: Particle[]) {
  player.isAttacking = true;
  player.attackHitEnemies.clear();

  // Combo progression (0 -> 1 -> 2 -> 0)
  if (player.attackTimer > 0) {
    player.attackIndex = (player.attackIndex + 1) % 3;
  } else {
    player.attackIndex = 0;
  }

  player.attackTimer = 16;
  player.attackCooldown = 18;

  // Lunge forward slightly during combos
  if (player.grounded && !player.isCrouching) {
    player.vx += player.facing * (player.attackIndex === 2 ? 6 : 3.5);
  }

  soundEngine.playSlash(player.attackIndex);

  // Third attack step creates a forward plasma shockwave wave
  if (player.attackIndex === 2) {
    projectiles.push({
      id: Date.now() + Math.random(),
      x: player.x + player.facing * 28,
      y: player.y - 10,
      vx: player.facing * 12,
      vy: 0,
      radius: 20,
      color: '#06b6d4',
      source: 'player',
      damage: 45,
      life: 25,
      maxLife: 25,
      type: 'plasma_wave',
      piercing: false,
    });

    // Burst particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: player.x + player.facing * 20,
        y: player.y - 10,
        vx: player.facing * (4 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 5,
        size: 5,
        color: '#06b6d4',
        life: 20,
        maxLife: 20,
        type: 'plasma',
      });
    }
  }
}

function moveAndCollide(player: Player, platforms: Platform[], input: InputState, dt: number) {
  // Move X
  player.x += player.vx * dt;
  player.wallClinging = false;

  // X Collision
  for (const plat of platforms) {
    if (plat.oneWay) continue; // One way platforms have no horizontal collision

    if (checkAABB(player, plat)) {
      if (player.vx > 0) {
        player.x = plat.x - player.width / 2;
        if (!player.grounded && plat.wallClimbable) {
          player.wallClinging = true;
          player.wallSide = 1;
        }
      } else if (player.vx < 0) {
        player.x = plat.x + plat.width + player.width / 2;
        if (!player.grounded && plat.wallClimbable) {
          player.wallClinging = true;
          player.wallSide = -1;
        }
      }
      player.vx = 0;
    }
  }

  // Move Y
  player.y += player.vy * dt;
  player.grounded = false;

  // Y Collision
  for (const plat of platforms) {
    if (plat.hazard && checkAABB(player, plat)) {
      // Landed on hazard
      player.health -= 15;
      player.vy = -10;
      soundEngine.playHit(true);
      continue;
    }

    if (plat.oneWay) {
      // Allow dropping through one-way platforms by pressing Down + Jump
      if (input.down && input.jump) continue;

      // Check if feet were above or entering the platform top
      const feetY = player.y;
      const prevFeetY = player.y - player.vy * dt;
      if (
        player.vy >= 0 &&
        prevFeetY <= plat.y + 4 &&
        feetY >= plat.y &&
        player.x + player.width / 2 > plat.x &&
        player.x - player.width / 2 < plat.x + plat.width
      ) {
        player.y = plat.y;
        player.vy = 0;
        player.grounded = true;
        player.jumpCount = 0;
        player.wallClinging = false;
        if (plat.moving && plat.moveSpeedX) {
          player.x += plat.moveSpeedX;
        }
      }
      continue;
    }

    if (checkAABB(player, plat)) {
      if (player.vy > 0) {
        // Landed on top
        player.y = plat.y;
        player.vy = 0;
        player.grounded = true;
        player.jumpCount = 0;
        player.wallClinging = false;
      } else if (player.vy < 0) {
        // Hit head
        player.y = plat.y + plat.height + player.height;
        player.vy = 0;
      }
    }
  }
}

function checkAABB(player: Player, plat: Platform): boolean {
  const pLeft = player.x - player.width / 2;
  const pRight = player.x + player.width / 2;
  const pTop = player.y - player.height;
  const pBottom = player.y;

  const bLeft = plat.x;
  const bRight = plat.x + plat.width;
  const bTop = plat.y;
  const bBottom = plat.y + plat.height;

  return pRight > bLeft && pLeft < bRight && pBottom > bTop && pTop < bBottom;
}

function updateScarf(player: Player) {
  const segments = player.scarf;
  // Pin head to player collar
  segments[0].x = player.x - player.facing * 6;
  segments[0].y = player.y - player.height + 12;

  const segmentLength = 5.5;

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    // Inertia & velocity
    const vx = (seg.x - seg.prevX) * 0.9;
    const vy = (seg.y - seg.prevY) * 0.9 + 0.15; // Gravity

    seg.prevX = seg.x;
    seg.prevY = seg.y;

    // Apply wind and trailing force opposite to movement
    const windForce = -player.facing * (Math.abs(player.vx) * 0.4 + 1.2);
    seg.x += vx + windForce;
    seg.y += vy;

    // Constrain distance to previous segment (Verlet distance constraint)
    const prev = segments[i - 1];
    const dx = seg.x - prev.x;
    const dy = seg.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const diff = (dist - segmentLength) / dist;
      seg.x -= dx * diff * 0.8;
      seg.y -= dy * diff * 0.8;
    }
  }
}

function spawnAfterImage(player: Player, color: string) {
  player.trailTimer += 1;
  if (player.trailTimer % 2 === 0) {
    player.afterImages.push({
      x: player.x,
      y: player.y,
      facing: player.facing,
      action: player.isSliding ? 'slide' : 'dash',
      frame: 0,
      alpha: 0.65,
      color,
    });
  }
}

function spawnSlideParticles(player: Player, particles: Particle[]) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: player.x - player.facing * 10,
      y: player.y - 2,
      vx: -player.facing * (Math.random() * 4 + 2),
      vy: -Math.random() * 2,
      size: 4,
      color: '#ec4899',
      life: 18,
      maxLife: 18,
      type: 'spark',
    });
  }
}

function spawnSomersaultParticles(player: Player, particles: Particle[]) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: player.x,
      y: player.y - 25,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      size: 4,
      color: '#06b6d4',
      life: 20,
      maxLife: 20,
      type: 'plasma',
    });
  }
}

function spawnWallSparks(player: Player, particles: Particle[]) {
  for (let i = 0; i < 7; i++) {
    particles.push({
      x: player.x + player.wallSide * 14,
      y: player.y - 20,
      vx: -player.wallSide * (Math.random() * 4 + 2),
      vy: (Math.random() - 0.5) * 4,
      size: 3,
      color: '#38bdf8',
      life: 18,
      maxLife: 18,
      type: 'spark',
    });
  }
}
