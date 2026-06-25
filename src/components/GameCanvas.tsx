import React, { useRef, useEffect, useState } from 'react';
import { Position, Theme, Direction, SnakeStyle } from '../types';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  specialFood: Position | null;
  specialFoodTimer: number; // 0 to 100 percentage
  obstacles: Position[];
  portals: Position[];
  theme: Theme;
  snakeStyle: SnakeStyle;
  gridSize: number;
  direction: Direction;
  isPaused: boolean;
  score: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export default function GameCanvas({
  snake,
  food,
  specialFood,
  specialFoodTimer,
  obstacles,
  portals,
  theme,
  snakeStyle,
  gridSize,
  direction,
  isPaused,
  score,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 340 });
  const particlesRef = useRef<Particle[]>([]);
  const lastScoreRef = useRef(score);

  // Spawns particles at a grid coordinate
  const spawnParticles = (gridX: number, gridY: number, color: string, count: number = 8) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellSize = canvas.width / gridSize;
    const px = (gridX + 0.5) * cellSize;
    const py = (gridY + 0.5) * cellSize;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 2,
        alpha: 1,
        life: 1, // Decreases over time
      });
    }
  };

  // Resize canvas according to mobile screen container width dynamically
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Keep it square
        setDimensions({ width, height: width });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Trigger particles on score change (eat food)
  useEffect(() => {
    if (score > lastScoreRef.current) {
      // Find where food was eaten
      if (snake.length > 0) {
        const head = snake[0];
        let pColor = '#10b981'; // default emerald
        if (theme.id === 'RETRO_ARCADE') pColor = '#34d399';
        else if (theme.id === 'CYBERPUNK') pColor = '#22d3ee';
        else if (theme.id === 'NOKIA_CLASSIC') pColor = '#1c2415';
        else if (theme.id === 'CANDY') pColor = '#ec4899';
        else if (theme.id === 'CANDY_MINT') pColor = '#10b981';
        else if (theme.id === 'CANDY_LEMON') pColor = '#fbbf24';
        else if (theme.id === 'JUNGLE_NIGHT') pColor = '#2dd4bf';
        else if (theme.id === 'JUNGLE') pColor = '#84cc16';

        // Check if eaten food was special
        if (specialFood === null && score - lastScoreRef.current > 15) {
          spawnParticles(head.x, head.y, '#fbbf24', 16); // Gold explosion
        } else {
          spawnParticles(head.x, head.y, pColor, 10);
        }
      }
    }
    lastScoreRef.current = score;
  }, [score, snake, theme, specialFood]);

  // Main Canvas Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI retina screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const width = dimensions.width;
    const height = dimensions.height;
    const cellSize = width / gridSize;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Render themed Grid background
    if (theme.id === 'NOKIA_CLASSIC') {
      ctx.fillStyle = '#c9d4ba';
      ctx.fillRect(0, 0, width, height);
      // Subtle nokia grid shadow overlay
      ctx.fillStyle = 'rgba(28, 36, 21, 0.02)';
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    } else if (theme.id === 'RETRO_ARCADE') {
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.fillRect(0, 0, width, height);
      // Draw retro grid lines
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)'; // zinc-800
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }
    } else if (theme.id === 'CYBERPUNK') {
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);
      // Cyberpunk grid accents
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'; // cyan/10
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }
    } else if (theme.id === 'CANDY' || theme.id === 'CANDY_MINT' || theme.id === 'CANDY_LEMON') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Determine board checker color
      let checkColor = '#fdf2f8'; // default pink-50 for CANDY
      if (theme.id === 'CANDY_MINT') checkColor = '#f0fdf4'; // green-50
      else if (theme.id === 'CANDY_LEMON') checkColor = '#fefce8'; // yellow-50

      ctx.fillStyle = checkColor;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    } else if (theme.id === 'JUNGLE_NIGHT') {
      // Midnight violet jungle safari
      ctx.fillStyle = '#090514'; // ultra dark violet
      ctx.fillRect(0, 0, width, height);

      // Bioluminescent night dots
      ctx.fillStyle = '#4f46e5'; // glowing indigo points
      for (let x = 1; x < gridSize; x++) {
        for (let y = 1; y < gridSize; y++) {
          ctx.beginPath();
          ctx.arc(x * cellSize, y * cellSize, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // JUNGLE (Classic Safari forest ground)
      ctx.fillStyle = '#141411'; // dark earth-stone
      ctx.fillRect(0, 0, width, height);
      // Draw small leafy dots on intersections
      ctx.fillStyle = '#15803d'; // safari forest green
      for (let x = 1; x < gridSize; x++) {
        for (let y = 1; y < gridSize; y++) {
          ctx.beginPath();
          ctx.arc(x * cellSize, y * cellSize, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 1. Draw Portals (if any)
    portals.forEach((p, idx) => {
      const cx = (p.x + 0.5) * cellSize;
      const cy = (p.y + 0.5) * cellSize;
      const radius = cellSize * 0.45;

      ctx.save();
      if (theme.id === 'NOKIA_CLASSIC') {
        ctx.strokeStyle = '#1c2415';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Neon rotating vortex effect
        const pulse = 1 + 0.15 * Math.sin(Date.now() / 150 + idx * Math.PI);
        const glowColor = idx % 2 === 0 ? '#6366f1' : '#06b6d4'; // Indigo vs Cyan
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        
        // Outer glow gradient
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * pulse);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, glowColor);
        grad.addColorStop(0.7, 'rgba(99, 102, 241, 0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 2. Draw Obstacles
    obstacles.forEach(obs => {
      const x = obs.x * cellSize;
      const y = obs.y * cellSize;
      const pad = 1;

      ctx.save();
      if (theme.id === 'NOKIA_CLASSIC') {
        ctx.fillStyle = '#1c2415';
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        // Draw diagonal cross inside for high fidelity classic Nokia walls
        ctx.strokeStyle = '#c9d4ba';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + pad + 2, y + pad + 2);
        ctx.lineTo(x + cellSize - pad - 2, y + cellSize - pad - 2);
        ctx.moveTo(x + cellSize - pad - 2, y + pad + 2);
        ctx.lineTo(x + pad + 2, y + cellSize - pad - 2);
        ctx.stroke();
      } else if (theme.id === 'RETRO_ARCADE') {
        ctx.fillStyle = '#3f3f46'; // zinc-700
        ctx.strokeStyle = '#a1a1aa'; // zinc-400
        ctx.lineWidth = 1;
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        ctx.strokeRect(x + pad + 1.5, y + pad + 1.5, cellSize - pad * 3, cellSize - pad * 3);
      } else if (theme.id === 'CYBERPUNK') {
        ctx.fillStyle = '#1e1b4b'; // deep purple indigo-950
        ctx.strokeStyle = '#eab308'; // yellow-500
        ctx.lineWidth = 1.5;
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        // Cyber stripe
        ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.fillRect(x + pad + 2, y + cellSize / 2 - 2, cellSize - pad * 4, 4);
      } else if (theme.id === 'CANDY') {
        ctx.fillStyle = '#818cf8'; // indigo-400 candy brick
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
        ctx.fill();
        // Highlight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x + pad + 2, y + pad + 2, 4, 2);
      } else {
        // JUNGLE (wood log block)
        ctx.fillStyle = '#78350f'; // brown-900
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
        // Wood grain lines
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + pad + 2, y + pad + 4, cellSize - pad * 4, 2);
        ctx.fillRect(x + pad + 4, y + pad + 10, cellSize - pad * 8, 2);
      }
      ctx.restore();
    });

    // 3. Draw Normal Food
    {
      const fx = (food.x + 0.5) * cellSize;
      const fy = (food.y + 0.5) * cellSize;
      const radius = cellSize * 0.4;

      ctx.save();
      if (theme.id === 'NOKIA_CLASSIC') {
        ctx.fillStyle = '#1c2415';
        // Nokia simple 2x2 dot clustered look
        ctx.fillRect(fx - radius, fy - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#c9d4ba';
        ctx.fillRect(fx - 1, fy - 1, 2, 2);
      } else if (theme.id === 'RETRO_ARCADE') {
        // Flashing neon arcade cherry
        const glow = Math.abs(Math.sin(Date.now() / 200)) * 6 + 4;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = glow;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(fx, fy + 1, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 1);
        ctx.quadraticCurveTo(fx + 3, fy - 5, fx + 5, fy - 6);
        ctx.stroke();
      } else if (theme.id === 'CYBERPUNK') {
        // Rotating diamond
        ctx.translate(fx, fy);
        ctx.rotate((Date.now() / 500) % (Math.PI * 2));
        ctx.shadowColor = '#d946ef'; // magenta glow
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#d946ef';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        // Inner white diamond
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-radius / 2, -radius / 2, radius, radius);
      } else if (theme.id === 'CANDY') {
        // Cute pink lollipop with white swirls
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(fx, fy - 2, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Spiral swirl
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.1) {
          const r = (a / (Math.PI * 4)) * radius * 0.8;
          const sx = fx + Math.cos(a + Date.now() / 300) * r;
          const sy = fy - 2 + Math.sin(a + Date.now() / 300) * r;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Lollipop stick
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy + radius * 0.2);
        ctx.lineTo(fx, fy + radius * 1.5);
        ctx.stroke();
      } else if (theme.id === 'CANDY_MINT') {
        // Wrapped Peppermint Candy
        ctx.translate(fx, fy);
        ctx.rotate(Date.now() / 600);
        
        // Side wrappers (bow tie shape)
        ctx.fillStyle = '#fb7185'; // rose-400
        ctx.beginPath();
        ctx.moveTo(-radius * 1.4, -radius * 0.6);
        ctx.lineTo(-radius * 0.6, 0);
        ctx.lineTo(-radius * 1.4, radius * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(radius * 1.4, -radius * 0.6);
        ctx.lineTo(radius * 0.6, 0);
        ctx.lineTo(radius * 1.4, radius * 0.6);
        ctx.closePath();
        ctx.fill();

        // Peppermint circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Red pinwheel stripes
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, (i * Math.PI) / 4, ((i + 0.4) * Math.PI) / 4);
          ctx.closePath();
          ctx.fill();
        }
      } else if (theme.id === 'CANDY_LEMON') {
        // Sour yellow Lemon Drop candy
        ctx.fillStyle = '#facc15'; // yellow-400
        ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
        ctx.shadowBlur = 8;
        
        // Lemon teardrop shape
        ctx.beginPath();
        ctx.moveTo(fx - radius * 1.1, fy);
        ctx.quadraticCurveTo(fx, fy - radius * 1.1, fx + radius * 1.1, fy);
        ctx.quadraticCurveTo(fx, fy + radius * 1.1, fx - radius * 1.1, fy);
        ctx.closePath();
        ctx.fill();

        // Sour sugar dust sprinkles (small dots)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx - 2, fy - 3, 1.5, 1.5);
        ctx.fillRect(fx + 3, fy + 2, 1.5, 1.5);
        ctx.fillRect(fx - 4, fy + 1, 1.5, 1.5);

        // Highlight glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(fx + 2, fy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme.id === 'JUNGLE') {
        // Juicy Jungle Banana
        ctx.strokeStyle = '#eab308'; // yellow-500
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        
        // Curved banana path
        ctx.beginPath();
        ctx.arc(fx - 2, fy + 2, radius * 1.1, -Math.PI * 0.45, Math.PI * 0.2);
        ctx.stroke();

        // Black tip
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(fx - 2, fy + 2, radius * 1.1, Math.PI * 0.17, Math.PI * 0.22);
        ctx.stroke();
      } else if (theme.id === 'JUNGLE_NIGHT') {
        // Night glowing Dragonfruit
        ctx.fillStyle = '#f43f5e'; // rose-500
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        
        // Oval pear shape
        ctx.beginPath();
        ctx.ellipse(fx, fy, radius, radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Green leafy scales on dragonfruit
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(fx - radius * 0.8, fy - 2);
        ctx.lineTo(fx - radius * 1.1, fy - 6);
        ctx.lineTo(fx - radius * 0.4, fy - 4);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fx + radius * 0.8, fy - 2);
        ctx.lineTo(fx + radius * 1.1, fy - 6);
        ctx.lineTo(fx + radius * 0.4, fy - 4);
        ctx.closePath();
        ctx.fill();

        // Center white flesh and black seeds
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(fx, fy, radius * 0.65, radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillRect(fx - 2, fy - 2, 1, 1);
        ctx.fillRect(fx + 2, fy + 1, 1, 1);
        ctx.fillRect(fx, fy + 3, 1, 1);
      } else {
        // DEFAULT Safari (Red glossy apple)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(fx, fy + 1, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        // Apple stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 2);
        ctx.lineTo(fx + 2, fy - 6);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Draw Special Bonus Food (if active)
    if (specialFood) {
      const sfx = (specialFood.x + 0.5) * cellSize;
      const sfy = (specialFood.y + 0.5) * cellSize;
      const radius = cellSize * 0.45;

      ctx.save();
      const wave = Math.sin(Date.now() / 100) * 0.1;
      const sizeMultiplier = 1 + wave;

      if (theme.id === 'NOKIA_CLASSIC') {
        ctx.fillStyle = '#1c2415';
        ctx.lineWidth = 1.5;
        // Large hollow diamond shape
        ctx.beginPath();
        ctx.moveTo(sfx, sfy - radius);
        ctx.lineTo(sfx + radius, sfy);
        ctx.lineTo(sfx, sfy + radius);
        ctx.lineTo(sfx - radius, sfy);
        ctx.closePath();
        ctx.stroke();
        // Solid dot in center
        ctx.beginPath();
        ctx.arc(sfx, sfy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Neon rotating golden star
        ctx.shadowColor = '#fbbf24'; // Amber-400
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#fbbf24';

        // Draw star path
        ctx.beginPath();
        const spikes = 5;
        const outerRad = radius * sizeMultiplier;
        const innerRad = radius * 0.4 * sizeMultiplier;
        let rot = (Date.now() / 400) % (Math.PI * 2);
        let cx = sfx;
        let cy = sfy;
        let step = Math.PI / spikes;

        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerRad : innerRad;
          const px = cx + Math.cos(rot) * r;
          const py = cy + Math.sin(rot) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          rot += step;
        }
        ctx.closePath();
        ctx.fill();

        // Draw an elegant circular timer ring around special food
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sfx, sfy, radius * 1.5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (specialFoodTimer / 100)), false);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Snake
    if (snake.length > 0) {
      snake.forEach((segment, idx) => {
        const sx = segment.x * cellSize;
        const sy = segment.y * cellSize;
        const pad = idx === 0 ? 0.5 : 1; // Snug fitting blocks
        const widthCell = cellSize - pad * 2;
        const heightCell = cellSize - pad * 2;

        ctx.save();

        if (theme.id === 'NOKIA_CLASSIC') {
          // Absolute blocky retro pixels
          ctx.fillStyle = '#1c2415';
          ctx.fillRect(sx + pad, sy + pad, widthCell, heightCell);
          // Empty grid borders so we see segments distinctly like Nokia 3310
          ctx.strokeStyle = '#c9d4ba';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx + pad, sy + pad, widthCell, heightCell);

          // Head features
          if (idx === 0) {
            ctx.fillStyle = '#1c2415';
            // Eyes
            const cx = sx + cellSize / 2;
            const cy = sy + cellSize / 2;
            ctx.fillStyle = '#c9d4ba';
            if (direction === 'LEFT' || direction === 'RIGHT') {
              ctx.fillRect(cx - 1, cy - 3, 2, 2);
              ctx.fillRect(cx - 1, cy + 1, 2, 2);
            } else {
              ctx.fillRect(cx - 3, cy - 1, 2, 2);
              ctx.fillRect(cx + 1, cy - 1, 2, 2);
            }
          }
        } else {
          // Colorful and smooth canvas styling
          if (idx === 0) {
            // SNAKE HEAD
            if (snakeStyle === 'RAINBOW') {
              // Brilliantly glowing golden core for the rainbow snake head
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 12;
            } else if (snakeStyle === 'SOLID') {
              let solidColor = '#10b981';
              if (theme.id === 'RETRO_ARCADE') solidColor = '#10b981';
              else if (theme.id === 'CYBERPUNK') solidColor = '#06b6d4';
              else if (theme.id === 'CANDY') solidColor = '#ec4899';
              else if (theme.id === 'CANDY_MINT') solidColor = '#10b981';
              else if (theme.id === 'CANDY_LEMON') solidColor = '#eab308';
              else if (theme.id === 'JUNGLE_NIGHT') solidColor = '#4f46e5';
              else solidColor = '#15803d'; // JUNGLE
              ctx.fillStyle = solidColor;
              ctx.shadowBlur = 0;
            } else if (snakeStyle === 'TEXTURED') {
              let headColor = '#047857';
              if (theme.id === 'RETRO_ARCADE') headColor = '#065f46';
              else if (theme.id === 'CYBERPUNK') headColor = '#0e7490';
              else if (theme.id === 'CANDY') headColor = '#be185d';
              else if (theme.id === 'CANDY_MINT') headColor = '#065f46';
              else if (theme.id === 'CANDY_LEMON') headColor = '#b45309';
              else if (theme.id === 'JUNGLE_NIGHT') headColor = '#312e81';
              else headColor = '#166534'; // JUNGLE
              ctx.fillStyle = headColor;
              ctx.shadowBlur = 0;
            } else {
              // THEMED Style - original code
              if (theme.id === 'RETRO_ARCADE') {
                ctx.fillStyle = '#34d399'; // emerald-400
                ctx.shadowColor = '#34d399';
                ctx.shadowBlur = 10;
              } else if (theme.id === 'CYBERPUNK') {
                ctx.fillStyle = '#22d3ee'; // cyan-400
                ctx.shadowColor = '#22d3ee';
                ctx.shadowBlur = 12;
              } else if (theme.id === 'CANDY') {
                ctx.fillStyle = '#d8b4fe'; // purple-300
                ctx.shadowColor = '#f472b6';
                ctx.shadowBlur = 6;
              } else if (theme.id === 'CANDY_MINT') {
                ctx.fillStyle = '#34d399'; // mint green-400
                ctx.shadowColor = '#047857';
                ctx.shadowBlur = 4;
              } else if (theme.id === 'CANDY_LEMON') {
                ctx.fillStyle = '#fef08a'; // light yellow-200
                ctx.shadowColor = '#eab308';
                ctx.shadowBlur = 6;
              } else if (theme.id === 'JUNGLE_NIGHT') {
                ctx.fillStyle = '#2dd4bf'; // teal-400
                ctx.shadowColor = '#2dd4bf';
                ctx.shadowBlur = 8;
              } else {
                ctx.fillStyle = '#a3e635'; // lime-400 (JUNGLE)
              }
            }

            // Draw rounded head towards heading direction
            ctx.beginPath();
            const rad = 7; // rounding amount
            if (direction === 'UP') {
              ctx.roundRect(sx + pad, sy + pad, widthCell, heightCell, [rad, rad, 2, 2]);
            } else if (direction === 'DOWN') {
              ctx.roundRect(sx + pad, sy + pad, widthCell, heightCell, [2, 2, rad, rad]);
            } else if (direction === 'LEFT') {
              ctx.roundRect(sx + pad, sy + pad, widthCell, heightCell, [rad, 2, 2, rad]);
            } else {
              ctx.roundRect(sx + pad, sy + pad, widthCell, heightCell, [2, rad, rad, 2]);
            }
            ctx.fill();

            // Draw cute snake eyes
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000000';
            const hx = sx + cellSize / 2;
            const hy = sy + cellSize / 2;
            const offset = cellSize * 0.22;
            
            ctx.beginPath();
            if (direction === 'UP') {
              ctx.arc(hx - offset, hy - offset, 2.5, 0, Math.PI * 2);
              ctx.arc(hx + offset, hy - offset, 2.5, 0, Math.PI * 2);
            } else if (direction === 'DOWN') {
              ctx.arc(hx - offset, hy + offset, 2.5, 0, Math.PI * 2);
              ctx.arc(hx + offset, hy + offset, 2.5, 0, Math.PI * 2);
            } else if (direction === 'LEFT') {
              ctx.arc(hx - offset, hy - offset, 2.5, 0, Math.PI * 2);
              ctx.arc(hx - offset, hy + offset, 2.5, 0, Math.PI * 2);
            } else {
              ctx.arc(hx + offset, hy - offset, 2.5, 0, Math.PI * 2);
              ctx.arc(hx + offset, hy + offset, 2.5, 0, Math.PI * 2);
            }
            ctx.fill();

            // White glint in the eye for high craftsmanship!
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            if (direction === 'UP') {
              ctx.arc(hx - offset - 0.5, hy - offset - 0.5, 1, 0, Math.PI * 2);
              ctx.arc(hx + offset - 0.5, hy - offset - 0.5, 1, 0, Math.PI * 2);
            } else if (direction === 'DOWN') {
              ctx.arc(hx - offset - 0.5, hy + offset - 0.5, 1, 0, Math.PI * 2);
              ctx.arc(hx + offset - 0.5, hy + offset - 0.5, 1, 0, Math.PI * 2);
            } else if (direction === 'LEFT') {
              ctx.arc(hx - offset - 0.5, hy - offset - 0.5, 1, 0, Math.PI * 2);
              ctx.arc(hx - offset - 0.5, hy + offset - 0.5, 1, 0, Math.PI * 2);
            } else {
              ctx.arc(hx + offset - 0.5, hy - offset - 0.5, 1, 0, Math.PI * 2);
              ctx.arc(hx + offset - 0.5, hy + offset - 0.5, 1, 0, Math.PI * 2);
            }
            ctx.fill();

            // Cute flickering red snake tongue
            if (Math.floor(Date.now() / 200) % 2 === 0) {
              ctx.strokeStyle = '#ef4444'; // Red tongue
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              if (direction === 'UP') {
                ctx.moveTo(hx, sy);
                ctx.lineTo(hx, sy - 4);
                ctx.moveTo(hx, sy - 4);
                ctx.lineTo(hx - 2, sy - 6);
                ctx.moveTo(hx, sy - 4);
                ctx.lineTo(hx + 2, sy - 6);
              } else if (direction === 'DOWN') {
                ctx.moveTo(hx, sy + cellSize);
                ctx.lineTo(hx, sy + cellSize + 4);
                ctx.moveTo(hx, sy + cellSize + 4);
                ctx.lineTo(hx - 2, sy + cellSize + 6);
                ctx.moveTo(hx, sy + cellSize + 4);
                ctx.lineTo(hx + 2, sy + cellSize + 6);
              } else if (direction === 'LEFT') {
                ctx.moveTo(sx, hy);
                ctx.lineTo(sx - 4, hy);
                ctx.moveTo(sx - 4, hy);
                ctx.lineTo(sx - 6, hy - 2);
                ctx.moveTo(sx - 4, hy);
                ctx.lineTo(sx - 6, hy + 2);
              } else {
                ctx.moveTo(sx + cellSize, hy);
                ctx.lineTo(sx + cellSize + 4, hy);
                ctx.moveTo(sx + cellSize + 4, hy);
                ctx.lineTo(sx + cellSize + 6, hy - 2);
                ctx.moveTo(sx + cellSize + 4, hy);
                ctx.lineTo(sx + cellSize + 6, hy + 2);
              }
              ctx.stroke();
            }

          } else {
            // SNAKE BODY
            if (snakeStyle === 'RAINBOW') {
              const hue = (idx * 16 + Date.now() / 20) % 360;
              ctx.fillStyle = `hsla(${hue}, 90%, 50%, 1)`;
              ctx.shadowColor = `hsla(${hue}, 90%, 50%, 0.4)`;
              ctx.shadowBlur = 4;
            } else if (snakeStyle === 'SOLID') {
              let solidColor = '#10b981';
              if (theme.id === 'RETRO_ARCADE') solidColor = '#10b981';
              else if (theme.id === 'CYBERPUNK') solidColor = '#06b6d4';
              else if (theme.id === 'CANDY') solidColor = '#f472b6';
              else if (theme.id === 'CANDY_MINT') solidColor = '#10b981';
              else if (theme.id === 'CANDY_LEMON') solidColor = '#facc15';
              else if (theme.id === 'JUNGLE_NIGHT') solidColor = '#6366f1';
              else solidColor = '#15803d'; // JUNGLE
              ctx.fillStyle = solidColor;
              ctx.shadowBlur = 0;
            } else if (snakeStyle === 'TEXTURED') {
              let baseColor = '#15803d';
              if (theme.id === 'RETRO_ARCADE') baseColor = '#065f46';
              else if (theme.id === 'CYBERPUNK') baseColor = '#0e7490';
              else if (theme.id === 'CANDY') baseColor = '#be185d';
              else if (theme.id === 'CANDY_MINT') baseColor = '#065f46';
              else if (theme.id === 'CANDY_LEMON') baseColor = '#b45309';
              else if (theme.id === 'JUNGLE_NIGHT') baseColor = '#312e81';
              else baseColor = '#166534'; // JUNGLE
              ctx.fillStyle = baseColor;
              ctx.shadowBlur = 0;
            } else {
              // THEMED Style - original code
              if (theme.id === 'RETRO_ARCADE') {
                ctx.fillStyle = '#10b981'; // emerald-500
                const opacity = Math.max(0.3, 1 - (idx / snake.length) * 0.7);
                ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
                ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
                ctx.shadowBlur = 4;
              } else if (theme.id === 'CYBERPUNK') {
                const hue = (180 + (idx * 3)) % 360; // Shifting gradient along snake length!
                ctx.fillStyle = `hsla(${hue}, 90%, 50%, ${Math.max(0.4, 1 - idx / snake.length)})`;
                ctx.shadowColor = `hsla(${hue}, 90%, 50%, 0.3)`;
                ctx.shadowBlur = 6;
              } else if (theme.id === 'CANDY') {
                ctx.fillStyle = idx % 2 === 0 ? '#f472b6' : '#c084fc';
              } else if (theme.id === 'CANDY_MINT') {
                ctx.fillStyle = idx % 2 === 0 ? '#10b981' : '#78350f';
              } else if (theme.id === 'CANDY_LEMON') {
                ctx.fillStyle = idx % 2 === 0 ? '#facc15' : '#38bdf8';
              } else if (theme.id === 'JUNGLE_NIGHT') {
                ctx.fillStyle = '#6366f1'; // indigo-500
                ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
                ctx.shadowBlur = 3;
              } else {
                ctx.fillStyle = idx % 2 === 0 ? '#15803d' : '#22c55e'; // alternating greens
              }
            }

            // Draw rounded body segments
            ctx.beginPath();
            ctx.roundRect(sx + pad, sy + pad, widthCell, heightCell, 5);
            ctx.fill();

            // Custom patterns/texture overlay drawn directly inside the segment
            ctx.shadowBlur = 0;
            if (snakeStyle === 'TEXTURED') {
              let textureColor = '#4ade80';
              if (theme.id === 'RETRO_ARCADE') textureColor = '#34d399';
              else if (theme.id === 'CYBERPUNK') textureColor = '#22d3ee';
              else if (theme.id === 'CANDY') textureColor = '#f472b6';
              else if (theme.id === 'CANDY_MINT') textureColor = '#a7f3d0';
              else if (theme.id === 'CANDY_LEMON') textureColor = '#fef08a';
              else if (theme.id === 'JUNGLE_NIGHT') textureColor = '#818cf8';
              else textureColor = '#a3e635'; // JUNGLE
              
              ctx.strokeStyle = textureColor;
              ctx.globalAlpha = 0.5;
              ctx.lineWidth = 1;
              ctx.beginPath();
              // Slanted overlapping diamond scales
              ctx.moveTo(sx + pad, sy + pad + heightCell * 0.5);
              ctx.lineTo(sx + pad + widthCell * 0.5, sy + pad);
              ctx.lineTo(sx + pad + widthCell, sy + pad + heightCell * 0.5);
              ctx.lineTo(sx + pad + widthCell * 0.5, sy + pad + heightCell);
              ctx.closePath();
              ctx.stroke();

              // Center bead/scale highlight
              ctx.fillStyle = textureColor;
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              ctx.arc(sx + cellSize / 2, sy + cellSize / 2, 1.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
            } else if (snakeStyle === 'THEMED') {
              if (theme.id === 'CANDY' || theme.id === 'CANDY_LEMON' || theme.id === 'CANDY_MINT') {
                // White candy sprinkles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(sx + pad + 2, sy + pad + 2, 2, 2);
                ctx.fillRect(sx + pad + widthCell - 4, sy + pad + heightCell - 4, 1.5, 1.5);
              } else if (theme.id === 'JUNGLE') {
                // Python yellow diamond spots
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(sx + cellSize / 2, sy + cellSize / 2, 2, 0, Math.PI * 2);
                ctx.fill();
              } else if (theme.id === 'JUNGLE_NIGHT') {
                // Glowing bioluminescent cyan spots
                ctx.fillStyle = '#34d399';
                ctx.beginPath();
                ctx.arc(sx + cellSize / 2, sy + cellSize / 2, 2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
        ctx.restore();
      });
    }

    // 6. Draw dynamic floating particle explosion effects!
    ctx.save();
    particlesRef.current.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // drag
      p.vy *= 0.96;
      p.life -= 0.03; // decay

      if (p.life <= 0) {
        particlesRef.current.splice(idx, 1);
        return;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Loop renderer for animation state (timer rings, portal pulses, particle physics)
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
    };

  }, [dimensions, snake, food, specialFood, specialFoodTimer, obstacles, portals, theme, gridSize, direction, score]);

  return (
    <div ref={containerRef} className="w-full relative aspect-square flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        className="block rounded-lg overflow-hidden transition-all duration-150 border border-zinc-950/20"
      />
    </div>
  );
}
