import { Player, Enemy, Projectile, Pickup, Particle, FloatingText, Platform, StageData, GameStats } from './types';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sakuraPetals: { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number }[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;
  private flashAlpha: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Initialize atmospheric sakura petals
    for (let i = 0; i < 40; i++) {
      this.sakuraPetals.push({
        x: Math.random() * 2000,
        y: Math.random() * 1000,
        vx: -(Math.random() * 1.5 + 0.8),
        vy: Math.random() * 0.9 + 0.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: Math.random() * 3 + 3,
      });
    }

    // Initialize rain drops
    for (let i = 0; i < 70; i++) {
      this.rainDrops.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        speed: Math.random() * 8 + 12,
        len: Math.random() * 14 + 10,
      });
    }
  }

  public triggerFlash(intensity: number = 0.5) {
    this.flashAlpha = intensity;
  }

  public render(
    stage: StageData,
    player: Player,
    enemies: Enemy[],
    projectiles: Projectile[],
    pickups: Pickup[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    stats: GameStats,
    screenShake: number = 0
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Smooth Camera Follow
    const targetCamX = player.x - width * 0.4;
    const targetCamY = player.y - height * 0.55;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    // Clamp camera within stage bounds
    this.cameraX = Math.max(0, Math.min(this.cameraX, stage.width - width));
    this.cameraY = Math.max(0, Math.min(this.cameraY, stage.height - height));

    // Screen Shake Offset
    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * screenShake * 2;
      shakeY = (Math.random() - 0.5) * screenShake * 2;
    }

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Camera Transform
    ctx.translate(-Math.floor(this.cameraX + shakeX), -Math.floor(this.cameraY + shakeY));

    // 1. Far Parallax Background (Blood Moon & Cyber Pagoda Silhouettes)
    this.renderFarBackground(stage, width, height);

    // 2. Mid Parallax Background (Neon Torii & Kanji Billboards)
    this.renderMidBackground(stage, width, height);

    // 3. Platforms (Pagoda roofs, beams, conduits)
    this.renderPlatforms(stage.platforms);

    // 4. Pickups
    this.renderPickups(pickups);

    // 5. Enemies
    this.renderEnemies(enemies);

    // 6. Player (Strider Kage with physics scarf, cypher blade, and afterimages)
    this.renderPlayer(player);

    // 7. Projectiles (Shurikens, Kunai, Plasma Waves, Lasers)
    this.renderProjectiles(projectiles);

    // 8. Particles & Sparks
    this.renderParticles(particles);

    // 9. Floating Combat Text
    this.renderFloatingText(floatingTexts);

    // 10. Atmospheric Weather (Rain & Sakura Petals)
    this.renderWeather(width, height);

    ctx.restore();

    // 11. Fullscreen Flash (Parry / Big Hit FX)
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
      this.flashAlpha -= 0.04;
    }

    // 12. Retro CRT Scanline & Vignette Effect
    this.renderVignette(width, height);
  }

  private renderFarBackground(stage: StageData, screenW: number, screenH: number) {
    const ctx = this.ctx;
    const camX = this.cameraX;
    const camY = this.cameraY;

    // Deep Dusk / Cyberpunk Night Sky gradient
    const skyGrad = ctx.createLinearGradient(0, camY, 0, camY + screenH);
    if (stage.theme === 'sanctum') {
      skyGrad.addColorStop(0, '#0f051d');
      skyGrad.addColorStop(0.5, '#1e0c2b');
      skyGrad.addColorStop(1, '#2c0d1e');
    } else {
      skyGrad.addColorStop(0, '#050b14');
      skyGrad.addColorStop(0.5, '#0b192e');
      skyGrad.addColorStop(1, '#1a102f');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(camX, camY, screenW, screenH);

    // Massive Cyber Blood Moon (moves very slowly with camera)
    const moonX = camX + screenW * 0.75 - camX * 0.05;
    const moonY = camY + 180 - camY * 0.05;
    const moonRadius = 90;

    // Moon Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2);
    moonGlow.addColorStop(0, stage.theme === 'sanctum' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(236, 72, 153, 0.35)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Moon Core
    ctx.fillStyle = stage.theme === 'sanctum' ? '#ef4444' : '#f43f5e';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cyber Moon Grid / Holographic Rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius + 15, -0.6, 2.5);
    ctx.stroke();

    // Distant Megacity Spire Silhouettes
    const farParallax = camX * 0.15;
    ctx.fillStyle = '#090d16';
    const spireWidth = 140;
    for (let x = -200; x < stage.width + 400; x += spireWidth) {
      const h = 280 + Math.sin(x * 0.01) * 120;
      ctx.fillRect(x - farParallax, stage.height - h, spireWidth - 10, h);
      // Red blinking tower beacons
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - farParallax + spireWidth / 2 - 2, stage.height - h - 4, 4, 4);
      ctx.fillStyle = '#090d16';
    }
  }

  private renderMidBackground(stage: StageData, screenW: number, screenH: number) {
    const ctx = this.ctx;
    const camX = this.cameraX;
    const midParallax = camX * 0.35;

    // Mid Pagoda Rooftops and Neon Billboards
    ctx.fillStyle = '#111827';
    for (let x = 0; x < stage.width + 200; x += 400) {
      const roofY = stage.height - 350 + Math.sin(x) * 60;
      // Traditional multi-tiered Pagoda roof silhouette
      ctx.beginPath();
      ctx.moveTo(x - midParallax, roofY);
      ctx.lineTo(x - midParallax + 150, roofY - 50);
      ctx.lineTo(x - midParallax + 300, roofY);
      ctx.lineTo(x - midParallax + 260, roofY + 180);
      ctx.lineTo(x - midParallax + 40, roofY + 180);
      ctx.closePath();
      ctx.fill();

      // Glowing Neon Kanji Sign
      const kanjiSigns = ['忍', '斬', '影', '龍', '滅', '電'];
      const signKanji = kanjiSigns[Math.floor(Math.abs(x / 400)) % kanjiSigns.length];
      ctx.font = 'bold 36px "Yuji Syuku", "Chakra Petch", serif';
      ctx.fillStyle = (x / 400) % 2 === 0 ? '#06b6d4' : '#ec4899';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fillText(signKanji, x - midParallax + 130, roofY + 80);
      ctx.shadowBlur = 0;

      // Hanging Japanese Red Lanterns
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(x - midParallax + 20, roofY + 20, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - midParallax + 280, roofY + 20, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private renderPlatforms(platforms: Platform[]) {
    const ctx = this.ctx;

    for (const plat of platforms) {
      // 1. Pagoda Roof Style
      if (plat.style === 'pagoda_roof') {
        // Dark Edo lacquer roof body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Ornate upturned eaves (sori curve at ends)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(plat.x - 12, plat.y - 8);
        ctx.quadraticCurveTo(plat.x + 10, plat.y + 4, plat.x + plat.width / 2, plat.y);
        ctx.quadraticCurveTo(plat.x + plat.width - 10, plat.y + 4, plat.x + plat.width + 12, plat.y - 8);
        ctx.lineTo(plat.x + plat.width + 6, plat.y + 12);
        ctx.lineTo(plat.x - 6, plat.y + 12);
        ctx.closePath();
        ctx.fill();

        // Glowing cyan / gold cybernetic trim running along the roof ridge
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(plat.x - 8, plat.y - 4);
        ctx.lineTo(plat.x + plat.width + 8, plat.y - 4);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Roof tile ribs pattern
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        for (let rx = plat.x + 16; rx < plat.x + plat.width; rx += 24) {
          ctx.beginPath();
          ctx.moveTo(rx, plat.y);
          ctx.lineTo(rx, plat.y + Math.min(plat.height, 40));
          ctx.stroke();
        }
      }
      // 2. Torii Lintel Gate Style
      else if (plat.style === 'torii_lintel') {
        // Crimson Torii beam
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Black cap with gold rim
        ctx.fillStyle = '#18181b';
        ctx.fillRect(plat.x - 8, plat.y - 6, plat.width + 16, 7);

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x - 6, plat.y - 6, plat.width + 12, 5);
      }
      // 3. Neon Conduit / Wall Climb Shaft
      else if (plat.style === 'neon_conduit') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Pulsing wall-climb cyber grid
        ctx.strokeStyle = plat.hazard ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        // Internal conduit pipes
        ctx.fillStyle = plat.hazard ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.2)';
        for (let cy = plat.y + 10; cy < plat.y + plat.height; cy += 25) {
          ctx.fillRect(plat.x + 4, cy, plat.width - 8, 4);
        }
      }
      // 4. Floating / Moving Platform
      else {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        ctx.shadowBlur = 0;

        // Thruster glow underneath
        const thrusterGrad = ctx.createLinearGradient(plat.x, plat.y + plat.height, plat.x, plat.y + plat.height + 15);
        thrusterGrad.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        thrusterGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = thrusterGrad;
        ctx.fillRect(plat.x + 10, plat.y + plat.height, plat.width - 20, 15);
      }
    }
  }

  private renderPickups(pickups: Pickup[]) {
    const ctx = this.ctx;
    const t = Date.now() * 0.005;

    for (const p of pickups) {
      const bobY = p.y + Math.sin(t * 3) * 4;
      ctx.save();
      ctx.translate(p.x, bobY);

      // Rotating glow ring
      ctx.strokeStyle = p.type === 'health' ? '#22c55e' : p.type === 'spirit' ? '#ec4899' : p.type === 'drone' ? '#a855f7' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Icon interior
      ctx.fillStyle = ctx.strokeStyle;
      if (p.type === 'health') {
        // Cross
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillRect(-2, -6, 4, 12);
      } else if (p.type === 'spirit') {
        // Flame / diamond
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'shuriken') {
        // 4-point star
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
          const b = a + Math.PI / 4;
          ctx.lineTo(Math.cos(b) * 3, Math.sin(b) * 3);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'drone') {
        // Orb with core
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cypher boost sword
        ctx.fillRect(-2, -8, 4, 16);
      }

      ctx.restore();
    }
  }

  private renderPlayer(player: Player) {
    const ctx = this.ctx;

    // 1. Render Afterimages
    for (const img of player.afterImages) {
      ctx.save();
      ctx.globalAlpha = img.alpha * 0.6;
      ctx.translate(img.x, img.y);
      ctx.scale(img.facing, 1);
      ctx.fillStyle = img.color;
      // Shadow silhouette
      ctx.beginPath();
      ctx.ellipse(0, -26, 14, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    // Invulnerability Blink
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 2. Somersault Flip Rotation when double jumping
    if (player.somersaultRotation !== 0) {
      ctx.translate(0, -player.height / 2);
      ctx.rotate(player.somersaultRotation);
      ctx.translate(0, player.height / 2);
    }

    ctx.scale(player.facing, 1);

    // 3. Trailing Scarf / Sash (Multi-segment physics with neon magenta/scarf gradient)
    this.renderScarf(player);

    // 4. Character Body (Strider "Kage" Sleek Cyber Ninja)
    if (player.isSliding) {
      // Crouch Slide Pose
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, -14, 24, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Visor Line
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(8, -18, 12, 3);
      ctx.shadowBlur = 0;
    } else if (player.wallClinging) {
      // Wall Cling Pose
      ctx.fillStyle = '#0f172a';
      // Torso
      ctx.fillRect(-10, -45, 18, 30);
      // Legs braced against wall
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-4, -15);
      ctx.lineTo(8, -5);
      ctx.lineTo(12, 0);
      ctx.stroke();

      // Hand holding cypher into wall
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(10, -35, 6, 6);
    } else {
      // Standing / Running / Somersault Pose

      // Legs / Ninja Greaves
      ctx.fillStyle = '#1e293b';
      const legOffset = Math.sin(Date.now() * 0.02) * (Math.abs(player.vx) > 1 ? 8 : 0);
      ctx.fillRect(-8 + legOffset, -22, 6, 22);
      ctx.fillRect(2 - legOffset, -22, 6, 22);

      // Torso & Cybernetic Armor vest
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -44, 22, 24);

      // Glowing Chest Emblems (Cypher Conduit)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-6, -38);
      ctx.lineTo(0, -30);
      ctx.lineTo(6, -38);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ninja Cowl / Head
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -48, 10, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Ninja Visor Eyes
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillRect(2, -50, 7, 3);
      ctx.shadowBlur = 0;

      // Arm & Cypher Tonfa Hilt
      ctx.fillStyle = '#334155';
      ctx.fillRect(2, -36, 12, 5);
    }

    // 5. Block / Parry Hexagonal Energy Shield
    if (player.isBlocking) {
      const shieldAlpha = player.parryWindow > 0 ? 0.9 : 0.6;
      const shieldColor = player.parryWindow > 0 ? '#fbbf24' : '#38bdf8';
      ctx.save();
      ctx.strokeStyle = shieldColor;
      ctx.fillStyle = player.parryWindow > 0 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 3;
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = 15;

      // Hexagonal Shield
      ctx.beginPath();
      const hx = 22;
      const hy = -28;
      const r = 32;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = hx + Math.cos(a) * r;
        const py = hy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 6. Iconic Plasma Cypher Blade Slash Animation
    if (player.isAttacking) {
      this.renderCypherSlash(player);
    }

    ctx.restore();

    // 7. Option Drone Orbiting Player
    if (player.hasDrone) {
      this.renderDrone(player);
    }
  }

  private renderScarf(player: Player) {
    const ctx = this.ctx;
    const segs = player.scarf;
    if (segs.length < 2) return;

    ctx.save();
    // Convert world space coordinates back to relative for rendering
    ctx.beginPath();
    ctx.moveTo(0, -42);

    for (let i = 1; i < segs.length; i++) {
      // Relative offset
      const relX = (segs[i].x - player.x) * player.facing;
      const relY = segs[i].y - player.y;
      ctx.lineTo(relX, relY);
    }

    // Crimson to bright magenta neon scarf glow
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private renderCypherSlash(player: Player) {
    const ctx = this.ctx;
    const progress = 1 - player.attackTimer / 16;
    const index = player.attackIndex;

    const baseColor = player.bladeColor || '#06b6d4';
    const comboColor = index === 2 ? (player.bladeSecondaryColor || '#ec4899') : baseColor;

    ctx.save();
    ctx.shadowColor = comboColor;
    ctx.shadowBlur = 18;

    // Curved crescent arc mesh
    const arcRadius = index === 2 ? 65 : 52;
    const startAngle = index === 0 ? -Math.PI * 0.7 : index === 1 ? -Math.PI * 0.3 : -Math.PI * 0.9;
    const endAngle = startAngle + Math.PI * 0.95;

    const sweepAngle = startAngle + (endAngle - startAngle) * Math.min(1, progress * 1.5);

    // Plasma outer blade arc
    const slashGrad = ctx.createRadialGradient(15, -28, arcRadius * 0.5, 15, -28, arcRadius * 1.1);
    slashGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    slashGrad.addColorStop(0.7, comboColor);
    slashGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = slashGrad;
    ctx.beginPath();
    ctx.arc(15, -28, arcRadius, startAngle, sweepAngle, false);
    ctx.arc(15, -28, arcRadius - 16, sweepAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    // Searing hot razor edge
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(15, -28, arcRadius, startAngle, sweepAngle, false);
    ctx.stroke();

    ctx.restore();
  }

  private renderDrone(player: Player) {
    const ctx = this.ctx;
    const droneX = player.x + Math.cos(player.droneAngle) * 36;
    const droneY = player.y - 25 + Math.sin(player.droneAngle) * 16;

    ctx.save();
    ctx.translate(droneX, droneY);

    // Orb body
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Outer plasma shield ring
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 12, player.droneAngle * 2, player.droneAngle * 2 + Math.PI * 1.5);
    ctx.stroke();

    // Central pulsing laser eye
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;

    for (const enemy of enemies) {
      if (enemy.state === 'dead' && enemy.deathTimer! <= 0) continue;

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Stagger glitch effect
      if (enemy.staggerTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 4, 0);
      }

      // Cut In Half Death Animation
      if (enemy.cutInHalf && enemy.cutOffset !== undefined) {
        this.renderBisectedEnemy(enemy);
        ctx.restore();
        continue;
      }

      ctx.scale(enemy.facing, 1);

      switch (enemy.type) {
        case 'kage_ninja':
          this.renderKageNinja(enemy);
          break;

        case 'shinobi_marksman':
          this.renderShinobiMarksman(enemy);
          break;

        case 'cyber_ronin':
          this.renderCyberRonin(enemy);
          break;

        case 'kunoichi_glider':
          this.renderKunoichiGlider(enemy);
          break;

        case 'boss_kurogane':
          this.renderBossKurogane(enemy);
          break;
      }

      ctx.restore();

      // Enemy Health Bar (if damaged)
      if (enemy.health < enemy.maxHealth && enemy.state !== 'dead') {
        const hpPercent = Math.max(0, enemy.health / enemy.maxHealth);
        const barW = enemy.type === 'boss_kurogane' ? 80 : 36;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.height - 12, barW, 5);
        ctx.fillStyle = enemy.type === 'boss_kurogane' ? '#ef4444' : '#22c55e';
        ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.height - 12, barW * hpPercent, 5);
      }
    }
  }

  private renderKageNinja(enemy: Enemy) {
    const ctx = this.ctx;
    // Dark violet shinobi garb
    ctx.fillStyle = '#311042';
    ctx.fillRect(-10, -42, 20, 24);
    // Legs
    ctx.fillStyle = '#1e082b';
    ctx.fillRect(-7, -18, 5, 18);
    ctx.fillRect(2, -18, 5, 18);
    // Head / Mask
    ctx.fillStyle = '#311042';
    ctx.beginPath();
    ctx.arc(0, -44, 9, 0, Math.PI * 2);
    ctx.fill();
    // Glowing red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, -46, 5, 2);
    // Wakizashi Daggers
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(6, -32, 16, 3);
  }

  private renderShinobiMarksman(enemy: Enemy) {
    const ctx = this.ctx;
    // Conical Kasa Straw Hat
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(16, -42);
    ctx.lineTo(-16, -42);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, -40, 18, 22);
    ctx.fillRect(-6, -18, 5, 18);
    ctx.fillRect(2, -18, 5, 18);

    // Glowing Orange Optical Sensor
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 6;
    ctx.fillRect(4, -42, 4, 3);
    ctx.shadowBlur = 0;

    // Glowing Kunai in Hand
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(24, -30);
    ctx.lineTo(16, -34);
    ctx.closePath();
    ctx.fill();
  }

  private renderCyberRonin(enemy: Enemy) {
    const ctx = this.ctx;
    // Heavy Armored Kabuto Helmet with gold crest (kuwagata)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -50, 28, 28);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-10, -56);
    ctx.lineTo(0, -48);
    ctx.lineTo(10, -56);
    ctx.stroke();

    // Heavy Plated Body Armor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -48, 28, 28);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-10, -20, 8, 20);
    ctx.fillRect(2, -20, 8, 20);

    // Massive Cyber Odachi Sword
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.fillRect(10, -55, 6, 40);
    ctx.shadowBlur = 0;

    // Front Energy Shield (if active)
    if (enemy.shieldActive) {
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, -54, 8, 50);
      ctx.fillRect(14, -54, 8, 50);
    }
  }

  private renderKunoichiGlider(enemy: Enemy) {
    const ctx = this.ctx;
    // Cyber Glider Wings
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28, -35);
    ctx.lineTo(0, -45);
    ctx.lineTo(28, -35);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.ellipse(0, -22, 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Purple trailing ribbons
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-20, 5);
    ctx.moveTo(10, -10);
    ctx.lineTo(20, 5);
    ctx.stroke();
  }

  private renderBossKurogane(boss: Enemy) {
    const ctx = this.ctx;
    const isP2 = boss.bossPhase === 2;

    // Phase 2 Aura Flares
    if (isP2) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, -35, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Heavy Mech-Armor Plate
    ctx.fillStyle = isP2 ? '#450a0a' : '#1e1b4b';
    ctx.fillRect(-18, -60, 36, 36);

    // Horned Daimyo Kabuto
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-16, -68);
    ctx.lineTo(-24, -80);
    ctx.lineTo(-12, -68);
    ctx.moveTo(16, -68);
    ctx.lineTo(24, -80);
    ctx.lineTo(12, -68);
    ctx.fill();

    // Glowing Visor
    ctx.fillStyle = isP2 ? '#fef08a' : '#ef4444';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fillRect(4, -58, 12, 4);
    ctx.shadowBlur = 0;

    // Massive Plasma Katana
    ctx.fillStyle = isP2 ? '#ef4444' : '#ec4899';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.fillRect(14, -70, 7, 55);
    ctx.shadowBlur = 0;
  }

  private renderBisectedEnemy(enemy: Enemy) {
    const ctx = this.ctx;
    const offset = enemy.cutOffset || 0;
    const angle = enemy.cutAngle || 0.2;

    // Upper Half sliding off
    ctx.save();
    ctx.translate(offset * Math.cos(angle) * 30, -offset * 8);
    ctx.rotate(angle * 0.4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-12, -45, 24, 20);
    // Sparks at cut seam
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-12, -26, 24, 3);
    ctx.restore();

    // Lower Half collapsing
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -22, 20, 22);
    ctx.restore();
  }

  private renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'shuriken') {
        p.rotation = (p.rotation || 0) + 0.35;
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        // 4-point ninja star
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * p.radius, Math.sin(a) * p.radius);
          const b = a + Math.PI / 4;
          ctx.lineTo(Math.cos(b) * (p.radius * 0.35), Math.sin(b) * (p.radius * 0.35));
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'kunai') {
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        // Pointed knife blade
        ctx.beginPath();
        ctx.moveTo(p.radius * 2, 0);
        ctx.lineTo(-p.radius, -p.radius * 0.6);
        ctx.lineTo(-p.radius, p.radius * 0.6);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'plasma_wave' || p.type === 'dragon_wave') {
        // Crescent energy wave
        const waveGrad = ctx.createLinearGradient(-p.radius, 0, p.radius, 0);
        waveGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        waveGrad.addColorStop(0.5, p.color);
        waveGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = waveGrad;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, -Math.PI * 0.45, Math.PI * 0.45, false);
        ctx.arc(p.radius * 0.3, 0, p.radius * 0.8, Math.PI * 0.45, -Math.PI * 0.45, true);
        ctx.closePath();
        ctx.fill();
      } else {
        // Drone bolt / Laser
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      const alpha = p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'ring') {
        const ringRadius = (1 - alpha) * p.size;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'plasma') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  private renderFloatingText(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.life--;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }

      ft.y += ft.vy;
      const alpha = ft.life / ft.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${ft.bold ? 'bold ' : ''}${ft.size}px "Orbitron", "Chakra Petch", sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private renderWeather(screenW: number, screenH: number) {
    const ctx = this.ctx;
    const camX = this.cameraX;
    const camY = this.cameraY;

    // Sakura Blossom Petals
    ctx.fillStyle = 'rgba(244, 114, 182, 0.8)';
    for (const petal of this.sakuraPetals) {
      petal.x += petal.vx;
      petal.y += petal.vy;
      petal.rot += petal.rotSpeed;

      if (petal.x < camX - 50) petal.x = camX + screenW + 50;
      if (petal.y > camY + screenH + 50) petal.y = camY - 50;

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Neon Rain Streaks
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.2;
    for (const drop of this.rainDrops) {
      drop.y += drop.speed;
      drop.x -= drop.speed * 0.25; // Diagonal slant

      if (drop.y > camY + screenH) {
        drop.y = camY - 20;
        drop.x = camX + Math.random() * (screenW + 200);
      }

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.len * 0.25, drop.y + drop.len);
      ctx.stroke();
    }
  }

  private renderVignette(width: number, height: number) {
    const ctx = this.ctx;
    // Dark arcade edge vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.7);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Subtle CRT scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
  }
}
