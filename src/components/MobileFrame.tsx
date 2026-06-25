import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldAlert, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  themeClass?: string;
}

export default function MobileFrame({ children, themeClass = 'bg-zinc-950' }: MobileFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="android-device-root" className="min-h-screen bg-zinc-900 flex items-center justify-center p-0 md:p-6 select-none overflow-x-hidden">
      {/* Smartphone frame - only renders as a frame on md screen sizes and above */}
      <div 
        id="android-phone-bezel"
        className="relative w-full h-screen md:w-[410px] md:h-[840px] md:rounded-[48px] md:border-[12px] md:border-zinc-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-black flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Android Notch / Punch hole camera */}
        <div id="android-notch" className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 rounded-full z-50 border border-zinc-800/80 shadow-inner" />

        {/* Dynamic Status Bar */}
        <div 
          id="android-status-bar" 
          className="h-9 px-6 pt-1 flex items-center justify-between text-xs font-mono font-medium text-zinc-400 select-none z-40 bg-black/40 backdrop-blur-sm"
        >
          <div id="status-left" className="flex items-center gap-1">
            <span>{time}</span>
          </div>
          {/* Speaker grill area for realism / status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-900/80 text-[10px] text-zinc-500 scale-90 border border-zinc-800">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            <span>SNAKE OS v2.0</span>
          </div>
          <div id="status-right" className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">100%</span>
              <Battery className="w-4 h-4 rotate-90 scale-90 -mr-0.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen Content Wrapper */}
        <div id="android-screen-content" className={`flex-1 flex flex-col relative overflow-hidden ${themeClass}`}>
          {children}
        </div>

        {/* Android Virtual Navigation Gestures Bar (adds high-fidelity mobile charm) */}
        <div 
          id="android-nav-bar" 
          className="h-10 bg-black/60 backdrop-blur-xs flex items-center justify-around text-zinc-500 text-xs border-t border-zinc-950/40 z-40"
        >
          {/* Back key triangle */}
          <button 
            id="android-back-btn" 
            className="p-2 active:scale-95 transition-transform hover:text-zinc-300"
            onClick={() => {
              // Trigger a generic back action via standard keyboard Escape dispatch
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }}
          >
            <svg className="w-4 h-4 fill-current rotate-270" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          {/* Home key circle */}
          <button 
            id="android-home-btn" 
            className="p-2 active:scale-95 transition-transform hover:text-zinc-300"
            onClick={() => {
              // Trigger keydown with Home
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
          </button>

          {/* Overview key square */}
          <button 
            id="android-overview-btn" 
            className="p-2 active:scale-95 transition-transform hover:text-zinc-300"
            onClick={() => {
              // Toggle menu/settings helper via 'p' for pause or settings shortcut
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
            }}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
