import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Delete, Phone, UserPlus } from 'lucide-react';
import { Contact, ThemeMode } from '../types';
import { playDtmfTone, triggerHaptic } from '../utils/audio';
import SafeAvatarImage from './SafeAvatarImage';

interface KeypadViewProps {
  theme: ThemeMode;
  contacts: Contact[];
  currentNumber: string;
  setCurrentNumber: React.Dispatch<React.SetStateAction<string>>;
  onStartCall: (number: string) => void;
  onAddNewContact: (initialNumber: string) => void;
}

export default function KeypadView({
  theme,
  contacts,
  currentNumber,
  setCurrentNumber,
  onStartCall,
  onAddNewContact,
}: KeypadViewProps) {
  const [matchedContact, setMatchedContact] = useState<Contact | null>(null);
  const backspaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zeroPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isZeroLongPressed = useRef<boolean>(false);

  // Search or match contact based on typed numbers
  useEffect(() => {
    if (!currentNumber) {
      setMatchedContact(null);
      return;
    }
    const cleanNum = currentNumber.replace(/\D/g, '');
    const found = contacts.find(c => {
      const contactClean = c.number.replace(/\D/g, '');
      return contactClean.includes(cleanNum) || c.number.includes(currentNumber);
    });
    setMatchedContact(found || null);
  }, [currentNumber, contacts]);

  const handleKeyPress = (digit: string) => {
    triggerHaptic();
    playDtmfTone(digit);
    setCurrentNumber(currentNumber + digit);
  };

  const handleBackspacePress = () => {
    triggerHaptic();
    setCurrentNumber(currentNumber.slice(0, -1));
  };

  // Clear all digits on long press
  const startBackspaceHold = () => {
    backspaceTimerRef.current = setTimeout(() => {
      triggerHaptic();
      setCurrentNumber('');
    }, 600);
  };

  const stopBackspaceHold = () => {
    if (backspaceTimerRef.current) {
      clearTimeout(backspaceTimerRef.current);
    }
  };

  // Long press on zero to input '+'
  const startZeroHold = () => {
    isZeroLongPressed.current = false;
    zeroPressTimerRef.current = setTimeout(() => {
      triggerHaptic();
      setCurrentNumber(currentNumber + '+');
      isZeroLongPressed.current = true;
    }, 600);
  };

  const stopZeroHold = () => {
    if (zeroPressTimerRef.current) {
      clearTimeout(zeroPressTimerRef.current);
    }
  };

  const handleZeroClick = () => {
    if (isZeroLongPressed.current) {
      isZeroLongPressed.current = false;
      return;
    }
    handleKeyPress('0');
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (backspaceTimerRef.current) clearTimeout(backspaceTimerRef.current);
      if (zeroPressTimerRef.current) clearTimeout(zeroPressTimerRef.current);
    };
  }, []);

  // Keyboard support for desktop view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9' || e.key === '*' || e.key === '#') {
        const targetBtn = document.getElementById(`btn-${e.key}`);
        targetBtn?.classList.add('scale-90', 'bg-white/10');
        setTimeout(() => targetBtn?.classList.remove('scale-90', 'bg-white/10'), 100);
        
        playDtmfTone(e.key);
        setCurrentNumber(currentNumber + e.key);
      } else if (e.key === 'Backspace') {
        setCurrentNumber(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter' && currentNumber) {
        onStartCall(currentNumber);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNumber, setCurrentNumber, onStartCall]);

  const keys = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' },
  ];

  return (
    <div className="flex flex-col items-center justify-between flex-1 w-full max-w-md mx-auto pt-4 pb-8 px-6">
      {/* Entered Number Display */}
      <div className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[140px]">
        {/* Dynamic dot grid matching theme background */}
        <div 
          className={`absolute inset-0 opacity-10 pointer-events-none rounded-2xl ${
            theme === 'dark' ? 'dot-matrix-bg' : 'dot-matrix-bg-light'
          }`}
        />
        
        <div className="w-full text-center px-4 z-10">
          <p className="font-display text-4xl font-bold tracking-widest break-all select-none min-h-[48px] text-primary">
            {currentNumber || ' '}
          </p>
        </div>

        {/* Contact Quick Match */}
        <div className="h-12 mt-4 z-10">
          <AnimatePresence>
            {currentNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-4 py-2 rounded-full border bg-neutral-900/40 backdrop-blur-md border-white/10 dark:border-white/5 shadow-lg active:scale-95 cursor-pointer"
                onClick={() => matchedContact && onStartCall(matchedContact.number)}
              >
                {matchedContact ? (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 flex items-center justify-center border border-white/10">
                      <SafeAvatarImage
                        src={matchedContact.image}
                        alt={matchedContact.name}
                        className="w-full h-full object-cover grayscale contrast-125"
                        fallback={
                          <span className="text-[10px] font-mono font-medium text-white">
                            {matchedContact.initials}
                          </span>
                        }
                      />
                    </div>
                    <span className="font-sans text-xs font-medium text-neutral-200 tracking-wide">
                      {matchedContact.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 flex-shrink-0">
                      <span className="text-[10px] text-white">?</span>
                    </div>
                    <span className="font-sans text-xs font-medium text-neutral-400 tracking-wide uppercase">
                      Unknown Contact
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-y-4 gap-x-8 px-4 mb-6 w-full max-w-sm justify-items-center">
        {keys.map((key) => {
          const isZero = key.num === '0';
          return (
            <motion.button
              key={key.num}
              id={`btn-${key.num}`}
              whileTap={{ scale: 0.9 }}
              onClick={isZero ? handleZeroClick : () => handleKeyPress(key.num)}
              onMouseDown={isZero ? startZeroHold : undefined}
              onMouseUp={isZero ? stopZeroHold : undefined}
              onMouseLeave={isZero ? stopZeroHold : undefined}
              onTouchStart={isZero ? startZeroHold : undefined}
              onTouchEnd={isZero ? stopZeroHold : undefined}
              className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none active:bg-white/20
                ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 border border-white/10 hover:bg-neutral-800' 
                    : 'bg-white border border-neutral-200 shadow-sm text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              <span className="font-display text-2xl font-semibold leading-normal">
                {key.num}
              </span>
              {key.letters && (
                <span className="font-sans text-[9px] font-semibold text-neutral-400 tracking-wider -mt-1 uppercase">
                  {key.letters}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Call Actions */}
      <div className="w-full max-w-xs flex items-center justify-between px-6 pb-2">
        {/* Person Add Button */}
        <div className="w-12 h-12 flex items-center justify-center">
          <AnimatePresence>
            {currentNumber.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                onClick={() => onAddNewContact(currentNumber)}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors cursor-pointer border
                  ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-white/10 text-white hover:bg-neutral-800'
                      : 'bg-white border-neutral-200 text-neutral-900 shadow-sm hover:bg-neutral-50'
                  }`}
                title="Add to contacts"
              >
                <UserPlus size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Large green call button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => currentNumber && onStartCall(currentNumber)}
          className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition-transform cursor-pointer
            ${
              currentNumber.length > 0 
                ? 'bg-green-500 text-black hover:bg-green-400 hover:shadow-green-500/20 shadow-green-500/10' 
                : 'bg-neutral-800 text-neutral-500 opacity-40 cursor-not-allowed border border-white/10'
            }`}
        >
          <Phone size={28} fill={currentNumber.length > 0 ? "black" : "none"} />
        </motion.button>

        {/* Backspace Button */}
        <div className="w-12 h-12 flex items-center justify-center">
          <AnimatePresence>
            {currentNumber.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={handleBackspacePress}
                onMouseDown={startBackspaceHold}
                onMouseUp={stopBackspaceHold}
                onMouseLeave={stopBackspaceHold}
                onTouchStart={startBackspaceHold}
                onTouchEnd={stopBackspaceHold}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors cursor-pointer border
                  ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-white/10 text-white hover:bg-neutral-800'
                      : 'bg-white border-neutral-200 text-neutral-900 shadow-sm hover:bg-neutral-50'
                  }`}
                title="Backspace (Hold to clear)"
              >
                <Delete size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
