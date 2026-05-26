import React, { useState, useMemo, useRef } from 'react';
import { Search, ChevronRight, User, Plus, Edit3, Video, Copy, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, ThemeMode } from '../types';
import { MY_PROFILE } from '../data';
import SafeAvatarImage from './SafeAvatarImage';

interface ContactsViewProps {
  theme: ThemeMode;
  contacts: Contact[];
  onStartCall: (number: string) => void;
  onAddNewContact: () => void;
  onOpenSelfProfile: () => void;
  firebaseUser?: any;
  onGoogleSignIn?: () => void;
  onGoogleLogout?: () => void;
  isWorkspaceSyncing?: boolean;
  onCreateMeet?: () => void;
  meetLink?: string | null;
  onClearMeet?: () => void;
}

export default function ContactsView({
  theme,
  contacts,
  onStartCall,
  onAddNewContact,
  onOpenSelfProfile,
  firebaseUser,
  onGoogleSignIn,
  onGoogleLogout,
  isWorkspaceSyncing,
  onCreateMeet,
  meetLink,
  onClearMeet,
}: ContactsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter contacts based on query
  const filteredContacts = contacts.filter(contact => {
    const matchesName = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNum = contact.number.includes(searchQuery);
    return matchesName || matchesNum;
  });

  // Group contacts alphabetically 
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    filteredContacts.forEach(contact => {
      const char = contact.group || contact.name[0].toUpperCase();
      if (!groups[char]) {
        groups[char] = [];
      }
      groups[char].push(contact);
    });
    // Sort keys
    const sortedGroups: Record<string, Contact[]> = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    return sortedGroups;
  }, [filteredContacts]);

  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const scrollToLetter = (letter: string) => {
    const element = scrollerRefs.current[letter];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full max-w-2xl mx-auto px-4 pt-4 pb-12">
      {/* Search Header */}
      <div className="mb-4">
        <div className="relative bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 flex items-center px-4 py-3 shadow-lg focus-within:border-white/20 transition-all">
          <Search size={18} className="text-neutral-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-500 text-white"
            placeholder="Search contacts..."
          />
        </div>
      </div>

      {/* Google Workspace Integration Panel */}
      <div className="mb-6 bg-neutral-900/30 border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Workspace Core
            </p>
          </div>
          {firebaseUser && (
            <button
              onClick={onGoogleLogout}
              className="text-[10px] font-mono font-medium hover:text-red-400 cursor-pointer text-neutral-500 underline"
            >
              Sign Out
            </button>
          )}
        </div>

        {!firebaseUser ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-medium text-sm text-neutral-100 flex items-center gap-1.5">
                Cloud Contacts & Instant Google Meet
              </h3>
              <p className="font-sans text-xs text-neutral-400 mt-1 max-w-sm leading-relaxed">
                Connect your Google Account to sync contacts, backup call logs in real-time, and launch Google Meet videoconferences.
              </p>
            </div>
            <button
              onClick={onGoogleSignIn}
              className="flex items-center justify-center gap-3 bg-white text-neutral-800 hover:bg-neutral-50 px-4 py-2 rounded-xl font-sans font-semibold text-xs transition-all border border-neutral-300 shadow-sm cursor-pointer select-none active:scale-95 w-full sm:w-auto"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 flex-shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sync with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-white/10">
                  <SafeAvatarImage
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'G'}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-white bg-red-600">
                        {firebaseUser.displayName?.[0] || 'G'}
                      </div>
                    }
                  />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs text-neutral-100">
                    {firebaseUser.displayName || 'Google Account'}
                  </h4>
                  <p className="font-mono text-[9px] text-neutral-400 lowercase">
                    {firebaseUser.email}
                  </p>
                </div>
              </div>

              {isWorkspaceSyncing ? (
                <span className="text-[10px] font-mono text-neutral-500 animate-pulse">Syncing...</span>
              ) : (
                <span className="text-[10px] font-mono text-green-500">Cloud Connected</span>
              )}
            </div>

            {/* Meet generation section */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Video size={18} className="text-red-500 flex-shrink-0" />
                <div>
                  <h5 className="font-display font-medium text-xs text-neutral-200 font-bold">Instant Google Meet Videoconference</h5>
                  <p className="font-sans text-[10px] text-neutral-400 mt-0.5">Generate a dedicated encrypted meeting space.</p>
                </div>
              </div>

              {meetLink ? (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    readOnly
                    value={meetLink}
                    className="bg-neutral-950 px-2 py-1.5 rounded border border-white/10 font-mono text-[9px] text-neutral-300 w-full md:w-32 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meetLink);
                      alert("Successfully copied meeting link to clipboard!");
                    }}
                    className="p-1.5 rounded bg-neutral-800 border border-white/10 hover:bg-neutral-700 cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy size={12} className="text-neutral-300" />
                  </button>
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-red-600 hover:bg-red-500 cursor-pointer"
                    title="Join Meeting"
                  >
                    <ExternalLink size={12} className="text-white" />
                  </a>
                  <button
                    onClick={onClearMeet}
                    className="p-1.5 rounded bg-neutral-800 border border-white/10 hover:bg-neutral-700 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={12} className="text-neutral-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onCreateMeet}
                  disabled={isWorkspaceSyncing}
                  className="w-full md:w-auto px-3 py-1.5 bg-neutral-800 border border-white/10 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 flex items-center justify-center gap-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer"
                >
                  <Video size={14} className="text-red-500" /> CREATE SPACE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile quick access card */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onOpenSelfProfile}
        className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4 bg-white/[0.03] border border-white/10 dark:border-white/5 cursor-pointer shadow-lg"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border border-white/15 flex items-center justify-center flex-shrink-0 shadow-inner">
          <SafeAvatarImage 
            src={MY_PROFILE.image} 
            alt={MY_PROFILE.name} 
            className="w-full h-full object-cover grayscale contrast-125"
            fallback={<span className="text-[14px] font-mono font-medium text-white">MU</span>}
          />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-neutral-100">{MY_PROFILE.name}</h2>
          <p className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">My Profile</p>
        </div>
        <ChevronRight size={18} className="text-neutral-400" />
      </motion.div>

      {/* Contacts Lists Column */}
      <div className="flex-1 overflow-y-auto pb-16 scroll-smooth pr-6">
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedContacts).length > 0 ? (
            Object.entries(groupedContacts).map(([letter, items]) => (
              <div 
                key={letter} 
                ref={el => scrollerRefs.current[letter] = el}
                className="mb-6 scroll-mt-2"
              >
                {/* Visual Header Grid for alphabetical grouping */}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-[36px] h-[36px] flex items-center justify-center rounded-lg border border-white/10 dark:border-white/5 font-mono text-sm font-bold text-white shadow-inner bg-neutral-900/60
                    ${theme === 'dark' ? 'dot-matrix-bg' : 'dot-matrix-bg-light'}`}>
                    {letter}
                  </div>
                  <div className="h-[1.5px] flex-grow bg-white/10 dark:bg-white/5" />
                </div>

                <div className="divide-y divide-white/5 bg-white/[0.015] border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                  {(items as Contact[]).map((contact) => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ x: 2, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                      onClick={() => onStartCall(contact.number)}
                      className="group flex items-center justify-between p-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar Image details */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <SafeAvatarImage
                            src={contact.image}
                            alt={contact.name}
                            className="w-full h-full object-cover grayscale contrast-125"
                            fallback={
                              <span className="text-xs font-bold font-mono text-neutral-300">
                                {contact.initials}
                              </span>
                            }
                          />
                        </div>

                        <div>
                          <p className="font-sans text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                            {contact.name}
                          </p>
                          <p className="font-mono text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                            {contact.label} • {contact.number}
                          </p>
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
              <User size={40} className="mb-4" />
              <p className="font-mono text-xs uppercase tracking-widest leading-relaxed">No matching contacts</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Alphabet Scroller bar overlay */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-20 px-1 py-4 bg-black/40 backdrop-blur-md rounded-full border border-white/5 shadow-lg max-h-[80%] overflow-y-auto">
        {alphabet.map((letter) => {
          const hasContacts = groupedContacts[letter] !== undefined;
          return (
            <button
              key={letter}
              onClick={() => scrollToLetter(letter)}
              className={`font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all hover:scale-125 cursor-pointer
                ${
                  hasContacts
                    ? 'text-white font-black bg-neutral-800/80 scale-105'
                    : 'text-neutral-600 font-normal hover:text-neutral-400'
                }`}
              disabled={!hasContacts}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* High Contrast FAB positioned at bottom right */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={onAddNewContact}
        className="fixed bottom-24 right-5 w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-xl shadow-red-950/20 flex items-center justify-center cursor-pointer border border-white/10 z-30"
        title="Add new contact"
      >
        <Plus size={28} className="stroke-[2.5]" />
      </motion.button>
    </div>
  );
}
