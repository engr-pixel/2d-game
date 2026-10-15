import { GameStateStatus, GameMode, StageData, Player, Enemy, Projectile, Pickup, Particle, FloatingText, GameStats } from './types';
import { STAGES, getSurvivalStage } from './levels';
import { createPlayer, updatePlayer, InputState } from './player';
import { createEnemy, updateEnemy } from './enemies';
import { handleCombatInteractions } from './combat';
import { GameRenderer } from './renderer';
import { soundEngine } from './audio';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: GameRenderer;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game State
  public status: GameStateStatus = 'menu';
  public mode: GameMode = 'story';
  public currentStageIndex: number = 0;
  public stage!: StageData;
  public player!: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public pickups: Pickup[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Hit Stop & Screen Shake
  private hitStopRemaining: number = 0;
  private screenShake: number = 0;

  // Survival Mode Wave State
  public survivalWave: number = 1;
  private waveSpawnTimer: number = 0;

  // Blade Customization
  public bladeColor: string = '#06b6d4';
  public bladeSecondaryColor: string = '#ec4899';

  // Stats
  public stats: GameStats = {
    score: 0,
    kills: 0,
    parries: 0,
    combos: 0,
    maxCombo: 0,
    damageTaken: 0,
    timeElapsed: 0,
    currentCombo: 0,
    comboTimer: 0,
    stylePoints: 0,
    styleRank: 'D',
  };

  // Input states
  public currentInput: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    block: false,
    dash: false,
    shuriken: false,
    ninjutsu: false,
  };
  private prevInput: InputState = { ...this.currentInput };

  // Listeners
  private onStateChange?: (status: GameStateStatus) => void;
  private onStatsUpdate?: (stats: GameStats) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
  }

  public setCallbacks(onStateChange: (s: GameStateStatus) => void, onStatsUpdate: (st: GameStats) => void) {
    this.onStateChange = onStateChange;
    this.onStatsUpdate = onStatsUpdate;
  }

  public startStory(stageIndex: number = 0) {
    this.mode = 'story';
    this.currentStageIndex = stageIndex;
    this.initStage(STAGES[stageIndex]);
    this.setStatus('playing');
    soundEngine.startMusic(this.stage.hasBoss ?? false);
    this.loop(performance.now());
  }

  public startSurvival() {
    this.mode = 'survival';
    this.survivalWave = 1;
    this.waveSpawnTimer = 30;
    this.initStage(getSurvivalStage());
    this.setStatus('playing');
    soundEngine.startMusic(false);
    this.loop(performance.now());
  }

  public restartCurrentStage() {
    if (this.mode === 'story') {
      this.startStory(this.currentStageIndex);
    } else {
      this.startSurvival();
    }
  }

  public nextStage() {
    if (this.currentStageIndex + 1 < STAGES.length) {
      this.currentStageIndex++;
      this.initStage(STAGES[this.currentStageIndex]);
      this.setStatus('playing');
      soundEngine.setBossTheme(this.stage.hasBoss ?? false);
    } else {
      this.setStatus('victory');
      soundEngine.stopMusic();
    }
  }

  public togglePause() {
    if (this.status === 'playing') {
      this.setStatus('paused');
    } else if (this.status === 'paused') {
      this.setStatus('playing');
      this.lastTime = performance.now();
    }
  }

  private setStatus(newStatus: GameStateStatus) {
    this.status = newStatus;
    if (this.onStateChange) this.onStateChange(newStatus);
  }

  public setBladeStyle(color: string, secondaryColor: string) {
    this.bladeColor = color;
    this.bladeSecondaryColor = secondaryColor;
    if (this.player) {
      this.player.bladeColor = color;
      this.player.bladeSecondaryColor = secondaryColor;
    }
  }

  private initStage(stageData: StageData) {
    this.stage = stageData;
    this.player = createPlayer(stageData.spawnX, stageData.spawnY);
    this.player.bladeColor = this.bladeColor;
    this.player.bladeSecondaryColor = this.bladeSecondaryColor;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.hitStopRemaining = 0;
    this.screenShake = 0;

    // Reset or carry over relevant stats
    this.stats.currentCombo = 0;
    this.stats.comboTimer = 0;

    // Spawn stage enemies
    let enemyId = 1;
    for (const espawn of stageData.enemySpawns) {
      this.enemies.push(createEnemy(enemyId++, espawn.type, espawn.x, espawn.y));
    }

    // Spawn stage pickups
    for (const p of stageData.pickups) {
      this.pickups.push({
        id: Date.now() + Math.random(),
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        type: p.type,
        value: p.value,
        life: 99999,
      });
    }

    // Spawn Boss if applicable
    if (stageData.hasBoss && stageData.bossSpawn) {
      this.enemies.push(createEnemy(999, 'boss_kurogane', stageData.bossSpawn.x, stageData.bossSpawn.y));
    }
  }

  public updateGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    // Standard Gamepad Mapping
    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;

    this.currentInput.left = axisX < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    this.currentInput.right = axisX > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    this.currentInput.up = axisY < -0.3 || (gp.buttons[12] && gp.buttons[12].pressed);
    this.currentInput.down = axisY > 0.3 || (gp.buttons[13] && gp.buttons[13].pressed);

    // Buttons: A / Cross = Jump, X / Square = Attack, LB/LT = Block, RB/RT = Dash, Y/Triangle = Shuriken, B/Circle = Ninjutsu
    this.currentInput.jump = Boolean(gp.buttons[0] && gp.buttons[0].pressed);
    this.currentInput.attack = Boolean(gp.buttons[2] && gp.buttons[2].pressed);
    this.currentInput.block = Boolean((gp.buttons[4] && gp.buttons[4].pressed) || (gp.buttons[6] && gp.buttons[6].pressed));
    this.currentInput.dash = Boolean((gp.buttons[5] && gp.buttons[5].pressed) || (gp.buttons[7] && gp.buttons[7].pressed));
    this.currentInput.shuriken = Boolean(gp.buttons[3] && gp.buttons[3].pressed);
    this.currentInput.ninjutsu = Boolean(gp.buttons[1] && gp.buttons[1].pressed);
  }

  private loop = (time: number) => {
    if (this.status !== 'menu' && this.status !== 'stage_clear' && this.status !== 'game_over' && this.status !== 'victory') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }

    if (this.status === 'paused') {
      this.lastTime = time;
      return;
    }

    // Fixed delta-time updates (~60fps)
    this.updateGamepad();

    // Check Hit-Stop Freeze Frame (Juicy impact delay)
    if (this.hitStopRemaining > 0) {
      this.hitStopRemaining--;
      // Render without physics updates
      this.renderer.render(
        this.stage,
        this.player,
        this.enemies,
        this.projectiles,
        this.pickups,
        this.particles,
        this.floatingTexts,
        this.stats,
        this.screenShake
      );
      return;
    }

    // Step physics & logic
    this.update();

    // Render
    this.renderer.render(
      this.stage,
      this.player,
      this.enemies,
      this.projectiles,
      this.pickups,
      this.particles,
      this.floatingTexts,
      this.stats,
      this.screenShake
    );

    // Copy prev input
    this.prevInput = { ...this.currentInput };
    this.lastTime = time;
  };

  private update() {
    this.stats.timeElapsed += 1 / 60;

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.3) this.screenShake = 0;
    }

    // Update moving platforms
    for (const plat of this.stage.platforms) {
      if (plat.moving && plat.startX !== undefined && plat.moveRangeX && plat.moveSpeedX) {
        plat.x += plat.moveSpeedX;
        if (plat.x > plat.startX + plat.moveRangeX) {
          plat.x = plat.startX + plat.moveRangeX;
          plat.moveSpeedX *= -1;
        } else if (plat.x < plat.startX) {
          plat.x = plat.startX;
          plat.moveSpeedX *= -1;
        }
      }
    }

    // Update Player
    updatePlayer(
      this.player,
      this.currentInput,
      this.prevInput,
      this.stage.platforms,
      this.projectiles,
      this.particles,
      this.floatingTexts,
      1
    );

    // Update Enemies
    for (const enemy of this.enemies) {
      updateEnemy(
        enemy,
        this.player,
        this.stage.platforms,
        this.projectiles,
        this.particles,
        this.floatingTexts,
        1
      );
    }

    // Handle Combat Collisions
    const combatRes = handleCombatInteractions(
      this.player,
      this.enemies,
      this.projectiles,
      this.pickups,
      this.particles,
      this.floatingTexts,
      this.stats
    );

    if (combatRes.hitStopFrames > 0) {
      this.hitStopRemaining = combatRes.hitStopFrames;
    }
    if (combatRes.screenShake > 0) {
      this.screenShake = Math.max(this.screenShake, combatRes.screenShake);
    }

    // Check Stage Goal or Boss Defeat
    if (this.mode === 'story') {
      if (this.stage.hasBoss) {
        const boss = this.enemies.find((e) => e.type === 'boss_kurogane');
        if (boss && boss.state === 'dead' && (boss.deathTimer ?? 0) <= 0) {
          this.setStatus('victory');
          soundEngine.stopMusic();
        }
      } else {
        // Reached stage extraction point
        if (Math.hypot(this.player.x - this.stage.goalX, this.player.y - this.stage.goalY) < 70) {
          this.setStatus('stage_clear');
          soundEngine.playPickup();
        }
      }
    } else {
      // Survival Mode wave escalation
      this.updateSurvivalLogic();
    }

    // Check Player Death
    if (this.player.health <= 0 || this.player.y > this.stage.height + 150) {
      this.setStatus('game_over');
      soundEngine.playHit(true);
      soundEngine.stopMusic();
    }

    // Notify UI of stats
    if (this.onStatsUpdate) {
      this.onStatsUpdate({ ...this.stats });
    }
  }

  private updateSurvivalLogic() {
    const aliveEnemies = this.enemies.filter((e) => e.state !== 'dead').length;

    if (aliveEnemies === 0) {
      this.waveSpawnTimer--;
      if (this.waveSpawnTimer <= 0) {
        this.survivalWave++;
        this.waveSpawnTimer = 60; // 1s breather

        this.floatingTexts.push({
          id: Math.random(),
          x: this.player.x,
          y: this.player.y - 70,
          text: `WAVE ${this.survivalWave} INCOMING!`,
          color: '#fbbf24',
          size: 24,
          life: 80,
          maxLife: 80,
          vy: -1,
          bold: true,
        });

        // Spawn escalating squad
        const waveCount = 2 + Math.min(this.survivalWave * 2, 10);
        for (let i = 0; i < waveCount; i++) {
          const spawnX = Math.random() > 0.5 ? 200 + Math.random() * 400 : 1600 + Math.random() * 400;
          const types: Array<'kage_ninja' | 'shinobi_marksman' | 'cyber_ronin' | 'kunoichi_glider'> = [
            'kage_ninja',
            'shinobi_marksman',
            'cyber_ronin',
            'kunoichi_glider',
          ];
          const type = types[Math.floor(Math.random() * types.length)];
          this.enemies.push(createEnemy(Date.now() + i, type, spawnX, 600));
        }

        // Drop a random supply capsule in center
        this.pickups.push({
          id: Date.now() + Math.random(),
          x: 1000 + (Math.random() - 0.5) * 300,
          y: 450,
          vx: 0,
          vy: 0,
          type: Math.random() < 0.5 ? 'health' : 'spirit',
          value: 40,
          life: 99999,
        });
      }
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    soundEngine.stopMusic();
  }
}
