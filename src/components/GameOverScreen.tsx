import React, { useState, useEffect } from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { GameMode, Theme } from '../types';

interface GameOverScreenProps {
  score: number;
  mode: GameMode;
  onRestart: () => void;
  onGoHome: () => void;
  onSaveScore: (name: string) => void;
  theme: Theme;
}

export default function GameOverScreen({
  score,
  mode,
  onRestart,
  onGoHome,
  onSaveScore,
  theme,
}: GameOverScreenProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Grab last saved name for convenience
    if (typeof window !== 'undefined') {
      const last = localStorage.getItem('android_snake_last_name');
      if (last) {
        setName(last);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Save locally
    if (typeof window !== 'undefined') {
      localStorage.setItem('android_snake_last_name', name.trim().toUpperCase());
    }

    onSaveScore(name);
    setSaved(true);
  };

  return (
    <div id="game-over-screen" className="flex-1 flex flex-col justify-between p-6 overflow-y-auto select-none">
      
      {/* Title */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-black text-rose-500 uppercase font-mono tracking-widest animate-pulse border-y border-rose-500/20 py-2">
          CRASHED!
        </h2>
        <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
          Snake terminal deactivated
        </p>
      </div>

      {/* Score metrics */}
      <div className="flex flex-col items-center my-4">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">FINAL SCORE</span>
        <span className={`text-5xl font-black font-mono tracking-tight my-1 ${theme.accentTextClass} animate-bounce`}>
          {score}
        </span>
        <div className="flex items-center gap-1.5 mt-1 bg-zinc-950/40 px-3 py-1 rounded-full border border-zinc-900">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase">MODE: {mode}</span>
        </div>
      </div>

      {/* Save High Score Form */}
      <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 my-2 text-left">
        {saved ? (
          <div className="text-center py-4 flex flex-col items-center">
            <Trophy className="w-6 h-6 text-yellow-400 animate-pulse mb-1" />
            <span className="text-xs font-semibold font-mono text-emerald-400 uppercase">SCORE SAVED SUCCESSFULLY!</span>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Check the rankings to see where you sit.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
              Record Nickname (3-10 Chars)
            </label>
            <div className="flex gap-2">
              <input
                id="input-player-name"
                type="text"
                maxLength={10}
                required
                placeholder="PLAYER"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 outline-none text-white text-xs font-mono font-bold uppercase rounded-xl px-3 py-2"
              />
              <button
                id="btn-save-score"
                type="submit"
                className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all active:scale-95 flex items-center gap-1 ${theme.buttonStyle}`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Replay action buttons */}
      <div className="flex flex-col gap-2.5 pb-6">
        <button
          id="btn-restart-game"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all text-xs uppercase font-mono tracking-wide shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Quick Restart</span>
        </button>

        <button
          id="btn-gameover-home"
          onClick={onGoHome}
          className={`w-full py-3 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase font-mono tracking-wide ${theme.buttonStyle}`}
        >
          <Home className="w-4 h-4" />
          <span>Exit to Menu</span>
        </button>
      </div>

    </div>
  );
}
