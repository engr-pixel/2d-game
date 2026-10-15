import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameStateStatus, GameStats } from './game/types';
import { InputState } from './game/player';
import { HUD } from './components/HUD';
import { VirtualControls } from './components/VirtualControls';
import { MenuOverlay } from './components/MenuOverlay';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { soundEngine } from './game/audio';
import { BladeStyle } from './api/client';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Crosshair } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStateStatus>('menu');
  const [selectedBladeId, setSelectedBladeId] = useState('cyan_plasma');
  const [stats, setStats] = useState<GameStats>({
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
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);

  // Detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouchControls(isTouch || window.innerWidth < 1024);
  }, []);

  // Initialize engine and canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.setCallbacks(
      (newStatus) => setGameStatus(newStatus),
      (newStats) => setStats(newStats)
    );

    // Responsive Canvas Resizing with high DPI support
    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Toggle Pause
      if (e.code === 'Escape' || e.code === 'KeyP') {
        engine.togglePause();
        return;
      }

      const input = engine.currentInput;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          input.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
          input.up = true;
          input.jump = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          input.down = true;
          break;
        case 'Space':
          input.jump = true;
          break;
        case 'KeyJ':
          input.attack = true;
          break;
        case 'KeyK':
        case 'ShiftLeft':
        case 'ShiftRight':
          input.block = true;
          break;
        case 'KeyL':
        case 'KeyE':
          input.dash = true;
          break;
        case 'KeyQ':
        case 'KeyU':
          input.shuriken = true;
          break;
        case 'KeyR':
        case 'KeyI':
          input.ninjutsu = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const input = engine.currentInput;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          input.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
          input.up = false;
          input.jump = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          input.down = false;
          break;
        case 'Space':
          input.jump = false;
          break;
        case 'KeyJ':
          input.attack = false;
          break;
        case 'KeyK':
        case 'ShiftLeft':
        case 'ShiftRight':
          input.block = false;
          break;
        case 'KeyL':
        case 'KeyE':
          input.dash = false;
          break;
        case 'KeyQ':
        case 'KeyU':
          input.shuriken = false;
          break;
        case 'KeyR':
        case 'KeyI':
          input.ninjutsu = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse click interactions on Canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const engine = engineRef.current;
    if (!engine || engine.status !== 'playing') return;

    if (e.button === 0) {
      // Left Click -> Sword Attack
      engine.currentInput.attack = true;
    } else if (e.button === 2) {
      // Right Click -> Block / Parry
      e.preventDefault();
      engine.currentInput.block = true;
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (e.button === 0) {
      engine.currentInput.attack = false;
    } else if (e.button === 2) {
      e.preventDefault();
      engine.currentInput.block = false;
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Handlers for virtual buttons
  const handleVirtualButtonDown = (key: keyof InputState) => {
    if (engineRef.current) {
      engineRef.current.currentInput[key] = true;
    }
  };

  const handleVirtualButtonUp = (key: keyof InputState) => {
    if (engineRef.current) {
      engineRef.current.currentInput[key] = false;
    }
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* Primary 2D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        className="block w-full h-full cursor-crosshair"
      />

      {/* Head-Up Display (HUD) */}
      {gameStatus === 'playing' && engineRef.current && (
        <HUD
          player={engineRef.current.player}
          stats={stats}
          stage={engineRef.current.stage}
          mode={engineRef.current.mode}
          survivalWave={engineRef.current.survivalWave}
          onPause={() => engineRef.current?.togglePause()}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Touch / Virtual Controls on Mobile or Toggle */}
      {gameStatus === 'playing' && showTouchControls && engineRef.current && (
        <VirtualControls
          input={engineRef.current.currentInput}
          onButtonDown={handleVirtualButtonDown}
          onButtonUp={handleVirtualButtonUp}
        />
      )}

      {/* Main Menu Overlay */}
      {gameStatus === 'menu' && (
        <MenuOverlay
          onStartStory={() => engineRef.current?.startStory(0)}
          onStartSurvival={() => engineRef.current?.startSurvival()}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          selectedBladeId={selectedBladeId}
          onSelectBlade={(blade) => {
            setSelectedBladeId(blade.id);
            engineRef.current?.setBladeStyle(blade.color, blade.secondaryColor);
          }}
        />
      )}

      {/* Pause Menu Modal */}
      {gameStatus === 'paused' && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="bg-neutral-900 border border-cyan-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black font-['Orbitron'] text-cyan-300 tracking-wider mb-2">
              MISSION PAUSED
            </h2>
            <p className="text-xs font-mono text-neutral-400 mb-6">
              Neural sync suspended. Take a breath, Strider.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => engineRef.current?.togglePause()}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> RESUME MISSION [ESC]
              </button>

              <button
                onClick={() => engineRef.current?.restartCurrentStage()}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> RESTART STAGE
              </button>

              <button
                onClick={() => setGameStatus('menu')}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold font-['Orbitron'] text-xs tracking-wider transition cursor-pointer"
              >
                ABORT TO MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      <VictoryDefeatModal
        status={gameStatus}
        stats={stats}
        currentStageIndex={engineRef.current?.currentStageIndex ?? 0}
        totalStages={3}
        onNextStage={() => engineRef.current?.nextStage()}
        onRestart={() => engineRef.current?.restartCurrentStage()}
        onMainMenu={() => setGameStatus('menu')}
      />

      {/* Desktop Touch Controls Toggle button in bottom-right */}
      {gameStatus === 'playing' && !showTouchControls && (
        <button
          onClick={() => setShowTouchControls(true)}
          className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-1 rounded bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 transition"
        >
          Enable On-Screen Buttons
        </button>
      )}
    </div>
  );
}
