import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Square } from 'lucide-react';
import { Direction } from '../types';

interface VirtualControlsProps {
  currentDirection: Direction;
  onDirectionChange: (dir: Direction) => void;
  onPauseToggle: () => void;
  isPaused: boolean;
  controllerType: 'DPAD' | 'SWIPE' | 'JOYSTICK' | 'HYBRID';
  vibrationEnabled: boolean;
}

export default function VirtualControls({
  currentDirection,
  onDirectionChange,
  onPauseToggle,
  isPaused,
  controllerType,
  vibrationEnabled,
}: VirtualControlsProps) {
  
  // Triggers a light touch vibration (haptic) if supported on Android browser
  const triggerHaptic = () => {
    if (vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handlePress = (dir: Direction) => {
    triggerHaptic();
    onDirectionChange(dir);
  };

  if (controllerType === 'SWIPE') {
    return (
      <div id="swipe-overlay-instructions" className="flex-1 flex flex-col items-center justify-center p-3 text-center">
        <div className="bg-black/30 rounded-xl p-4 border border-white/10 max-w-[280px]">
          <p className="text-xs text-zinc-300 font-mono leading-relaxed">
            👆 Swipe anywhere on the game board screen to steer the snake.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-sm font-mono">Swipe Up</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-sm font-mono">Swipe Down</span>
          </div>
        </div>
        <button
          id="swipe-pause-btn"
          onClick={() => { triggerHaptic(); onPauseToggle(); }}
          className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 text-zinc-200 text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2"
        >
          {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3 text-rose-400" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>
    );
  }

  // Classic Digital Cross D-Pad
  return (
    <div id="virtual-dpad-container" className="flex-1 flex flex-col justify-center items-center py-4 px-6 select-none bg-black/10">
      
      {/* Top action row containing control buttons */}
      <div className="w-full flex items-center justify-between mb-4 px-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider">CONTROLLER TYPE</span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">{controllerType === 'HYBRID' ? 'Hybrid (D-pad + Swipe)' : 'Arcade Cross'}</span>
        </div>
        <button
          id="dpad-pause-btn"
          onClick={() => { triggerHaptic(); onPauseToggle(); }}
          className="px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded-md flex items-center gap-1"
        >
          {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Square className="w-2.5 h-2.5 text-rose-400" />}
          <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>
      </div>

      {/* Grid cross d-pad layout */}
      <div id="arcade-cross-controller" className="relative w-44 h-44 flex items-center justify-center">
        
        {/* Center circle accent */}
        <div className="absolute w-12 h-12 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-center shadow-inner z-10 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800" />
        </div>

        {/* UP BUTTON */}
        <button
          id="btn-direction-up"
          onTouchStart={() => handlePress('UP')}
          onMouseDown={() => handlePress('UP')}
          className={`absolute top-0 w-14 h-16 bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500 rounded-t-2xl border-t border-x border-zinc-800 shadow-md flex items-center justify-center group transition-colors duration-75 ${
            currentDirection === 'UP' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'text-zinc-400'
          }`}
          aria-label="Up"
        >
          <ArrowUp className="w-6 h-6 transition-transform group-active:-translate-y-1" />
        </button>

        {/* LEFT BUTTON */}
        <button
          id="btn-direction-left"
          onTouchStart={() => handlePress('LEFT')}
          onMouseDown={() => handlePress('LEFT')}
          className={`absolute left-0 w-16 h-14 bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500 rounded-l-2xl border-l border-y border-zinc-800 shadow-md flex items-center justify-center group transition-colors duration-75 ${
            currentDirection === 'LEFT' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'text-zinc-400'
          }`}
          aria-label="Left"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-active:-translate-x-1" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          id="btn-direction-right"
          onTouchStart={() => handlePress('RIGHT')}
          onMouseDown={() => handlePress('RIGHT')}
          className={`absolute right-0 w-16 h-14 bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500 rounded-r-2xl border-r border-y border-zinc-800 shadow-md flex items-center justify-center group transition-colors duration-75 ${
            currentDirection === 'RIGHT' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'text-zinc-400'
          }`}
          aria-label="Right"
        >
          <ArrowRight className="w-6 h-6 transition-transform group-active:translate-x-1" />
        </button>

        {/* DOWN BUTTON */}
        <button
          id="btn-direction-down"
          onTouchStart={() => handlePress('DOWN')}
          onMouseDown={() => handlePress('DOWN')}
          className={`absolute bottom-0 w-14 h-16 bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500 rounded-b-2xl border-b border-x border-zinc-800 shadow-md flex items-center justify-center group transition-colors duration-75 ${
            currentDirection === 'DOWN' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'text-zinc-400'
          }`}
          aria-label="Down"
        >
          <ArrowDown className="w-6 h-6 transition-transform group-active:translate-y-1" />
        </button>

      </div>

      {controllerType === 'HYBRID' && (
        <span className="text-[9px] text-zinc-600 mt-2 font-mono tracking-wide">
          💡 YOU CAN ALSO SWIPE ON GAME SCREEN TO STEER
        </span>
      )}
    </div>
  );
}
