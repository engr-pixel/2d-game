import React from 'react';
import { Player, GameStats, StageData } from '../game/types';
import { Volume2, VolumeX, Pause, Shield, Zap, Flame, Disc } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface HUDProps {
  player: Player | null;
  stats: GameStats;
  stage: StageData | null;
  mode: 'story' | 'survival';
  survivalWave: number;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stats,
  stage,
  mode,
  survivalWave,
  onPause,
  isMuted,
  onToggleMute,
}) => {
  if (!player) return null;

  const hpPercent = Math.max(0, (player.health / player.maxHealth) * 100);
  const spiritPercent = Math.min(100, (player.spirit / player.maxSpirit) * 100);
  const isOverdriveReady = player.spirit >= 100;

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'SSS':
        return 'from-rose-500 via-amber-400 to-cyan-400 text-white animate-pulse';
      case 'SS':
        return 'from-amber-400 to-rose-500 text-amber-200';
      case 'S':
        return 'from-cyan-400 to-blue-500 text-cyan-200';
      case 'A':
        return 'from-emerald-400 to-teal-500 text-emerald-200';
      case 'B':
        return 'from-blue-400 to-indigo-500 text-blue-200';
      case 'C':
        return 'from-purple-400 to-pink-500 text-purple-200';
      default:
        return 'from-neutral-600 to-neutral-700 text-neutral-300';
    }
  };

  return (
    <div className="absolute inset-x-0 top-0 p-4 pointer-events-none select-none flex flex-col justify-between">
      {/* Top Bar: Vitality & Status */}
      <div className="flex items-start justify-between">
        {/* Left: Player Gauges */}
        <div className="flex flex-col gap-2 bg-neutral-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-lg shadow-cyan-950/40 w-72 md:w-80">
          {/* Ninja Name & Level Info */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              STRIDER // KAGE
            </span>
            <span className="text-neutral-400">
              {mode === 'story' ? `STAGE ${stage?.id ?? 1}` : `WAVE ${survivalWave}`}
            </span>
          </div>

          {/* Health Gauge */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-0.5">
              <span className="text-neutral-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400" /> VITALITY
              </span>
              <span className="text-cyan-300 font-bold">
                {Math.max(0, Math.round(player.health))} / {player.maxHealth}
              </span>
            </div>
            <div className="h-3.5 bg-neutral-900 border border-neutral-700 rounded-sm overflow-hidden relative">
              <div
                className={`h-full transition-all duration-150 ${
                  hpPercent > 35
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    : 'bg-gradient-to-r from-red-600 to-amber-500 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
              {/* Grid ticks */}
              <div className="absolute inset-0 flex justify-between px-2 opacity-25 pointer-events-none">
                <div className="w-px h-full bg-white" />
                <div className="w-px h-full bg-white" />
                <div className="w-px h-full bg-white" />
              </div>
            </div>
          </div>

          {/* Ninjutsu Spirit Gauge */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-0.5">
              <span className="text-neutral-300 flex items-center gap-1">
                <Flame className={`w-3 h-3 ${isOverdriveReady ? 'text-pink-400 animate-bounce' : 'text-neutral-400'}`} />
                NINJUTSU OVERDRIVE
              </span>
              <span className={`font-bold ${isOverdriveReady ? 'text-pink-400 animate-pulse' : 'text-neutral-400'}`}>
                {isOverdriveReady ? 'READY [R / U]' : `${Math.round(spiritPercent)}%`}
              </span>
            </div>
            <div className={`h-2.5 bg-neutral-900 border rounded-sm overflow-hidden relative ${
              isOverdriveReady ? 'border-pink-500 shadow-sm shadow-pink-500' : 'border-neutral-700'
            }`}>
              <div
                className={`h-full transition-all duration-150 ${
                  isOverdriveReady
                    ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300'
                    : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                }`}
                style={{ width: `${spiritPercent}%` }}
              />
            </div>
          </div>

          {/* Sub-weapons & Option Drone indicators */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-cyan-300 font-mono">
                <Disc className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>KUNAI: {player.shurikens}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-400 font-mono">OPTION DRONE:</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                player.hasDrone ? 'bg-purple-900/80 text-purple-300 border border-purple-500/50' : 'bg-neutral-800 text-neutral-500'
              }`}>
                {player.hasDrone ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Combo & Style Rank Meter */}
        {stats.currentCombo > 0 && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] font-['Orbitron']">
                {stats.currentCombo}
              </span>
              <span className="text-sm font-bold text-cyan-300 tracking-widest font-mono">
                HITS
              </span>
            </div>

            {/* Style Rank Badge */}
            <div className={`mt-1 px-4 py-1 rounded-md bg-gradient-to-r ${getRankColor(stats.styleRank)} shadow-lg font-black tracking-widest font-['Orbitron'] text-lg md:text-xl border border-white/20`}>
              {stats.styleRank}
            </div>

            {/* Combo Timer Decay Bar */}
            <div className="w-28 h-1 bg-neutral-900 rounded-full mt-2 overflow-hidden border border-neutral-700">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${(stats.comboTimer / 200) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Right: Score, Mission Objective & Controls */}
        <div className="flex items-start gap-3">
          <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-xl p-3 shadow-lg flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              SCORE
            </span>
            <span className="text-xl md:text-2xl font-black font-['Orbitron'] text-cyan-300 tracking-wider">
              {stats.score.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
              KILLS: <strong className="text-neutral-200">{stats.kills}</strong> | PARRIES: <strong className="text-amber-300">{stats.parries}</strong>
            </span>
          </div>

          {/* Interactive buttons */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={onToggleMute}
              className="p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition shadow"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>
            <button
              onClick={onPause}
              className="p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition shadow"
              title="Pause Game [Esc / P]"
            >
              <Pause className="w-5 h-5 text-neutral-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
