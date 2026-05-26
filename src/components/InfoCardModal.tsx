import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Trash2, Calendar, Clock, ShieldAlert, BadgeCheck } from 'lucide-react';
import { CallLog, Contact, ThemeMode } from '../types';
import { triggerHaptic } from '../utils/audio';
import SafeAvatarImage from './SafeAvatarImage';

interface InfoCardModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  selectedLog: CallLog | null;
  selectedContact: Contact | null;
  onStartCall: (number: string) => void;
  onDeleteLog?: (id: string) => void;
  onDeleteContact?: (id: string) => void;
}

export default function InfoCardModal({
  theme,
  isOpen,
  onClose,
  selectedLog,
  selectedContact,
  onStartCall,
  onDeleteLog,
  onDeleteContact,
}: InfoCardModalProps) {
  
  if (!selectedLog && !selectedContact) return null;

  const currentName = selectedContact?.name || selectedLog?.name || selectedLog?.number || 'Unknown';
  const currentNumber = selectedContact?.number || selectedLog?.number || '';
  const currentLabel = selectedContact?.label || selectedLog?.label || 'MOBILE';
  const currentImage = selectedContact?.image || selectedLog?.image;
  const initials = currentName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const handleCall = () => {
    triggerHaptic();
    onStartCall(currentNumber);
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic();
    if (selectedContact && onDeleteContact) {
      onDeleteContact(selectedContact.id);
    } else if (selectedLog && onDeleteLog) {
      onDeleteLog(selectedLog.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-[0px] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative z-10 w-full max-w-sm rounded-[32px] overflow-hidden border shadow-2xl p-6 flex flex-col items-center text-center
              ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-white/10 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
              }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer transition-colors
                ${
                  theme === 'dark'
                    ? 'hover:bg-neutral-800 text-neutral-400'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
            >
              <X size={18} />
            </button>

            {/* Profile Avatar section with pulsing overlay */}
            <div className="relative mt-4 mb-4">
              <div className="w-28 h-28 rounded-full border-2 border-white/10 overflow-hidden shadow-xl bg-neutral-950 flex items-center justify-center">
                <SafeAvatarImage
                  src={currentImage}
                  alt={currentName}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                  fallback={
                    <span className="text-3xl font-display font-medium text-neutral-400 font-mono">
                      {initials}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Contact Title */}
            <h2 className="font-display text-2xl font-bold tracking-tight uppercase leading-snug">
              {currentName}
            </h2>
            <p className="font-mono text-xs text-neutral-400 font-medium uppercase mt-1 tracking-wider">
              {currentLabel} • {currentNumber}
            </p>

            {/* Encrypt/Secured indicator */}
            <div className="flex items-center gap-1.5 mt-3 text-emerald-500 fill-emerald-500/10 font-mono text-[9px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <BadgeCheck size={12} className="stroke-[2.5]" />
              SECURED CONNECTION
            </div>

            {/* Additional details depending on view logs */}
            {selectedLog && (
              <div className={`w-full rounded-2xl p-4 mt-5 text-left border space-y-1.5
                ${
                  theme === 'dark'
                    ? 'bg-neutral-950/40 border-white/5'
                    : 'bg-neutral-50 border-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                  <Calendar size={12} />
                  <span>Call Details</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Timestamp</span>
                  <span className="font-semibold">{selectedLog.time}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Call Outcome</span>
                  <span className={`font-mono uppercase text-[10px] font-bold ${
                    selectedLog.type === 'missed' ? 'text-red-400' : 'text-neutral-300'
                  }`}>
                    {selectedLog.type}
                  </span>
                </div>
                {selectedLog.duration && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Duration</span>
                    <span className="font-mono font-semibold">{selectedLog.duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Practical Action items */}
            <div className="flex gap-3 w-full mt-6">
              {/* Call out quick dial button */}
              <button
                onClick={handleCall}
                className="flex-1 py-3 text-xs font-mono font-semibold tracking-widest rounded-2xl bg-green-500 text-black hover:bg-green-400 shadow-xl shadow-green-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={14} fill="black" />
                CALL
              </button>

              {/* Destructive Delete Button */}
              <button
                onClick={handleDelete}
                className={`py-3 px-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 duration-150
                  ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-white/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/20'
                      : 'bg-white border-neutral-200 text-red-500 hover:bg-red-50 shadow-sm'
                  }`}
                title="Delete this record"
              >
                <Trash2 size={16} />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
