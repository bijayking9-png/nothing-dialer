import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Check, Tag } from 'lucide-react';
import { ThemeMode } from '../types';
import { triggerHaptic } from '../utils/audio';

interface AddContactDialogProps {
  theme: ThemeMode;
  initialNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, number: string, label: string) => void;
}

export default function AddContactDialog({
  theme,
  initialNumber,
  isOpen,
  onClose,
  onSave,
}: AddContactDialogProps) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState(initialNumber);
  const [label, setLabel] = useState('MOBILE');
  const [error, setError] = useState('');

  // Sync initialNumber when it changes
  React.useEffect(() => {
    if (isOpen) {
      setNumber(initialNumber);
      setName('');
      setError('');
    }
  }, [isOpen, initialNumber]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!number.trim()) {
      setError('Phone number is required');
      return;
    }

    onSave(name.trim(), number.trim(), label);
    onClose();
  };

  const labels = ['MOBILE', 'WORK', 'HOME', 'UNKNOWN'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-[0px] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative z-10 w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl p-6
              ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-white/10 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
              }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Create Contact
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-full cursor-pointer transition-colors
                  ${
                    theme === 'dark'
                      ? 'hover:bg-neutral-800 text-neutral-400'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Full Name
                </label>
                <div className={`flex items-center px-4 py-3 rounded-2xl border transition-all focus-within:border-white/30
                  ${
                    theme === 'dark' 
                      ? 'bg-neutral-950/60 border-white/10' 
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <User size={18} className="text-neutral-500 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    autoFocus
                    placeholder="Aaron Smith"
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-500 text-inherit"
                  />
                </div>
              </div>

              {/* Number Field */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Phone Number
                </label>
                <div className={`flex items-center px-4 py-3 rounded-2xl border transition-all focus-within:border-white/30
                  ${
                    theme === 'dark' 
                      ? 'bg-neutral-950/60 border-white/10' 
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <Phone size={18} className="text-neutral-500 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setError('');
                    }}
                    placeholder="+1 555 0120"
                    className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-500 text-inherit"
                  />
                </div>
              </div>

              {/* Label Grouping */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Label Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {labels.map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setLabel(lbl);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all cursor-pointer font-medium border
                        ${
                          label === lbl
                            ? theme === 'dark'
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-white border-black'
                            : theme === 'dark'
                            ? 'bg-neutral-950/60 text-neutral-400 border-white/10 hover:bg-neutral-800'
                            : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                        }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Feedback */}
              {error && (
                <p className="text-xs font-mono text-red-400 text-center animate-shake">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-3 text-xs font-mono font-semibold tracking-widest rounded-2xl transition-colors cursor-pointer border
                    ${
                      theme === 'dark'
                        ? 'bg-neutral-800 border-white/10 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-mono font-semibold tracking-widest rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} className="stroke-[3]" />
                  SAVE
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
