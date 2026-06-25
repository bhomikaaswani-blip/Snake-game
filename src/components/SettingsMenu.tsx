import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Palette, ShieldAlert, Sparkles, Music } from 'lucide-react';
import { GameSettings, GameMode, SpeedLevel, ThemeId, SnakeStyle, MusicTrackId } from '../types';
import { THEMES } from '../utils/themes';

interface SettingsMenuProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
  accentTextClass: string;
  buttonStyle: string;
}

export default function SettingsMenu({
  settings,
  onUpdateSettings,
  onBack,
  accentTextClass,
  buttonStyle,
}: SettingsMenuProps) {

  const updateField = <K extends keyof GameSettings>(field: K, value: GameSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [field]: value,
    });
  };

  const modes: { id: GameMode; name: string; desc: string }[] = [
    { id: 'CLASSIC', name: 'Classic', desc: 'No internal walls' },
    { id: 'OBSTACLES', name: 'Obstacles', desc: 'Inside brick walls' },
    { id: 'PORTAL', name: 'Portal', desc: 'Warp through portals' },
    { id: 'TIMETRIAL', name: 'Time Trial', desc: 'Time ticks down' },
  ];

  const speeds: SpeedLevel[] = ['EASY', 'MEDIUM', 'HARD', 'DYNAMIC'];
  const controllers: ('DPAD' | 'SWIPE' | 'JOYSTICK' | 'HYBRID')[] = ['DPAD', 'SWIPE', 'HYBRID'];

  const snakeStyles: { id: SnakeStyle; name: string; desc: string }[] = [
    { id: 'THEMED', name: 'Theme Native', desc: 'Premium custom theme design' },
    { id: 'SOLID', name: 'Solid Glow', desc: 'Uniform clean solid color' },
    { id: 'RAINBOW', name: 'Rainbow', desc: 'Vibrant color cycling' },
    { id: 'TEXTURED', name: 'Scale Textured', desc: 'Serpent diamond scales' },
  ];

  const musicTracks: { id: MusicTrackId; name: string; desc: string }[] = [
    { id: 'THEME_SYNC', name: 'Auto Sync 🎵', desc: 'Syncs dynamic loop with current visual theme' },
    { id: 'RETRO_ARCADE', name: 'Retro Arcade 👾', desc: 'Nostalgic 8-bit classic arpeggio' },
    { id: 'CYBERPUNK', name: 'Cyber Neon ⚡', desc: 'Heavy futuristic synthwave bass line' },
    { id: 'NOKIA_CLASSIC', name: 'Indie Nokia 📱', desc: 'Charming polyphonic cellphone ringtone' },
    { id: 'CANDY', name: 'Sweet Dream 🍬', desc: 'Playful sugary high-pitch lullaby' },
    { id: 'JUNGLE', name: 'Wild Safari 🌿', desc: 'Mystical organic ambient acoustic steps' },
    { id: 'JUNGLE_NIGHT', name: 'Midnight Run 🌙', desc: 'Deep twilight hypnotic bass arpeggios' },
  ];

  return (
    <div id="game-settings-menu" className="flex-1 flex flex-col p-5 overflow-y-auto max-h-[700px] select-none">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          id="btn-settings-back"
          onClick={onBack}
          className={`p-2 rounded-xl transition-all active:scale-90 ${buttonStyle}`}
          aria-label="Back to main menu"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold font-mono tracking-wider uppercase flex-1 text-left">
          Game Configuration
        </h2>
      </div>

      {/* 1. Game Mode Selector */}
      <div className="mb-5 text-left">
        <label className="text-[10px] text-zinc-500 font-mono tracking-wider block mb-2 uppercase">
          Select Game Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => updateField('mode', m.id)}
              className={`p-2 rounded-xl text-left border flex flex-col justify-between transition-all ${
                settings.mode === m.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span className="text-xs font-semibold">{m.name}</span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5 leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Speed / Difficulty */}
      <div className="mb-5 text-left">
        <label className="text-[10px] text-zinc-500 font-mono tracking-wider block mb-2 uppercase">
          Speed / Level
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/30 p-1 rounded-xl border border-zinc-900">
          {speeds.map(lvl => (
            <button
              key={lvl}
              onClick={() => updateField('speed', lvl)}
              className={`py-2 px-1 rounded-lg text-[10px] font-bold font-mono text-center transition-all ${
                settings.speed === lvl
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cosmetic Skin/Theme Selector */}
      <div className="mb-5 text-left">
        <label className="text-[10px] text-zinc-500 font-mono tracking-wider block mb-2 uppercase flex items-center gap-1">
          <Palette className="w-3 h-3 text-zinc-400" />
          <span>Cosmetic Skins</span>
        </label>
        <div className="flex flex-col gap-2">
          {Object.values(THEMES).map(theme => (
            <button
              key={theme.id}
              onClick={() => updateField('theme', theme.id as ThemeId)}
              className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                settings.theme === theme.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                  : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Micro preview colors */}
                <div className="flex gap-0.5 scale-90 border border-zinc-800 p-0.5 rounded-sm bg-black/40">
                  <div className={`w-3 h-3 ${theme.snakeHeadClass.split(' ')[0]}`} />
                  <div className={`w-3 h-3 ${theme.foodClass.split(' ')[0]}`} />
                </div>
                <span className="text-xs font-mono">{theme.name}</span>
              </div>
              <span className="text-[9px] uppercase font-mono opacity-60">
                {settings.theme === theme.id ? 'ACTIVE' : 'SELECT'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Snake Appearance Selector */}
      <div className="mb-5 text-left">
        <label className="text-[10px] text-zinc-500 font-mono tracking-wider block mb-2 uppercase flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Snake Appearance</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {snakeStyles.map(style => (
            <button
              key={style.id}
              onClick={() => updateField('snakeStyle', style.id)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all text-left ${
                settings.snakeStyle === style.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                  : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {style.id === 'RAINBOW' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse" />
                )}
                {style.id === 'SOLID' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                )}
                {style.id === 'TEXTURED' && (
                  <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-amber-400 bg-emerald-700" />
                )}
                {style.id === 'THEMED' && (
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-indigo-500 to-cyan-400 border border-zinc-700" />
                )}
                <span className="text-xs font-mono">{style.name}</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono mt-1 leading-tight">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. On-Screen Control Pref */}
      <div className="mb-5 text-left">
        <label className="text-[10px] text-zinc-500 font-mono tracking-wider block mb-2 uppercase flex items-center gap-1">
          <Smartphone className="w-3 h-3 text-zinc-400" />
          <span>On-Screen Controller</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-zinc-950/30 p-1 rounded-xl border border-zinc-900">
          {controllers.map(ctrl => (
            <button
              key={ctrl}
              onClick={() => updateField('controllerType', ctrl)}
              className={`py-2 px-1 rounded-lg text-[10px] font-bold font-mono text-center transition-all ${
                settings.controllerType === ctrl
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ctrl}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-zinc-500 font-mono mt-1 px-1">
          {settings.controllerType === 'DPAD' && '• Classic 4-way cross button pad.'}
          {settings.controllerType === 'SWIPE' && '• Swipe anywhere on the screen.'}
          {settings.controllerType === 'HYBRID' && '• Both touch buttons and swipe gestures active.'}
        </p>
      </div>

      {/* 4.5. Background Music Playlist (Local Music Options) */}
      <div className="mb-5 text-left bg-zinc-950/20 p-3 rounded-2xl border border-zinc-900/80">
        <label className="text-[10px] text-zinc-400 font-mono tracking-wider block mb-2.5 uppercase flex items-center gap-1.5 font-bold">
          <Music className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Soundtrack Choice</span>
        </label>
        
        <div className="relative">
          <select
            id="bgm-soundtrack-select"
            value={settings.musicTrack || 'THEME_SYNC'}
            onChange={(e) => updateField('musicTrack', e.target.value as MusicTrackId)}
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl px-3 py-2.5 text-xs font-mono tracking-wide focus:outline-none focus:border-emerald-500/50 cursor-pointer appearance-none"
          >
            {musicTracks.map(track => (
              <option key={track.id} value={track.id} className="bg-zinc-950 text-zinc-300 py-1 font-mono">
                {track.name}
              </option>
            ))}
          </select>
          {/* Custom absolute dropdown indicator */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">
            ▼
          </div>
        </div>
        
        <p className="text-[10px] text-zinc-400 font-mono mt-2 px-1 leading-relaxed">
          {musicTracks.find(t => t.id === (settings.musicTrack || 'THEME_SYNC'))?.desc}
        </p>
      </div>

      {/* 5. Audio & Vibration Haptic toggles */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-left">
        
        {/* Music toggle */}
        <button
          onClick={() => updateField('music', !settings.music)}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
            settings.music
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-zinc-950/20 border-zinc-800 text-zinc-500 hover:border-zinc-700'
          }`}
        >
          <Music className="w-4 h-4" />
          <span className="text-[10px] font-mono font-semibold">Music</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => updateField('sound', !settings.sound)}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
            settings.sound
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-zinc-950/20 border-zinc-800 text-zinc-500 hover:border-zinc-700'
          }`}
        >
          {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px] font-mono font-semibold">Sound FX</span>
        </button>

        {/* Haptic Vibration toggle */}
        <button
          onClick={() => updateField('vibration', !settings.vibration)}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
            settings.vibration
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-zinc-950/20 border-zinc-800 text-zinc-500 hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-bold font-mono">
            {settings.vibration ? 'ON' : 'OFF'}
          </span>
          <span className="text-[10px] font-mono font-semibold">Vibration</span>
        </button>

      </div>

    </div>
  );
}
