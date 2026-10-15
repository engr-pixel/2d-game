import React from 'react';
import { InputState } from '../game/player';
import { Sword, Shield, Zap, ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Disc, Flame } from 'lucide-react';

interface VirtualControlsProps {
  input: InputState;
  onButtonDown: (key: keyof InputState) => void;
  onButtonUp: (key: keyof InputState) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  input,
  onButtonDown,
  onButtonUp,
}) => {
  const handleTouch = (key: keyof InputState, active: boolean) => {
    if (active) onButtonDown(key);
    else onButtonUp(key);
  };

  return (
    <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between items-end pointer-events-none select-none z-20 md:opacity-85 hover:opacity-100 transition-opacity">
      {/* Left: Directional D-Pad */}
      <div className="pointer-events-auto bg-neutral-950/60 backdrop-blur-md p-2 rounded-2xl border border-neutral-800/80 shadow-2xl">
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
          <div />
          {/* UP (Jump) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('jump', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('jump', false); }}
            onMouseDown={() => handleTouch('jump', true)}
            onMouseUp={() => handleTouch('jump', false)}
            className={`flex items-center justify-center rounded-xl border border-neutral-700 active:scale-95 transition ${
              input.jump ? 'bg-cyan-500/40 text-cyan-300 border-cyan-400' : 'bg-neutral-900/80 text-neutral-300'
            }`}
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          {/* LEFT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('left', false); }}
            onMouseDown={() => handleTouch('left', true)}
            onMouseUp={() => handleTouch('left', false)}
            className={`flex items-center justify-center rounded-xl border border-neutral-700 active:scale-95 transition ${
              input.left ? 'bg-cyan-500/40 text-cyan-300 border-cyan-400' : 'bg-neutral-900/80 text-neutral-300'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Center Hub */}
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-500/40" />
          </div>

          {/* RIGHT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('right', false); }}
            onMouseDown={() => handleTouch('right', true)}
            onMouseUp={() => handleTouch('right', false)}
            className={`flex items-center justify-center rounded-xl border border-neutral-700 active:scale-95 transition ${
              input.right ? 'bg-cyan-500/40 text-cyan-300 border-cyan-400' : 'bg-neutral-900/80 text-neutral-300'
            }`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <div />
          {/* DOWN (Crouch / Slide) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('down', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('down', false); }}
            onMouseDown={() => handleTouch('down', true)}
            onMouseUp={() => handleTouch('down', false)}
            className={`flex items-center justify-center rounded-xl border border-neutral-700 active:scale-95 transition ${
              input.down ? 'bg-cyan-500/40 text-cyan-300 border-cyan-400' : 'bg-neutral-900/80 text-neutral-300'
            }`}
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="pointer-events-auto flex items-end gap-3 bg-neutral-950/60 backdrop-blur-md p-2 rounded-2xl border border-neutral-800/80 shadow-2xl">
        {/* Sub-Actions Column */}
        <div className="flex flex-col gap-2">
          {/* Ninjutsu Overdrive */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('ninjutsu', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('ninjutsu', false); }}
            onMouseDown={() => handleTouch('ninjutsu', true)}
            onMouseUp={() => handleTouch('ninjutsu', false)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition shadow active:scale-95 ${
              input.ninjutsu
                ? 'bg-pink-600 text-white border-pink-400 shadow-pink-500/50'
                : 'bg-neutral-900/90 text-pink-400 border-pink-900/60'
            }`}
            title="Ninjutsu Overdrive [U / R]"
          >
            <Flame className="w-6 h-6" />
          </button>

          {/* Kunai / Shuriken */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('shuriken', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('shuriken', false); }}
            onMouseDown={() => handleTouch('shuriken', true)}
            onMouseUp={() => handleTouch('shuriken', false)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition shadow active:scale-95 ${
              input.shuriken
                ? 'bg-cyan-600 text-white border-cyan-400'
                : 'bg-neutral-900/90 text-cyan-400 border-neutral-700'
            }`}
            title="Throw Kunai [Q / U]"
          >
            <Disc className="w-6 h-6" />
          </button>
        </div>

        {/* Primary Combat Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* BLOCK / PARRY */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('block', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('block', false); }}
            onMouseDown={() => handleTouch('block', true)}
            onMouseUp={() => handleTouch('block', false)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition shadow active:scale-95 ${
              input.block
                ? 'bg-amber-500 text-black border-amber-300 shadow-amber-500/50'
                : 'bg-neutral-900/90 text-amber-400 border-amber-500/40 hover:bg-neutral-800'
            }`}
            title="Block / Perfect Parry [K / Shift]"
          >
            <Shield className="w-6 h-6" />
            <span className="text-[9px] font-bold font-mono uppercase mt-0.5">PARRY</span>
          </button>

          {/* DASH / SLIDE */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('dash', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('dash', false); }}
            onMouseDown={() => handleTouch('dash', true)}
            onMouseUp={() => handleTouch('dash', false)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition shadow active:scale-95 ${
              input.dash
                ? 'bg-purple-600 text-white border-purple-300'
                : 'bg-neutral-900/90 text-purple-400 border-purple-500/40 hover:bg-neutral-800'
            }`}
            title="Cyber Dash [L / E]"
          >
            <Zap className="w-6 h-6" />
            <span className="text-[9px] font-bold font-mono uppercase mt-0.5">DASH</span>
          </button>

          {/* JUMP */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('jump', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('jump', false); }}
            onMouseDown={() => handleTouch('jump', true)}
            onMouseUp={() => handleTouch('jump', false)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition shadow active:scale-95 ${
              input.jump
                ? 'bg-cyan-500 text-black border-cyan-300'
                : 'bg-neutral-900/90 text-cyan-400 border-cyan-500/40 hover:bg-neutral-800'
            }`}
            title="Jump / Double Jump [Space / W]"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[9px] font-bold font-mono uppercase mt-0.5">JUMP</span>
          </button>

          {/* SWORD ATTACK (Cypher Combo) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouch('attack', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouch('attack', false); }}
            onMouseDown={() => handleTouch('attack', true)}
            onMouseUp={() => handleTouch('attack', false)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition shadow active:scale-95 ${
              input.attack
                ? 'bg-rose-500 text-white border-rose-300 shadow-rose-500/50'
                : 'bg-neutral-900/90 text-rose-400 border-rose-500/40 hover:bg-neutral-800'
            }`}
            title="Cypher Slash [J / Click]"
          >
            <Sword className="w-6 h-6" />
            <span className="text-[9px] font-bold font-mono uppercase mt-0.5">SLASH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
