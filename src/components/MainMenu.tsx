import React from 'react';
import { Play, Settings, Trophy, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { GameMode, SpeedLevel, Theme, GameSettings } from '../types';

interface MainMenuProps {
  onStartGame: () => void;
  onNavigate: (screen: 'SETTINGS' | 'HIGHSCORES') => void;
  settings: GameSettings;
  currentTheme: Theme;
}

export default function MainMenu({ onStartGame, onNavigate, settings, currentTheme }: MainMenuProps) {
  
  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'CLASSIC': return 'Classic Nokia';
      case 'OBSTACLES': return 'Brick Obstacles';
      case 'TIMETRIAL': return 'Time Trial Chase';
      case 'PORTAL': return 'Quantum Portal';
    }
  };

  const getModeDesc = (mode: GameMode) => {
    switch (mode) {
      case 'CLASSIC': return 'No walls, infinite looping field bounds.';
      case 'OBSTACLES': return 'Avoid hard brick walls placed inside the grid.';
      case 'TIMETRIAL': return 'Clock ticking! Eat food to extend your countdown.';
      case 'PORTAL': return 'Portals appear! Enter one to teleport instantly.';
    }
  };

  return (
    <div id="game-main-menu" className="flex-1 flex flex-col justify-between p-6">
      
      {/* Upper Logo / Brand section */}
      <div className="flex flex-col items-center text-center pt-8">
        <div className="relative mb-2 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
          <Flame className="w-12 h-12 text-emerald-400 animate-pulse mr-1" />
          <span className="text-4xl font-black tracking-tightest uppercase font-mono">
            SNAKE
          </span>
          <span className={`text-4xl font-extrabold uppercase font-mono ml-1 ${currentTheme.accentTextClass}`}>
            OS
          </span>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
          Virtual Android Arcade Game
        </p>
      </div>

      {/* Selected configuration summary card */}
      <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-4 my-2 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-zinc-500 font-mono tracking-wider">ACTIVE MODE</span>
            <span className="text-xs font-semibold text-zinc-200">{getModeLabel(settings.mode)}</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed text-left border-l border-zinc-800 pl-3">
          {getModeDesc(settings.mode)}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-zinc-900/60 text-left">
          <div>
            <span className="text-[8px] text-zinc-500 font-mono block">SPEED LEVEL</span>
            <span className={`text-[10px] font-bold font-mono uppercase ${currentTheme.accentTextClass}`}>
              {settings.speed}
            </span>
          </div>
          <div>
            <span className="text-[8px] text-zinc-500 font-mono block">THEME SKIN</span>
            <span className="text-[10px] font-semibold text-zinc-300 font-mono">
              {currentTheme.name}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Menu */}
      <div className="flex flex-col gap-3 pb-8">
        <button
          id="btn-play-game"
          onClick={onStartGame}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 text-sm uppercase tracking-wider ${
            themeStylesForPlayButton(currentTheme.id)
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Game</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-nav-settings"
            onClick={() => onNavigate('SETTINGS')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-wide ${currentTheme.buttonStyle}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            id="btn-nav-highscores"
            onClick={() => onNavigate('HIGHSCORES')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-wide ${currentTheme.buttonStyle}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Scores</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// Utility styling switcher for the Play Button based on theme
function themeStylesForPlayButton(themeId: string): string {
  switch (themeId) {
    case 'NOKIA_CLASSIC':
      return 'bg-[#1c2415] text-[#c9d4ba] border-2 border-[#1c2415] hover:bg-transparent hover:text-[#1c2415]';
    case 'CYBERPUNK':
      return 'bg-yellow-400 text-slate-950 font-black shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-yellow-300';
    case 'CANDY':
      return 'bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold shadow-md hover:from-pink-500 hover:to-rose-500';
    case 'CANDY_MINT':
      return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold shadow-md hover:from-emerald-500 hover:to-teal-600';
    case 'CANDY_LEMON':
      return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-bold shadow-md hover:from-yellow-500 hover:to-amber-600';
    case 'JUNGLE':
      return 'bg-lime-500 text-emerald-950 font-bold shadow-md hover:bg-lime-400';
    case 'JUNGLE_NIGHT':
      return 'bg-gradient-to-r from-teal-400 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/40 hover:from-teal-300 hover:to-indigo-500';
    default: // RETRO_ARCADE
      return 'bg-emerald-400 text-zinc-950 font-extrabold shadow-[0_0_15px_rgba(52,211,153,0.4)] hover:bg-emerald-300';
  }
}
