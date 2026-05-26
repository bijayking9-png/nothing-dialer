import React, { useState } from 'react';
import { Search, Info, PhoneCall, ArrowDownLeft, ArrowUpRight, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CallLog, ThemeMode } from '../types';
import SafeAvatarImage from './SafeAvatarImage';

interface RecentsViewProps {
  theme: ThemeMode;
  callLogs: CallLog[];
  onStartCall: (number: string) => void;
  onSelectInfo: (log: CallLog) => void;
}

export default function RecentsView({
  theme,
  callLogs,
  onStartCall,
  onSelectInfo,
}: RecentsViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Local filtering logic
  const filteredLogs = callLogs.filter(log => {
    const matchesFilter = filterMode === 'all' || log.type === 'missed';
    const matchesQuery = 
      (log.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.number.includes(searchQuery));
    return matchesFilter && matchesQuery;
  });

  // Helper groupings
  const todayLogs = filteredLogs.filter(log => log.time.includes('AM') || log.time.includes('PM') || log.time.includes('ago'));
  const yesterdayLogs = filteredLogs.filter(log => log.time.toLowerCase().includes('yesterday'));
  const olderLogs = filteredLogs.filter(log => !todayLogs.includes(log) && !yesterdayLogs.includes(log));

  const renderLogGroup = (title: string, logs: CallLog[]) => {
    if (logs.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
            {title}
          </span>
          <div className="h-[1px] flex-grow bg-white/10 dark:bg-white/5" />
        </div>

        <div className="divide-y divide-white/5">
          {logs.map((log) => {
            const isMissed = log.type === 'missed';
            return (
              <motion.div
                key={log.id}
                layoutId={`log-${log.id}`}
                className="group flex items-center justify-between py-4 hover:bg-white/5 dark:hover:bg-white/5 rounded-xl px-3 transition-colors cursor-pointer"
                onClick={() => onStartCall(log.number)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar / Initials container */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-white/10 flex items-center justify-center">
                    <SafeAvatarImage
                      src={log.image}
                      alt={log.name || log.number}
                      className="w-full h-full object-cover grayscale contrast-125"
                      fallback={
                        <span className="text-sm font-medium text-neutral-400 font-mono">
                          {log.name ? log.name.split(' ').map(n => n[0]).join('') : '#'}
                        </span>
                      }
                    />
                  </div>

                  {/* Call Meta Detail */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-sans text-base font-semibold ${
                        isMissed ? 'text-red-400 font-medium' : 'text-neutral-100'
                      }`}>
                        {log.name || log.number}
                      </h3>
                      {log.count && log.count > 1 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                          isMissed ? 'bg-red-400/20 text-red-300' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {log.count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {log.type === 'missed' && (
                        <ArrowDownLeft size={13} className="text-red-400 stroke-[3]" />
                      )}
                      {log.type === 'received' && (
                        <ArrowDownLeft size={13} className="text-green-400" />
                      )}
                      {log.type === 'made' && (
                        <ArrowUpRight size={13} className="text-neutral-400" />
                      )}
                      <p className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide">
                        {log.label} • {log.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info side click trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectInfo(log);
                  }}
                  className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Info size={18} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 pt-4">
      {/* Search Header */}
      <div className="mb-4">
        <div className="relative bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 flex items-center px-4 py-3 shadow-lg focus-within:border-white/20 transition-all">
          <Search size={18} className="text-neutral-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-neutral-500 text-white"
            placeholder="Search recent calls..."
          />
        </div>
      </div>

      {/* Filter Mode Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer font-medium border
            ${
              filterMode === 'all'
                ? 'bg-white text-black border-white'
                : 'bg-neutral-900/50 text-neutral-400 border-white/5 hover:bg-neutral-800'
            }`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilterMode('missed')}
          className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer font-medium border
            ${
              filterMode === 'missed'
                ? 'bg-red-500/25 text-red-300 border-red-500/30'
                : 'bg-neutral-900/50 text-neutral-400 border-white/5 hover:bg-neutral-800'
            }`}
        >
          MISSED
        </button>
      </div>

      {/* Group Lists */}
      <div className="flex-1 overflow-y-auto pb-4 pr-1">
        <AnimatePresence mode="popLayout">
          {filteredLogs.length > 0 ? (
            <div key="recents-list">
              {renderLogGroup('Today', todayLogs)}
              {renderLogGroup('Yesterday', yesterdayLogs)}
              {renderLogGroup('Older Activity', olderLogs)}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center text-neutral-400"
            >
              <Ban size={48} className="mb-4 text-neutral-500" />
              <p className="font-mono text-xs uppercase tracking-widest leading-relaxed">
                No recent activity matched
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
