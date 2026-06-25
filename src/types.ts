export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'SETTINGS' | 'HIGHSCORES';

export type GameMode = 'CLASSIC' | 'OBSTACLES' | 'TIMETRIAL' | 'PORTAL';

export type SpeedLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'DYNAMIC';

export type ThemeId = 'RETRO_ARCADE' | 'NOKIA_CLASSIC' | 'CYBERPUNK' | 'JUNGLE' | 'JUNGLE_NIGHT' | 'CANDY' | 'CANDY_MINT' | 'CANDY_LEMON';

export interface Theme {
  id: ThemeId;
  name: string;
  bgClass: string;          // Tailwind class for screen background
  boardBgClass: string;     // Tailwind class for game board grid background
  snakeHeadClass: string;   // Color/style for snake head
  snakeBodyClass: string;   // Color/style for snake body
  foodClass: string;        // Color/style for food
  specialFoodClass: string; // Color/style for powerup/bonus food
  wallClass: string;        // Color/style for obstacles
  portalClass: string;      // Color/style for portals
  accentTextClass: string;  // Class for highlighted text/stats
  fontFamily: string;       // Custom font-style class
  buttonStyle: string;      // Style for virtual buttons
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type SnakeStyle = 'THEMED' | 'SOLID' | 'RAINBOW' | 'TEXTURED';

export type MusicTrackId = 'THEME_SYNC' | 'RETRO_ARCADE' | 'CYBERPUNK' | 'NOKIA_CLASSIC' | 'CANDY' | 'JUNGLE' | 'JUNGLE_NIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface Score {
  name: string;
  score: number;
  mode: GameMode;
  date: string;
}

export interface GameSettings {
  mode: GameMode;
  speed: SpeedLevel;
  theme: ThemeId;
  snakeStyle: SnakeStyle;
  vibration: boolean;
  sound: boolean;
  music: boolean;
  musicTrack: MusicTrackId;
  controllerType: 'DPAD' | 'SWIPE' | 'JOYSTICK' | 'HYBRID';
}
