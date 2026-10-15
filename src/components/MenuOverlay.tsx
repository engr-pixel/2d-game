import React, { useState, useEffect } from 'react';
import { Play, Flame, HelpCircle, Shield, Sword, Zap, Disc, Volume2, VolumeX, Trophy, FileText, Palette, Globe2, Loader2, Check } from 'lucide-react';
import { fetchLeaderboard, fetchGlobalStats, fetchMissions, fetchBladeStyles, LeaderboardEntry, GlobalStats, MissionIntel, BladeStyle } from '../api/client';

interface MenuOverlayProps {
  onStartStory: () => void;
  onStartSurvival: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedBladeId: string;
  onSelectBlade: (blade: BladeStyle) => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  onStartStory,
  onStartSurvival,
  isMuted,
  onToggleMute,
  selectedBladeId,
  onSelectBlade,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'dojo' | 'leaderboard' | 'forge' | 'intel'>('main');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [missions, setMissions] = useState<MissionIntel[]>([]);
  const [bladeStyles, setBladeStyles] = useState<BladeStyle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial telemetry and customization options
  useEffect(() => {
    fetchGlobalStats().then((stats) => setGlobalStats(stats));
    fetchBladeStyles().then((styles) => setBladeStyles(styles));
  }, []);

  const openLeaderboard = async () => {
    setActiveTab('leaderboard');
    setIsLoading(true);
    const data = await fetchLeaderboard();
    setLeaderboard(data);
    setIsLoading(false);
  };

  const openIntel = async () => {
    setActiveTab('intel');
    if (missions.length === 0) {
      setIsLoading(true);
      const data = await fetchMissions();
      setMissions(data);
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 select-none z-30 overflow-y-auto">
      {/* Background Cyber Torii & Kanji Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 flex items-center justify-center">
        <div className="text-[200px] md:text-[320px] font-black text-rose-500 font-['Yuji_Syuku'] tracking-tighter">
          忍
        </div>
      </div>

      {/* Global Community Telemetry Bar */}
      {globalStats && (
        <div className="relative z-10 w-full max-w-2xl bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 mb-6 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>GLOBAL SHINOBI TELEMETRY</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ENEMIES SEVERED: <strong className="text-white">{globalStats.totalKillsWorldwide.toLocaleString()}</strong></span>
            <span>PARRIES DEFLECTED: <strong className="text-amber-400">{globalStats.totalParriesWorldwide.toLocaleString()}</strong></span>
            <span>KUROGANE DEFEATS: <strong className="text-rose-400">{globalStats.kuroganeDefeats.toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      {/* Title Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          NEO-EDO 2099 // ARCADE ACTION
        </div>

        <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">
          STRIDER
        </h1>
        <div className="text-xl sm:text-3xl font-bold tracking-[0.25em] text-neutral-200 font-['Orbitron'] mt-1">
          SHINOBI PROTOCOL
        </div>

        <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md">
          Execute high-velocity plasma Cypher strikes, deflect enemy projectiles with precision parries, and scale neo-feudal rooftops to eliminate Mecha-Daimyo Kurogane.
        </p>
      </div>

      {/* Navigation & Mode Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onStartStory}
          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-wider font-['Orbitron'] text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          STORY MISSION
        </button>

        <button
          onClick={onStartSurvival}
          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black tracking-wider font-['Orbitron'] text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 active:scale-95 transition cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-current" />
          ENDLESS GAUNTLET
        </button>
      </div>

      {/* Secondary Feature Tabs */}
      <div className="relative z-10 flex flex-wrap justify-center items-center gap-2 mt-4 max-w-xl">
        <button
          onClick={openLeaderboard}
          className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          LEADERBOARDS
        </button>

        <button
          onClick={() => setActiveTab('forge')}
          className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          CYPHER FORGE
        </button>

        <button
          onClick={openIntel}
          className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          MISSION INTEL
        </button>

        <button
          onClick={() => setActiveTab('dojo')}
          className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          HOW TO PLAY
        </button>

        <button
          onClick={onToggleMute}
          className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          {isMuted ? 'MUTED' : 'SYNTH BGM'}
        </button>
      </div>

      {/* Quick Controls Cheat Sheet */}
      <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg text-[10px] font-mono text-neutral-400">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded px-2.5 py-1 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300 font-bold border border-neutral-700">J / Click</kbd>
          <span>Sword Combo</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded px-2.5 py-1 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-bold border border-neutral-700">K / Shift</kbd>
          <span>Block / Parry</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded px-2.5 py-1 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-purple-300 font-bold border border-neutral-700">L / E</kbd>
          <span>Dash / Slide</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded px-2.5 py-1 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-pink-300 font-bold border border-neutral-700">U / R</kbd>
          <span>Ninjutsu</span>
        </div>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. LEADERBOARDS MODAL */}
      {activeTab === 'leaderboard' && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 text-white max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h2 className="text-xl font-bold font-['Orbitron'] text-amber-300 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                GLOBAL SHINOBI RANKINGS
              </h2>
              <button
                onClick={() => setActiveTab('main')}
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 font-mono gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Connecting to Shinobi Network...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-12 text-[10px] font-mono text-neutral-400 px-3 py-1 uppercase tracking-wider">
                    <span className="col-span-1">#</span>
                    <span className="col-span-4">Callsign</span>
                    <span className="col-span-2 text-center">Style</span>
                    <span className="col-span-2 text-center">Hits</span>
                    <span className="col-span-3 text-right">Score</span>
                  </div>

                  {leaderboard.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-lg border text-xs font-mono ${
                        idx === 0
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : idx === 1
                          ? 'bg-neutral-800/80 border-cyan-500/30 text-cyan-200'
                          : idx === 2
                          ? 'bg-neutral-800/80 border-rose-500/30 text-rose-200'
                          : 'bg-neutral-950/70 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span className="col-span-1 font-bold text-neutral-400">{idx + 1}</span>
                      <span className="col-span-4 font-bold tracking-wide truncate">{item.callsign}</span>
                      <span className="col-span-2 text-center font-bold text-amber-300">{item.styleRank}</span>
                      <span className="col-span-2 text-center text-neutral-400">{item.maxCombo} max</span>
                      <span className="col-span-3 text-right font-bold font-['Orbitron'] text-white">
                        {item.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 text-center">
              <span className="text-[11px] font-mono text-neutral-400">
                Scores sync automatically after every mission clear or defeat.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CYPHER FORGE (BLADE CUSTOMIZATION) MODAL */}
      {activeTab === 'forge' && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-pink-500/40 rounded-2xl max-w-xl w-full p-6 text-white max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h2 className="text-xl font-bold font-['Orbitron'] text-pink-300 flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-400" />
                CYPHER FORGE // BLADE CALIBRATION
              </h2>
              <button
                onClick={() => setActiveTab('main')}
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-400 mt-3 mb-4">
              Select your plasma conduit frequency. Changes in-game blade slash colors, glowing trail afterimages, and energy arcs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
              {bladeStyles.map((style) => {
                const isSelected = selectedBladeId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => onSelectBlade(style)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-2 shadow-lg'
                        : 'bg-neutral-950/70 border-neutral-800 hover:bg-neutral-800/60'
                    }`}
                    style={{ borderColor: isSelected ? style.color : undefined }}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs font-mono text-white flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: style.color, boxShadow: `0 0 8px ${style.color}` }}
                          />
                          {style.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 leading-snug">
                        {style.description}
                      </p>
                    </div>

                    {/* Blade Color Bar Preview */}
                    <div
                      className="h-2 rounded-full mt-3 w-full"
                      style={{
                        background: `linear-gradient(90deg, ${style.color}, ${style.secondaryColor}, #ffffff)`,
                        boxShadow: `0 0 6px ${style.color}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveTab('main')}
                className="py-2 px-5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                EQUIP & RETURN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MISSION INTEL DOSSIERS MODAL */}
      {activeTab === 'intel' && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 text-white max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h2 className="text-xl font-bold font-['Orbitron'] text-purple-300 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                SECTOR MISSION DOSSIERS
              </h2>
              <button
                onClick={() => setActiveTab('main')}
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-3">
              {missions.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-purple-300 text-sm font-['Orbitron']">{m.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.threatLevel === 'EXTREME'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : m.threatLevel === 'SEVERE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      THREAT: {m.threatLevel}
                    </span>
                  </div>

                  <p className="text-neutral-300 mb-2"><strong>Objective:</strong> {m.objective}</p>

                  <div className="mb-2">
                    <span className="text-neutral-400">Hostiles: </span>
                    {m.primaryThreats.map((t, idx) => (
                      <span key={idx} className="inline-block px-1.5 py-0.5 mr-1 mb-1 bg-neutral-800 rounded text-[10px] text-neutral-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] italic">
                    <strong>Tactical Intel:</strong> {m.intel}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('main')}
                className="py-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                ACKNOWLEDGE BRIEFING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHINOBI DOJO (HOW TO PLAY) MODAL */}
      {activeTab === 'dojo' && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-150">
          <div className="bg-neutral-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 text-white max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
              <h2 className="text-xl font-bold font-['Orbitron'] text-cyan-300 flex items-center gap-2">
                <Sword className="w-5 h-5 text-cyan-400" />
                SHINOBI DOJO // COMBAT MANUAL
              </h2>
              <button
                onClick={() => setActiveTab('main')}
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
              {/* Move 1: Cypher Combos */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <Sword className="w-4 h-4" /> 3-HIT CYPHER COMBO
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Press <strong>J / Click</strong> rapidly. Hit 1 is an upward arc, Hit 2 sweeps horizontally, and Hit 3 unleashes a full 360 whirlwind sending a forward plasma shockwave wave! Slices enemy projectiles in mid-air.
                </p>
              </div>

              {/* Move 2: Perfect Parry */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Shield className="w-4 h-4" /> PERFECT PARRY & DEFLECT
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Hold <strong>K / Shift</strong> to block (reduces damage by 75%). Timing a block right as an attack lands triggers <strong>PERFECT PARRY</strong>: deflects kunai back at enemies with 2x damage and staggers armored Ronin!
                </p>
              </div>

              {/* Move 3: Wall Parkour */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <Zap className="w-4 h-4" /> WALL CLING & WALL JUMP
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Hold against any vertical wall or neon conduit to cling and slide down slowly. Tap <strong>Space / W</strong> while clinging to execute Strider's high-angle wall kick!
                </p>
              </div>

              {/* Move 4: Crouch Slide */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <Zap className="w-4 h-4" /> CROUCH SLIDE KICK
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Hold <strong>S / Down</strong> and press <strong>Dash (L / E)</strong>. Lowers your profile to slip directly underneath flying projectiles and trip up armored Cyber Ronin from behind.
                </p>
              </div>

              {/* Move 5: Ninjutsu Ryu-Jin */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-pink-500/30">
                <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                  <Flame className="w-4 h-4" /> 忍法: 龍神斬 (RYU-JIN OVERDRIVE)
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Slash enemies and perform parries to charge your Ninjutsu gauge to 100%. Press <strong>U / R</strong> to summon a colossal plasma dragon wave that cleanses the screen!
                </p>
              </div>

              {/* Move 6: Option Drone Satellite */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                  <Disc className="w-4 h-4" /> OPTION DRONE SATELLITE
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Collect purple Drone capsules. The robotic satellite orbits you and automatically fires rapid laser bolts at nearby enemies.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveTab('main')}
                className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold transition cursor-pointer"
              >
                GOT IT, ENTER THE ROOFTOPS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
