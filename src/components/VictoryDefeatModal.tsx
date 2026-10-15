import React, { useState } from 'react';
import { GameStats, GameStateStatus } from '../game/types';
import { Trophy, Skull, RotateCcw, ArrowRight, Home, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { submitScoreToLeaderboard, recordCombatStats } from '../api/client';

interface VictoryDefeatModalProps {
  status: GameStateStatus;
  stats: GameStats;
  currentStageIndex: number;
  totalStages: number;
  onNextStage: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  status,
  stats,
  currentStageIndex,
  totalStages,
  onNextStage,
  onRestart,
  onMainMenu,
}) => {
  const [callsign, setCallsign] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);

  if (status !== 'stage_clear' && status !== 'game_over' && status !== 'victory') {
    return null;
  }

  const isWin = status === 'stage_clear' || status === 'victory';
  const isFinalVictory = status === 'victory';

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await submitScoreToLeaderboard({
      callsign: callsign.trim().toUpperCase(),
      score: stats.score,
      styleRank: stats.styleRank,
      kills: stats.kills,
      parries: stats.parries,
      maxCombo: stats.maxCombo,
      mode: 'story',
      stageOrWave: isFinalVictory ? 'Citadel Clear' : `Stage ${currentStageIndex + 1}`,
    });

    // Record combat telemetry
    await recordCombatStats({
      kills: stats.kills,
      parries: stats.parries,
      missionCleared: isWin,
      bossDefeated: isFinalVictory,
    });

    setIsSubmitting(false);
    if (res.success && res.rank) {
      setSubmittedRank(res.rank);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in zoom-in duration-200">
      <div className={`max-w-md w-full rounded-2xl border p-6 text-center shadow-2xl relative overflow-hidden ${
        isWin
          ? 'bg-neutral-900 border-cyan-500/50 shadow-cyan-500/20'
          : 'bg-neutral-900 border-red-500/50 shadow-red-500/20'
      }`}>
        {/* Glow backdrop */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isWin ? 'bg-cyan-500/20' : 'bg-red-500/20'
        }`} />

        {/* Icon & Title */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border shadow-lg ${
            isWin ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-red-950 border-red-500 text-red-400'
          }`}>
            {isWin ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-['Orbitron'] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            {isFinalVictory
              ? 'CITADEL LIBERATED'
              : status === 'stage_clear'
              ? 'PERIMETER BREACHED'
              : 'SHINOBI FALLEN'}
          </h2>

          <p className="text-xs font-mono text-neutral-400 mt-1">
            {isFinalVictory
              ? 'Grandmaster Kurogane has been severed. Neo-Kyoto belongs to the shadows.'
              : status === 'stage_clear'
              ? 'Extraction point secured. Proceeding to next sector.'
              : 'Your cybernetic chassis was destroyed. Regroup and strike again.'}
          </p>

          {/* Style Rank & Score */}
          <div className="my-4 w-full bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-neutral-400">STYLE RANK:</span>
              <span className="text-2xl font-black font-['Orbitron'] text-cyan-400 tracking-wider">
                {stats.styleRank}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono py-1 border-t border-neutral-900">
              <span className="text-neutral-400">SCORE:</span>
              <span className="font-bold text-white font-['Orbitron']">{stats.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono py-1 border-t border-neutral-900">
              <span className="text-neutral-400">ENEMIES SLICED:</span>
              <span className="font-bold text-cyan-300">{stats.kills}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono py-1 border-t border-neutral-900">
              <span className="text-neutral-400">PERFECT PARRIES:</span>
              <span className="font-bold text-amber-300">{stats.parries}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono py-1 border-t border-neutral-900">
              <span className="text-neutral-400">MAX COMBO:</span>
              <span className="font-bold text-pink-400">{stats.maxCombo} HITS</span>
            </div>
          </div>

          {/* Leaderboard Submission Form */}
          {submittedRank === null ? (
            <form onSubmit={handleSubmitScore} className="w-full mb-4 flex gap-2">
              <input
                type="text"
                placeholder="ENTER CALLSIGN (e.g. KAGE-77)"
                maxLength={14}
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!callsign.trim() || isSubmitting}
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                SUBMIT
              </button>
            </form>
          ) : (
            <div className="w-full mb-4 py-2 px-3 rounded-lg bg-amber-950/40 border border-amber-500/50 flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>RECORDED! GLOBAL RANK: <strong>#{submittedRank}</strong></span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {status === 'stage_clear' ? (
              <button
                onClick={onNextStage}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition cursor-pointer"
              >
                NEXT STAGE <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> TRY AGAIN
              </button>
            )}

            <button
              onClick={onMainMenu}
              className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold font-['Orbitron'] text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Home className="w-4 h-4" /> MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
