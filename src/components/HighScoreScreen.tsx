import React, { useState } from 'react';
import { ArrowLeft, Trophy, Trash2, Calendar, Star } from 'lucide-react';
import { Score, GameMode, Theme } from '../types';
import { getHighScores } from '../utils/highscores';

interface HighScoreScreenProps {
  scores: Score[];
  onBack: () => void;
  onClearScores: () => void;
  theme: Theme;
}

export default function HighScoreScreen({ scores, onBack, onClearScores, theme }: HighScoreScreenProps) {
  const [filterMode, setFilterMode] = useState<GameMode | 'ALL'>('ALL');

  const filtered = scores
    .filter(s => filterMode === 'ALL' || s.mode === filterMode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // show top 10

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all high scores? This action cannot be undone.')) {
      onClearScores();
    }
  };

  const modes: (GameMode | 'ALL')[] = ['ALL', 'CLASSIC', 'OBSTACLES', 'PORTAL', 'TIMETRIAL'];

  const getModeLabel = (m: GameMode | 'ALL') => {
    if (m === 'ALL') return 'ALL';
    if (m === 'TIMETRIAL') return 'TIME';
    return m;
  };

  return (
    <div id="game-highscore-screen" className="flex-1 flex flex-col p-5 overflow-y-auto max-h-[700px] select-none text-left">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          id="btn-highscores-back"
          onClick={onBack}
          className={`p-2 rounded-xl transition-all active:scale-90 ${theme.buttonStyle}`}
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold font-mono tracking-wider uppercase flex-1 text-left flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Hall of Fame</span>
        </h2>
        {scores.length > 0 && (
          <button
            id="btn-clear-scores"
            onClick={handleClear}
            className="p-2 text-zinc-500 hover:text-rose-400 active:scale-95 transition-all"
            title="Clear all scores"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modes Quick Filter */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`py-1 px-3 rounded-full text-[9px] font-mono font-bold transition-all whitespace-nowrap ${
              filterMode === m
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-950/20 text-zinc-400 border border-zinc-800/60 hover:text-zinc-200'
            }`}
          >
            {getModeLabel(m)}
          </button>
        ))}
      </div>

      {/* Scores Table */}
      <div className="flex-1 bg-zinc-950/20 rounded-2xl border border-zinc-900 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 px-4">
            <Trophy className="w-8 h-8 opacity-30 mb-2" />
            <span className="text-xs font-mono">No records found</span>
            <p className="text-[10px] text-zinc-600 font-mono mt-1">Play a match in this mode to log your record first!</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-900">
            {filtered.map((item, index) => {
              const isTop3 = index < 3;
              const medalColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : 'text-amber-600';
              
              return (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-zinc-950/20 transition-all">
                  <div className="flex items-center gap-3">
                    {/* Position / Rank */}
                    <div className="w-6 text-center">
                      {isTop3 ? (
                        <Star className={`w-4 h-4 fill-current ${medalColor} mx-auto`} />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono font-bold">{index + 1}</span>
                      )}
                    </div>
                    {/* Name & Mode Tag */}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold font-mono tracking-wide text-zinc-200">{item.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] bg-zinc-900 text-zinc-400 px-1 py-0.5 rounded-xs font-mono font-bold">
                          {item.mode}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-mono flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{item.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Score */}
                  <span className={`text-sm font-black font-mono ${theme.accentTextClass}`}>
                    {item.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[9px] text-zinc-500 font-mono leading-relaxed uppercase">
          ★ SCORES STORED LOCALLY ON THIS PHONE ★
        </p>
      </div>

    </div>
  );
}
