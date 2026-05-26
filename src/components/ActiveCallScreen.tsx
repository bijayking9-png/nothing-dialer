import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MicOff, Mic, Grid, Volume2, VolumeX, UserPlus, Video, Pause, Play, PhoneOff, MoreVertical, ChevronDown } from 'lucide-react';
import { ThemeMode } from '../types';
import { triggerHaptic } from '../utils/audio';
import SafeAvatarImage from './SafeAvatarImage';

interface ActiveCallScreenProps {
  theme: ThemeMode;
  number: string;
  contactName?: string;
  avatarImage?: string;
  onEndCall: (duration: string) => void;
}

export default function ActiveCallScreen({
  theme,
  number,
  contactName,
  avatarImage,
  onEndCall,
}: ActiveCallScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isHold, setIsHold] = useState(false);
  const [signalBars, setSignalBars] = useState(5);

  // Active Timer counting up
  useEffect(() => {
    if (isHold) return;
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isHold]);

  // Simulate network signal fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      let nextBars = 5;
      if (rand < 0.08) {
        nextBars = 2; // Rare drop
      } else if (rand < 0.25) {
        nextBars = 3; // Fair
      } else if (rand < 0.65) {
        nextBars = 4; // Good
      } else {
        nextBars = 5; // Excellent
      }
      setSignalBars(nextBars);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCallLocal = () => {
    triggerHaptic();
    onEndCall(formatTime(seconds));
  };

  const toggleMute = () => {
    triggerHaptic();
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    triggerHaptic();
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleHold = () => {
    triggerHaptic();
    setIsHold(!isHold);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 overflow-hidden h-screen select-none bg-black text-white`}>
      
      {/* Background Visual Element (Simulated depth with subtle gradients) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[140%] h-[70%] rounded-full opacity-20 blur-[130px] bg-gradient-to-b from-neutral-400/20 to-transparent" />
      </div>

      {/* Top Header Badge bar */}
      <header className="relative z-10 w-full flex justify-between items-center px-2 h-12">
        <button 
          onClick={handleEndCallLocal}
          className="p-2 hover:bg-white/10 active:scale-90 rounded-full transition-all cursor-pointer"
        >
          <ChevronDown size={22} className="text-neutral-400" />
        </button>
        
        {/* End-to-end Encrypted Secure Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <ShieldCheck size={14} className="text-green-400 fill-green-400/10" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#72fe88]">
            End-to-end encrypted
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <div id="status-bar-network" className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="font-mono text-[9px] font-bold tracking-wider text-[#72fe88]">5G</span>
            <div className="flex items-end gap-0.5 h-2.5 w-4 pb-[1px]" title={`Signal strength: ${signalBars}/5`}>
              {[1, 2, 3, 4, 5].map((index) => {
                const active = index <= signalBars;
                return (
                  <div
                    key={index}
                    className={`w-[1.5px] rounded-t-[1px] transition-all duration-300 ${
                      active ? 'bg-white' : 'bg-white/20'
                    }`}
                    style={{ height: `${index * 20}%` }}
                  />
                );
              })}
            </div>
          </div>

          <button className="p-2 hover:bg-white/10 rounded-full opacity-60">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Primary Caller Identity Section */}
      <section className="relative z-10 flex flex-col items-center text-center mt-4">
        <div className="relative mb-6">
          {/* Pulsing Outer Rings */}
          {!isHold && (
            <>
              <div className="absolute inset-0 bg-neutral-500 rounded-full animate-pulse-ring -m-4 opacity-10" />
              <div className="absolute inset-0 bg-neutral-600 rounded-full animate-pulse-ring -m-8 opacity-5 delay-300" />
            </>
          )}

          {/* Avatar Picture */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-neutral-900/40 outline outline-1 outline-white/10 overflow-hidden shadow-2xl bg-neutral-950 flex items-center justify-center">
            <SafeAvatarImage
              src={avatarImage}
              alt={contactName || number}
              className="w-full h-full object-cover grayscale contrast-125 brightness-95"
              fallback={
                <span className="text-4xl font-mono font-medium text-neutral-400 text-center uppercase tracking-widest">
                  {contactName ? contactName.split(' ').map(n => n[0]).join('') : '#'}
                </span>
              }
            />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-widest uppercase text-white mt-2">
          {contactName || 'UNKNOWN CALLER'}
        </h1>
        <p className="font-mono text-[11px] text-neutral-400 tracking-wider uppercase mt-1">
          {number}
        </p>

        {/* Dynamic Voice Call Quality Indicator */}
        <div id="call-connection-quality" className="flex items-center gap-1.5 mt-2 justify-center">
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
            signalBars === 5 ? 'bg-emerald-500 animate-pulse' :
            signalBars === 4 ? 'bg-emerald-500/80 animate-pulse' :
            signalBars === 3 ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
          }`} />
          <p className="font-mono text-[9px] text-neutral-400 tracking-widest uppercase">
            HD VOICE • {
              signalBars === 5 ? 'EXCELLENT CONNECTION' :
              signalBars === 4 ? 'GOOD CONNECTION' :
              signalBars === 3 ? 'FAIR CONNECTION' : 'POOR CONNECTION'
            }
          </p>
        </div>

        {/* Matrix Styled call timer badge */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-white">
            {isHold ? 'HELD' : formatTime(seconds)}
          </p>
        </div>
      </section>

      {/* Functional Call Controls glass container panel */}
      <section className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10 mt-auto">
        <div className="w-full bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-6 border border-white/10 dark:border-white/5 shadow-2xl">
          <div className="grid grid-cols-3 gap-y-8 gap-x-4">
            
            {/* Mute Button */}
            <button 
              onClick={toggleMute}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border
                ${
                  isMuted 
                    ? 'bg-white border-white text-black' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                Mute
              </span>
            </button>

            {/* Simulated Keypad Button */}
            <button className="flex flex-col items-center group opacity-40 cursor-not-allowed">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <Grid size={22} />
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                Keypad
              </span>
            </button>

            {/* Speaker Toggle */}
            <button 
              onClick={toggleSpeaker}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border
                ${
                  isSpeakerOn 
                    ? 'bg-white border-white text-black' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <Volume2 size={22} />
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                Speaker
              </span>
            </button>

            {/* Add Call Button */}
            <button className="flex flex-col items-center group opacity-40 cursor-not-allowed">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <UserPlus size={22} />
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                Add Call
              </span>
            </button>

            {/* Video Toggle */}
            <button className="flex flex-col items-center group opacity-40 cursor-not-allowed">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <Video size={22} />
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                Video
              </span>
            </button>

            {/* Hold Toggle */}
            <button 
              onClick={toggleHold}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border
                ${
                  isHold 
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-400 animate-pulse' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {isHold ? <Play size={22} /> : <Pause size={22} />}
              </div>
              <span className="mt-2.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                {isHold ? 'Resume' : 'Hold'}
              </span>
            </button>

          </div>
        </div>

        {/* End Call Circle Action */}
        <div className="flex justify-center w-full pb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEndCallLocal}
            className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/30 active:scale-90 transition-all cursor-pointer border border-white/10"
          >
            <PhoneOff size={24} className="stroke-[2.5]" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
