import React, { useState, useEffect, useRef, useCallback } from 'react';
import MobileFrame from './components/MobileFrame';
import GameCanvas from './components/GameCanvas';
import VirtualControls from './components/VirtualControls';
import MainMenu from './components/MainMenu';
import SettingsMenu from './components/SettingsMenu';
import HighScoreScreen from './components/HighScoreScreen';
import GameOverScreen from './components/GameOverScreen';
import { GameState, GameSettings, Position, Direction, Score, GameMode } from './types';
import { THEMES } from './utils/themes';
import { playSound, startBGM, stopBGM } from './utils/sound';
import { getHighScores, saveHighScore } from './utils/highscores';
import { Trophy, Timer, Sparkles, AlertCircle, Menu, Pause, Play, RotateCcw, Home, Settings } from 'lucide-react';

const GRID_SIZE = 20;

export default function App() {
  // 1. Core Settings & State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'CLASSIC',
    speed: 'MEDIUM',
    theme: 'RETRO_ARCADE',
    snakeStyle: 'THEMED',
    vibration: true,
    sound: true,
    music: true,
    musicTrack: 'THEME_SYNC',
    controllerType: 'DPAD',
  });

  const [scores, setScores] = useState<Score[]>([]);

  // 2. Snake Gameplay State
  const [snake, setSnake] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [specialFood, setSpecialFood] = useState<Position | null>(null);
  const [specialFoodTimer, setSpecialFoodTimer] = useState<number>(0); // countdown percentage (0 - 100)
  const [score, setScore] = useState<number>(0);
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [portals, setPortals] = useState<Position[]>([]); // Pairs [0,1]
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Time Trial State
  const [timeTrialLeft, setTimeTrialLeft] = useState<number>(35); // seconds left

  // References for keeping track inside interval loop
  const directionRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef<Position[]>([]);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const foodEatenCountRef = useRef<number>(0);

  // Sync references to prevent stale closures in rendering
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Load High Scores initially
  useEffect(() => {
    setScores(getHighScores());
  }, []);

  const activeTheme = THEMES[settings.theme] || THEMES.RETRO_ARCADE;

  // 3. Game Helper: Safe coordinates generator
  const getSafeRandomPosition = useCallback((
    currentSnake: Position[],
    currentObstacles: Position[],
    currentPortals: Position[],
    currentFood: Position | null = null
  ): Position => {
    let attempts = 0;
    while (attempts < 500) {
      const pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

      // Check if collides with snake
      const onSnake = currentSnake.some(seg => seg.x === pos.x && seg.y === pos.y);
      // Check if collides with obstacles
      const onObstacle = currentObstacles.some(obs => obs.x === pos.x && obs.y === pos.y);
      // Check if collides with portals
      const onPortal = currentPortals.some(p => p.x === pos.x && p.y === pos.y);
      // Check if same as food
      const onFood = currentFood && currentFood.x === pos.x && currentFood.y === pos.y;

      if (!onSnake && !onObstacle && !onPortal && !onFood) {
        return pos;
      }
      attempts++;
    }
    return { x: 10, y: 10 }; // Fallback safety
  }, []);

  // 4. Generate obstacles & portals based on Game Mode selected
  const setupBoardElements = useCallback((mode: GameMode, initSnake: Position[]) => {
    const obsList: Position[] = [];
    const portList: Position[] = [];

    if (mode === 'OBSTACLES') {
      // Draw 2 symmetrical brick wall logs inside
      // Let's draw vertical logs in corners or horizontal blocks
      const center = Math.floor(GRID_SIZE / 2);
      for (let i = 4; i < 9; i++) {
        obsList.push({ x: 5, y: i });
        obsList.push({ x: 14, y: GRID_SIZE - i - 1 });
      }
      for (let i = 8; i < 12; i++) {
        obsList.push({ x: i, y: 6 });
        obsList.push({ x: GRID_SIZE - i - 1, y: 13 });
      }
    } else if (mode === 'PORTAL') {
      // 2 quantum portals
      portList.push({ x: 3, y: 3 });
      portList.push({ x: GRID_SIZE - 4, y: GRID_SIZE - 4 });
    }

    setObstacles(obsList);
    setPortals(portList);

    // Food placement
    const initialFood = getSafeRandomPosition(initSnake, obsList, portList);
    setFood(initialFood);
    setSpecialFood(null);
    setSpecialFoodTimer(0);
  }, [getSafeRandomPosition]);

  // 5. Initialize / Start the game
  const startGame = () => {
    // Fresh Snake centered moving Right
    const initSnake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    setSnake(initSnake);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setIsPaused(false);
    foodEatenCountRef.current = 0;

    // Mode-specific extras
    setupBoardElements(settings.mode, initSnake);
    if (settings.mode === 'TIMETRIAL') {
      setTimeTrialLeft(35);
    }

    playSound('CLICK', settings.sound);
    setGameState('PLAYING');
  };

  // 6. Pause Game logic
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev;
      playSound('CLICK', settings.sound);
      return next;
    });
  }, [settings.sound]);

  // 7. Direction Controls Validator (Anti-reversing lock)
  const changeDirection = useCallback((newDir: Direction) => {
    if (isPaused) {
      setIsPaused(false); // resume on press
    }

    const curr = directionRef.current;
    if (newDir === 'UP' && curr !== 'DOWN') setDirection('UP');
    if (newDir === 'DOWN' && curr !== 'UP') setDirection('DOWN');
    if (newDir === 'LEFT' && curr !== 'RIGHT') setDirection('LEFT');
    if (newDir === 'RIGHT' && curr !== 'LEFT') setDirection('RIGHT');
  }, [isPaused]);

  // Handle Swipe directions (passed from GameCanvas touch detector)
  const handleSwipeDirection = useCallback((swipeDir: Direction) => {
    changeDirection(swipeDir);
  }, [changeDirection]);

  // 8. Physical Keyboard Inputs Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') {
        // Simple back buttons or shortkeys in menu
        if (e.key === 'Escape' && gameState !== 'MENU') {
          setGameState('MENU');
          playSound('CLICK', settings.sound);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDirection, togglePause, settings.sound]);

  // 9. Main Game Loop Tick Processor
  const gameTick = useCallback(() => {
    if (isPaused || gameState !== 'PLAYING') return;

    const currentSnake = [...snakeRef.current];
    if (currentSnake.length === 0) return;

    const head = currentSnake[0];
    let nextHead = { ...head };

    // Move coordinate in current direction
    const currentDir = directionRef.current;
    if (currentDir === 'UP') nextHead.y -= 1;
    else if (currentDir === 'DOWN') nextHead.y += 1;
    else if (currentDir === 'LEFT') nextHead.x -= 1;
    else if (currentDir === 'RIGHT') nextHead.x += 1;

    // Check Wall Collisions or Wrap around according to Mode
    if (settings.mode === 'CLASSIC') {
      // Loop wrapping
      nextHead.x = (nextHead.x + GRID_SIZE) % GRID_SIZE;
      nextHead.y = (nextHead.y + GRID_SIZE) % GRID_SIZE;
    } else {
      // Hard border crash
      if (nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }
    }

    // Check self bite collision (except tail on non-food eating frames, but to be completely safe, we match any)
    const bitSelf = currentSnake.some(seg => seg.x === nextHead.x && seg.y === nextHead.y);
    if (bitSelf) {
      handleGameOver();
      return;
    }

    // Check Obstacle bite
    const hitObstacle = obstacles.some(obs => obs.x === nextHead.x && obs.y === nextHead.y);
    if (hitObstacle) {
      handleGameOver();
      return;
    }

    // Portal warp teleportation trigger
    if (settings.mode === 'PORTAL' && portals.length === 2) {
      const p1 = portals[0];
      const p2 = portals[1];
      if (nextHead.x === p1.x && nextHead.y === p1.y) {
        // Warp to P2
        nextHead = { x: p2.x, y: p2.y };
        playSound('PORTAL', settings.sound);
        triggerVibration(40);
      } else if (nextHead.x === p2.x && nextHead.y === p2.y) {
        // Warp to P1
        nextHead = { x: p1.x, y: p1.y };
        playSound('PORTAL', settings.sound);
        triggerVibration(40);
      }
    }

    // Create new snake segments
    const newSnake = [nextHead, ...currentSnake];

    // Check normal food consumption
    if (nextHead.x === food.x && nextHead.y === food.y) {
      playSound('EAT', settings.sound);
      triggerVibration(15);
      
      const newScoreValue = score + 10;
      setScore(newScoreValue);
      foodEatenCountRef.current += 1;

      // Relocate food safely
      const nextFood = getSafeRandomPosition(newSnake, obstacles, portals);
      setFood(nextFood);

      // Check special bonus food countdown triggers (every 4 normal fruits, spawn golden star)
      if (foodEatenCountRef.current % 4 === 0) {
        const bonusFood = getSafeRandomPosition(newSnake, obstacles, portals, nextFood);
        setSpecialFood(bonusFood);
        setSpecialFoodTimer(100); // 100% full timer
      }

      // Add extra time in Time Trial
      if (settings.mode === 'TIMETRIAL') {
        setTimeTrialLeft(prev => Math.min(60, prev + 3));
      }
    }
    // Check special food consumption
    else if (specialFood && nextHead.x === specialFood.x && nextHead.y === specialFood.y) {
      playSound('POWERUP', settings.sound);
      triggerVibration(30);

      // Worth massive points + speed bonus
      setScore(prev => prev + 40);
      setSpecialFood(null);
      setSpecialFoodTimer(0);

      if (settings.mode === 'TIMETRIAL') {
        setTimeTrialLeft(prev => Math.min(60, prev + 8));
      }
    }
    // Standard block advance frame (pop tail)
    else {
      newSnake.pop();
    }

    // Decrement special star food timer
    if (specialFood) {
      setSpecialFoodTimer(prev => {
        const next = prev - 4; // decays in 25 frames
        if (next <= 0) {
          setSpecialFood(null);
          return 0;
        }
        return next;
      });
    }

    setSnake(newSnake);
  }, [snake, food, specialFood, obstacles, portals, isPaused, gameState, settings.mode, settings.sound, score, getSafeRandomPosition]);

  // Handle Game over termination
  const handleGameOver = () => {
    playSound('CRASH', settings.sound);
    triggerVibration(150);
    setGameState('GAMEOVER');
  };

  const triggerVibration = (ms: number) => {
    if (settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // 10. Dynamic Speed Tick interval lookup
  const getTickInterval = (): number => {
    if (settings.speed === 'EASY') return 160;
    if (settings.speed === 'HARD') return 75;
    if (settings.speed === 'DYNAMIC') {
      // Accelerates by 4ms for every 3 scores, down to 45ms minimum
      const acceleration = Math.floor(score / 30) * 4;
      return Math.max(45, 130 - acceleration);
    }
    return 100; // MEDIUM default
  };

  // 11. Orchestrate Loops & Timers
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused) {
      const intervalMs = getTickInterval();
      gameIntervalRef.current = setInterval(gameTick, intervalMs);
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameState, isPaused, gameTick, score, settings.speed]);

  // Time Trial Timer Countdown (Seconds based)
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused && settings.mode === 'TIMETRIAL') {
      countdownIntervalRef.current = setInterval(() => {
        setTimeTrialLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          if (prev <= 6) {
            playSound('TICK', settings.sound); // Ticking tension!
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [gameState, isPaused, settings.mode, settings.sound]);

  // Orchestrate Background Music (BGM) dynamically based on gameplay states
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused && settings.music) {
      const activeTrack = settings.musicTrack === 'THEME_SYNC' ? settings.theme : settings.musicTrack;
      startBGM(activeTrack, settings.music);
    } else {
      stopBGM();
    }
    
    return () => {
      stopBGM();
    };
  }, [gameState, isPaused, settings.theme, settings.music, settings.musicTrack]);

  // 12. Save score callback
  const handleSaveScore = (nickname: string) => {
    const updated = saveHighScore(nickname, score, settings.mode);
    setScores(updated);
  };

  const handleClearScores = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('android_snake_highscores');
      setScores([]);
    }
  };

  // 13. Double touch-move preventer to block iOS/Android browser elastic bounce
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (gameState === 'PLAYING') {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [gameState]);

  // 14. Drag and Drop swipe controls on Canvas area
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (settings.controllerType === 'DPAD' && settings.controllerType !== 'HYBRID') return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    
    const threshold = 25; // min pixels swiped

    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (dx > 0) handleSwipeDirection('RIGHT');
        else handleSwipeDirection('LEFT');
      } else {
        // Vertical swipe
        if (dy > 0) handleSwipeDirection('DOWN');
        else handleSwipeDirection('UP');
      }
      // Reset trigger anchor so it doesn't fire repeatedly during single slide
      touchStartRef.current = null;
    }
  };

  return (
    <MobileFrame themeClass={activeTheme.bgClass}>
      
      {/* 1. Play Screen layout */}
      {gameState === 'PLAYING' && (
        <div id="playing-layout-container" className="flex-1 flex flex-col justify-between select-none">
          
          {/* Real-time stats bar header */}
          <div id="stats-header-bar" className="px-5 py-2 grid grid-cols-3 items-center border-b border-zinc-900/60 bg-black/10">
            {/* Score */}
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-zinc-500 font-mono tracking-wider">SCORE</span>
              <span className={`text-xl font-black font-mono leading-none ${activeTheme.accentTextClass}`}>
                {score}
              </span>
            </div>

            {/* Time Trial counter or balanced center element */}
            <div className="flex justify-center">
              {settings.mode === 'TIMETRIAL' ? (
                <div className="flex items-center gap-1.5 bg-rose-950/20 px-2.5 py-1 rounded-full border border-rose-900/30">
                  <Timer className={`w-3.5 h-3.5 ${timeTrialLeft <= 7 ? 'text-rose-500 animate-ping' : 'text-rose-400'}`} />
                  <span className={`text-xs font-mono font-bold ${timeTrialLeft <= 7 ? 'text-rose-500' : 'text-zinc-300'}`}>
                    {timeTrialLeft}s
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-zinc-900/30 px-2.5 py-0.5 rounded-full border border-zinc-800/10 text-zinc-500">
                  <span className="text-[8px] font-mono uppercase tracking-wider scale-90">SPEED: {settings.speed}</span>
                </div>
              )}
            </div>

            {/* Dynamic Level label (Classic Nokia style) */}
            <div className="flex flex-col text-right">
              <span className="text-[8px] text-zinc-500 font-mono tracking-wider">MODE</span>
              <span className="text-[10px] font-bold font-mono text-zinc-300 uppercase truncate">
                {settings.mode === 'TIMETRIAL' ? 'Time Trial' : settings.mode}
              </span>
            </div>
          </div>

          {/* Core Gameboard Screen Container */}
          <div 
            id="game-board-interaction-wrapper" 
            className="p-4 flex-1 flex items-center justify-center relative touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Floating Menu Button on Top Corner */}
            <button
              id="game-corner-menu-btn"
              onClick={togglePause}
              className={`absolute top-6 right-6 p-2 rounded-xl transition-all duration-150 z-30 shadow-md flex items-center justify-center ${
                isPaused 
                  ? 'bg-emerald-500 text-zinc-950 scale-105 ring-2 ring-emerald-400/50' 
                  : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/95 active:scale-95'
              }`}
              title={isPaused ? "Resume Game" : "Pause / Menu"}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Interactive Pause Overlay */}
            {isPaused && (
              <div 
                id="interactive-pause-overlay" 
                className="absolute inset-4 rounded-2xl bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 p-6 border border-zinc-800/80 shadow-2xl animate-fade-in"
              >
                {/* Paused Title */}
                <div className="flex flex-col items-center gap-1.5 mb-6 text-center">
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-semibold opacity-60 ${activeTheme.accentTextClass}`}>
                    Session Paused
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-wider font-sans text-white">
                    Game Paused
                  </h3>
                </div>
                
                {/* Buttons Stack */}
                <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
                  <button
                    onClick={() => {
                      playSound('CLICK', settings.sound);
                      setIsPaused(false);
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${activeTheme.buttonStyle}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Game</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      startGame();
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wider bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart Game</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      playSound('CLICK', settings.sound);
                      setGameState('SETTINGS');
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wider bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      playSound('CLICK', settings.sound);
                      setGameState('MENU');
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wider bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/30 hover:border-rose-900/50 text-rose-300 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Main Menu</span>
                  </button>
                </div>
              </div>
            )}

            <GameCanvas
              snake={snake}
              food={food}
              specialFood={specialFood}
              specialFoodTimer={specialFoodTimer}
              obstacles={obstacles}
              portals={portals}
              theme={activeTheme}
              snakeStyle={settings.snakeStyle}
              gridSize={GRID_SIZE}
              direction={direction}
              isPaused={isPaused}
              score={score}
            />
          </div>

          {/* Tactile D-pad touch controls */}
          <VirtualControls
            currentDirection={direction}
            onDirectionChange={changeDirection}
            onPauseToggle={togglePause}
            isPaused={isPaused}
            controllerType={settings.controllerType}
            vibrationEnabled={settings.vibration}
          />

        </div>
      )}

      {/* 2. Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={startGame}
          onNavigate={(screen) => setGameState(screen)}
          settings={settings}
          currentTheme={activeTheme}
        />
      )}

      {/* 3. Settings Config screen */}
      {gameState === 'SETTINGS' && (
        <SettingsMenu
          settings={settings}
          onUpdateSettings={setSettings}
          onBack={() => setGameState('MENU')}
          accentTextClass={activeTheme.accentTextClass}
          buttonStyle={activeTheme.buttonStyle}
        />
      )}

      {/* 4. High Scores rankings */}
      {gameState === 'HIGHSCORES' && (
        <HighScoreScreen
          scores={scores}
          onBack={() => setGameState('MENU')}
          onClearScores={handleClearScores}
          theme={activeTheme}
        />
      )}

      {/* 5. Game Over summary screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverScreen
          score={score}
          mode={settings.mode}
          onRestart={startGame}
          onGoHome={() => setGameState('MENU')}
          onSaveScore={handleSaveScore}
          theme={activeTheme}
        />
      )}

    </MobileFrame>
  );
}
