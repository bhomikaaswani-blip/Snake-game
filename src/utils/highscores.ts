import { Score, GameMode } from '../types';

const STORAGE_KEY = 'android_snake_highscores';

const PRESETS: Score[] = [
  { name: 'SNAKE_MASTER', score: 1200, mode: 'CLASSIC', date: '2026-06-20' },
  { name: 'NOKIA_FAN', score: 850, mode: 'CLASSIC', date: '2026-06-21' },
  { name: 'WALL_SURFER', score: 950, mode: 'OBSTACLES', date: '2026-06-22' },
  { name: 'PORTAL_HOPPER', score: 1100, mode: 'PORTAL', date: '2026-06-23' },
  { name: 'CHRONOS', score: 720, mode: 'TIMETRIAL', date: '2026-06-24' },
];

export function getHighScores(): Score[] {
  if (typeof window === 'undefined') return PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESETS));
      return PRESETS;
    }
    return JSON.parse(raw);
  } catch {
    return PRESETS;
  }
}

export function saveHighScore(name: string, score: number, mode: GameMode): Score[] {
  const currentScores = getHighScores();
  const newScore: Score = {
    name: name.trim().toUpperCase() || 'PLAYER',
    score,
    mode,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...currentScores, newScore]
    .sort((a, b) => b.score - a.score)
    .slice(0, 25); // Limit to top 25 records

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save high scores', e);
  }

  return updated;
}
