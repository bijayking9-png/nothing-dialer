import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, MoreVertical, Search, History, Grid, User, Sliders, RefreshCw, PhoneCall, Heart, BadgeAlert, Sparkles, X, ChevronRight, Moon, Sun } from 'lucide-react';
import { Contact, CallLog, ThemeMode, ActiveTab } from './types';
import { INITIAL_CONTACTS, INITIAL_CALL_LOGS, MY_PROFILE } from './data';
import KeypadView from './components/KeypadView';
import RecentsView from './components/RecentsView';
import ContactsView from './components/ContactsView';
import ActiveCallScreen from './components/ActiveCallScreen';
import AddContactDialog from './components/AddContactDialog';
import InfoCardModal from './components/InfoCardModal';
import { triggerHaptic } from './utils/audio';

import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, initAuth, googleSignIn, logout, testConnection, handleFirestoreError, OperationType } from './utils/firebase';
import { createGoogleContact, createGoogleMeetMeeting, fetchGoogleContacts } from './utils/googleWorkspace';

export default function App() {
  // Theme & Layout Style Selection
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dialer-theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [aesthetic, setAesthetic] = useState<'nothing' | 'obsidian' | 'fluent'>(() => {
    const saved = localStorage.getItem('dialer-aesthetic');
    return (saved as 'nothing' | 'obsidian' | 'fluent') || 'nothing';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('keypad');
  const [currentNumber, setCurrentNumber] = useState('');

  // Primary State Stores lists (Hydrated from LocalStorage for seamless operation)
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('dialer-contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_CONTACTS;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem('dialer-calllogs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_CALL_LOGS;
  });

  // Call Overlays & Drawer controllers
  const [activeCall, setActiveCall] = useState<{
    number: string;
    name?: string;
    image?: string;
  } | null>(null);

  const [addContactOpen, setAddContactOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state lists with LocalStorage
  useEffect(() => {
    localStorage.setItem('dialer-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dialer-aesthetic', aesthetic);
  }, [aesthetic]);

  // Firebase & Workspace authentication state
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isWorkspaceSyncing, setIsWorkspaceSyncing] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  // Initialize auth trigger
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setGoogleAccessToken(token);
        setIsFirebaseReady(true);
      },
      () => {
        setFirebaseUser(null);
        setGoogleAccessToken(null);
        setIsFirebaseReady(true);
      }
    );
    testConnection(); // Verify connectivity in background
    return () => unsubscribe();
  }, []);

  // Sync state lists with LocalStorage when not logged in
  useEffect(() => {
    if (!firebaseUser) {
      localStorage.setItem('dialer-contacts', JSON.stringify(contacts));
    }
  }, [contacts, firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) {
      localStorage.setItem('dialer-calllogs', JSON.stringify(callLogs));
    }
  }, [callLogs, firebaseUser]);

  // Fetch / Sync Firestore and Google Contacts when authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const syncCloudData = async () => {
      setIsWorkspaceSyncing(true);
      try {
        // 1. Fetch Cloud Contacts from Firestore
        const contactsColl = collection(db, 'users', firebaseUser.uid, 'contacts');
        const contactsSnap = await getDocs(contactsColl).catch(err => {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}/contacts`);
          return null;
        });

        let loadedContacts: Contact[] = [];
        if (contactsSnap && !contactsSnap.empty) {
          contactsSnap.forEach(docSnap => {
            loadedContacts.push(docSnap.data() as Contact);
          });
        } else {
          // If empty, seed initial contacts to Firestore
          for (const c of INITIAL_CONTACTS) {
            const docRef = doc(db, 'users', firebaseUser.uid, 'contacts', c.id);
            await setDoc(docRef, { ...c, userId: firebaseUser.uid }).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/contacts/${c.id}`);
            });
          }
          loadedContacts = INITIAL_CONTACTS;
        }

        // 2. Fetch Call Logs from Firestore
        const logsColl = collection(db, 'users', firebaseUser.uid, 'callLogs');
        const logsSnap = await getDocs(logsColl).catch(err => {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}/callLogs`);
          return null;
        });

        let loadedLogs: CallLog[] = [];
        if (logsSnap && !logsSnap.empty) {
          logsSnap.forEach(docSnap => {
            loadedLogs.push(docSnap.data() as CallLog);
          });
          // Sort newest logs first
          loadedLogs.sort((a, b) => b.id.localeCompare(a.id));
        } else {
          // Seed call logs to Firestore
          for (const log of INITIAL_CALL_LOGS) {
            const docRef = doc(db, 'users', firebaseUser.uid, 'callLogs', log.id);
            await setDoc(docRef, { ...log, userId: firebaseUser.uid }).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/callLogs/${log.id}`);
            });
          }
          loadedLogs = INITIAL_CALL_LOGS;
        }

        // 3. Sync with Google Contacts (if OAuth scope was granted)
        if (googleAccessToken) {
          const googleContacts = await fetchGoogleContacts(googleAccessToken);
          const seenNumbers = new Set(loadedContacts.map(c => c.number.replace(/\D/g, '')));
          const uniqueGoogle = googleContacts.filter(gc => !seenNumbers.has(gc.number.replace(/\D/g, '')));
          loadedContacts = [...loadedContacts, ...uniqueGoogle];
        }

        setContacts(loadedContacts);
        setCallLogs(loadedLogs);
      } catch (err) {
        console.error('Error synchronizing cloud database:', err);
      } finally {
        setIsWorkspaceSyncing(false);
      }
    };

    syncCloudData();
  }, [firebaseUser, googleAccessToken]);

  // Auth Operations Handlers
  const handleGoogleSignIn = async () => {
    triggerHaptic();
    setIsWorkspaceSyncing(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setFirebaseUser(res.user);
        setGoogleAccessToken(res.accessToken);
        triggerToast(`Successfully signed in as ${res.user.displayName}`);
      }
    } catch (error: any) {
      console.error(error);
      triggerToast('Sign in failed: ' + (error.message || error));
    } finally {
      setIsWorkspaceSyncing(false);
    }
  };

  const handleGoogleLogout = async () => {
    triggerHaptic();
    try {
      await logout();
      setFirebaseUser(null);
      setGoogleAccessToken(null);
      setContacts(INITIAL_CONTACTS);
      setCallLogs(INITIAL_CALL_LOGS);
      triggerToast('Signed out of Google account.');
    } catch (error: any) {
      console.error(error);
      triggerToast('Sign out failed');
    }
  };

  const handleCreateMeet = async () => {
    triggerHaptic();
    if (!googleAccessToken) {
      triggerToast('Not authenticated with Google Workspace');
      return;
    }
    setIsWorkspaceSyncing(true);
    const meetingUri = await createGoogleMeetMeeting(googleAccessToken);
    setIsWorkspaceSyncing(false);
    if (meetingUri) {
      setMeetLink(meetingUri);
      triggerToast('Google Meet space created!');
    } else {
      triggerToast('Failed to create meeting space. Click Sync or Sign In again.');
    }
  };

  const handleClearMeet = () => {
    triggerHaptic();
    setMeetLink(null);
  };

  // Toast system helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switcher triggers
  const handleToggleTheme = () => {
    triggerHaptic();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Contacts addition action
  const handleSaveNewContact = async (name: string, number: string, label: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const group = name[0].toUpperCase();
    
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name,
      number,
      label,
      initials,
      group: group >= 'A' && group <= 'Z' ? group : '#'
    };

    setContacts(prev => [...prev, newContact]);
    triggerToast(`Added ${name} to contacts!`);

    // Firestore Integration: write contact if authenticated
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'contacts', newContact.id);
      await setDoc(docRef, { ...newContact, userId: firebaseUser.uid }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/contacts/${newContact.id}`);
      });

      // Google Contacts Sync Trigger (Workspace user mutation confirmation rule check)
      if (googleAccessToken) {
        const confirmSaveGoogle = window.confirm(`Would you like to sync and save "${name}" to your real Google Contacts account as well?`);
        if (confirmSaveGoogle) {
          setIsWorkspaceSyncing(true);
          const success = await createGoogleContact(googleAccessToken, name, number, label);
          setIsWorkspaceSyncing(false);
          if (success) {
            triggerToast(`Successfully synced "${name}" directly to your Google Contacts!`);
          } else {
            triggerToast(`Could not write to Google Contacts.`);
          }
        }
      }
    }

    // Match previous logs of this phone number to update their display names retroactively
    setCallLogs(prevLogs => prevLogs.map(log => {
      if (log.number.replace(/\D/g, '') === number.replace(/\D/g, '')) {
        return { ...log, name, contactId: newContact.id };
      }
      return log;
    }));
  };

  // Start outgoing calling mechanism
  const handleStartCall = (numberToCall: string) => {
    triggerHaptic();
    
    // Check if number matched to active contact
    const matched = contacts.find(c => c.number.replace(/\D/g, '') === numberToCall.replace(/\D/g, ''));
    
    setActiveCall({
      number: numberToCall,
      name: matched?.name,
      image: matched?.image
    });
  };

  // Hangup call logic: appends calling logs instantly
  const handleEndCall = async (duration: string) => {
    if (!activeCall) return;

    const matched = contacts.find(c => c.number.replace(/\D/g, '') === activeCall.number.replace(/\D/g, ''));
    
    const newLog: CallLog = {
      id: `log-${Date.now()}`,
      name: matched?.name,
      number: activeCall.number,
      type: 'made',
      label: matched?.label || 'MOBILE',
      time: 'Just now',
      duration,
      image: matched?.image,
      contactId: matched?.id
    };

    setCallLogs(prev => [newLog, ...prev]);
    setActiveCall(null);
    setCurrentNumber('');
    triggerToast(`Call to ${matched?.name || activeCall.number} recorded (${duration})`);

    // Firestore Integration: save log if logged in
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'callLogs', newLog.id);
      await setDoc(docRef, { ...newLog, userId: firebaseUser.uid }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/callLogs/${newLog.id}`);
      });
    }
  };

  // Reset to default preset setup 
  const handleResetFactory = () => {
    triggerHaptic();
    if (window.confirm('Reset dialer app to initial presets? This will clear logs and added contacts.')) {
      localStorage.removeItem('dialer-contacts');
      localStorage.removeItem('dialer-calllogs');
      setContacts(INITIAL_CONTACTS);
      setCallLogs(INITIAL_CALL_LOGS);
      setTheme('dark');
      setAesthetic('nothing');
      setSettingsOpen(false);
      triggerToast('App reset successful. Factory metrics re-loaded.');
    }
  };

  // Trigger outbound call with random avatar to test UI
  const triggerIncomingDemo = () => {
    triggerHaptic();
    setSettingsOpen(false);
    
    // Choose a random contact
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
    setActiveCall({
      number: randomContact.number,
      name: randomContact.name,
      image: randomContact.image
    });
  };

  // Inline delete logic
  const handleDeleteLog = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this call log from history?');
    if (!confirmed) return;

    setCallLogs(prev => prev.filter(log => log.id !== id));
    triggerToast('Call history entry deleted');

    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'callLogs', id);
      await deleteDoc(docRef).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/callLogs/${id}`);
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact?');
    if (!confirmed) return;

    setContacts(prev => prev.filter(c => c.id !== id));
    triggerToast('Contact removed successfully');

    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'contacts', id);
      await deleteDoc(docRef).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/contacts/${id}`);
      });
    }
  };

  const handleOpenInfo = (log: CallLog) => {
    triggerHaptic();
    setSelectedLog(log);
    // Find associated contact
    const linked = contacts.find(c => c.id === log.contactId || c.number.replace(/\D/g, '') === log.number.replace(/\D/g, ''));
    setSelectedContact(linked || null);
    setInfoModalOpen(true);
  };

  const handleOpenSelfProfile = () => {
    triggerHaptic();
    setSelectedLog(null);
    setSelectedContact({
      id: 'self-profile',
      name: MY_PROFILE.name,
      number: MY_PROFILE.number,
      label: 'MY DIGITS',
      image: MY_PROFILE.image,
      initials: 'MU',
      group: 'M'
    });
    setInfoModalOpen(true);
  };

  return (
    <div className={`min-h-screen relative font-sans flex flex-col justify-between overflow-x-hidden transition-colors duration-500 pb-20 select-none
      ${
        theme === 'dark' 
          ? 'bg-black text-neutral-100' 
          : 'bg-[#f4f4f5] text-neutral-900'
      }
      ${
        aesthetic === 'obsidian' && theme === 'dark' ? 'border-[3px] border-orange-500/10' : ''
      }`}
    >
      {/* Absolute floating glowing visual backdrops if iOS Fluent Glass Mode is active */}
      {aesthetic === 'fluent' && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-10 -left-20 w-80 h-80 rounded-full blur-[100px] bg-indigo-600/30 dark:bg-indigo-500/20" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-[120px] bg-red-600/20 dark:bg-red-500/15 animate-pulse-ring" />
        </div>
      )}

      {/* Decorative Dot Matrix Background */}
      <div className={`absolute inset-0 pointer-events-none z-0 opacity-5
        ${theme === 'dark' ? 'dot-matrix-bg' : 'dot-matrix-bg-light'}`} 
      />

      {/* Primary TopAppBar */}
      <header className={`sticky top-0 w-full z-40 bg-transparent flex justify-between items-center px-4 h-16 border-b backdrop-blur-md transition-colors
        ${
          theme === 'dark'
            ? 'border-white/10 text-white'
            : 'border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Menu Drawer Toggle */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { triggerHaptic(); setSettingsOpen(true); }}
            className={`p-2 rounded-full cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-200'}`}
          >
            <Menu size={20} />
          </motion.button>
          
          <h1 className="font-display font-bold text-lg tracking-[0.2em] uppercase text-primary ml-1">
            {aesthetic === 'obsidian' ? 'Matrix' : aesthetic === 'nothing' ? 'Nothing Phone' : 'Fluent OS'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick theme toggler */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleTheme}
            className={`p-2 rounded-full cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-200'}`}
            title="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-neutral-800" />}
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { triggerHaptic(); setSettingsOpen(true); }}
            className={`p-2 rounded-full cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-200'}`}
          >
            <MoreVertical size={18} />
          </motion.button>
        </div>
      </header>

      {/* Primary Content Switcher */}
      <main className="flex-1 flex flex-col w-full z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'keypad' && (
            <motion.div
              key="keypad"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <KeypadView
                theme={theme}
                contacts={contacts}
                currentNumber={currentNumber}
                setCurrentNumber={setCurrentNumber}
                onStartCall={handleStartCall}
                onAddNewContact={(num) => {
                  triggerHaptic();
                  setCurrentNumber(num);
                  setAddContactOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'recents' && (
            <motion.div
              key="recents"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col pt-2"
            >
              <RecentsView
                theme={theme}
                callLogs={callLogs}
                onStartCall={handleStartCall}
                onSelectInfo={handleOpenInfo}
              />
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col pt-2"
            >
              <ContactsView
                theme={theme}
                contacts={contacts}
                onStartCall={handleStartCall}
                onAddNewContact={() => {
                  triggerHaptic();
                  setCurrentNumber('');
                  setAddContactOpen(true);
                }}
                onOpenSelfProfile={handleOpenSelfProfile}
                firebaseUser={firebaseUser}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleLogout={handleGoogleLogout}
                isWorkspaceSyncing={isWorkspaceSyncing}
                onCreateMeet={handleCreateMeet}
                meetLink={meetLink}
                onClearMeet={handleClearMeet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Immersive Glassmorphic Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 w-full z-40 px-6 py-4 flex justify-around items-center backdrop-blur-xl border-t transition-colors
        ${
          theme === 'dark'
            ? 'bg-black/75 border-white/10'
            : 'bg-white/80 border-neutral-200'
        }`}
      >
        {/* Recents Tab */}
        <button
          onClick={() => { triggerHaptic(); setActiveTab('recents'); }}
          className="flex flex-col items-center justify-center transition-all cursor-pointer relative py-1"
        >
          {activeTab === 'recents' ? (
            <motion.div 
              layoutId="nav-pill"
              className={`absolute top-[-4px] h-1.5 w-10 rounded-full
                ${aesthetic === 'obsidian' ? 'bg-orange-500' : 'bg-red-500'}`}
            />
          ) : null}
          <History size={20} className={`${activeTab === 'recents' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`} />
          <span className={`font-mono text-[9px] uppercase tracking-widest mt-1.5 font-bold ${activeTab === 'recents' ? 'text-white' : 'text-neutral-500'}`}>
            Recents
          </span>
        </button>

        {/* Keypad Tab */}
        <button
          onClick={() => { triggerHaptic(); setActiveTab('keypad'); }}
          className="flex flex-col items-center justify-center transition-all cursor-pointer relative py-1"
        >
          {activeTab === 'keypad' ? (
            <motion.div 
              layoutId="nav-pill"
              className={`absolute top-[-4px] h-1.5 w-10 rounded-full
                ${aesthetic === 'obsidian' ? 'bg-orange-500' : 'bg-red-500'}`}
            />
          ) : null}
          <Grid size={20} className={`${activeTab === 'keypad' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`} />
          <span className={`font-mono text-[9px] uppercase tracking-widest mt-1.5 font-bold ${activeTab === 'keypad' ? 'text-white' : 'text-neutral-500'}`}>
            Keypad
          </span>
        </button>

        {/* Contacts Tab */}
        <button
          onClick={() => { triggerHaptic(); setActiveTab('contacts'); }}
          className="flex flex-col items-center justify-center transition-all cursor-pointer relative py-1"
        >
          {activeTab === 'contacts' ? (
            <motion.div 
              layoutId="nav-pill"
              className={`absolute top-[-4px] h-1.5 w-10 rounded-full
                ${aesthetic === 'obsidian' ? 'bg-orange-500' : 'bg-red-500'}`}
            />
          ) : null}
          <User size={20} className={`${activeTab === 'contacts' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`} />
          <span className={`font-mono text-[9px] uppercase tracking-widest mt-1.5 font-bold ${activeTab === 'contacts' ? 'text-white' : 'text-neutral-500'}`}>
            Contacts
          </span>
        </button>
      </nav>

      {/* Slide-In Settings Panel / Configure Drawers */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="absolute inset-[0px] bg-black bg-opacity-70 backdrop-blur-sm"
            />

            {/* Config panel drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`relative z-10 w-full max-w-sm h-full flex flex-col p-6 shadow-2xl border-l
                ${
                  theme === 'dark'
                    ? 'bg-neutral-950 border-white/10 text-white'
                    : 'bg-white border-neutral-200 text-neutral-900'
                }`}
            >
              {/* Drawer Title header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Sliders size={20} className="text-red-500" />
                  <h2 className="font-display text-lg font-bold uppercase tracking-widest">
                    CONGIG DRAWER
                  </h2>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-1 rounded-full cursor-pointer hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Settings list stack */}
              <div className="flex-1 space-y-8 overflow-y-auto">
                {/* 1. Theme Selection Toggle */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Theme Mode
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { triggerHaptic(); setTheme('dark'); }}
                      className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border text-xs font-mono font-semibold tracking-wider cursor-pointer
                        ${
                          theme === 'dark'
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-900/40 text-neutral-400 border-white/10'
                        }`}
                    >
                      <Moon size={14} /> DARK
                    </button>
                    <button
                      onClick={() => { triggerHaptic(); setTheme('light'); }}
                      className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border text-xs font-mono font-semibold tracking-wider cursor-pointer
                        ${
                          theme === 'light'
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-900/40 text-neutral-400 border-white/10'
                        }`}
                    >
                      <Sun size={14} /> LIGHT
                    </button>
                  </div>
                </div>

                {/* 2. System Aesthetic/Styles Switcher */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Layout Aesthetic
                  </h3>
                  <div className="space-y-2">
                    {/* Nothing OS select */}
                    <button
                      onClick={() => { triggerHaptic(); setAesthetic('nothing'); }}
                      className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-1 transition-all cursor-pointer
                        ${
                          aesthetic === 'nothing'
                            ? 'bg-neutral-900 border-white/20 select-all'
                            : 'bg-neutral-950/40 border-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <p className="font-display font-semibold text-sm">Nothing Phone (Default)</p>
                      <p className="font-sans text-[10px] text-neutral-400 lowercase leading-relaxed">
                        monochrome typography paired with Space Grotesk pips and subtle green dialer.
                      </p>
                    </button>

                    {/* Obsidian Matrix select */}
                    <button
                      onClick={() => { triggerHaptic(); setAesthetic('obsidian'); }}
                      className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-1 transition-all cursor-pointer
                        ${
                          aesthetic === 'obsidian'
                            ? 'bg-neutral-900 border-orange-500/30'
                            : 'bg-neutral-950/40 border-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <p className="font-display font-semibold text-sm text-orange-400">Obsidian Matrix Theme</p>
                      <p className="font-sans text-[10px] text-neutral-400 lowercase leading-relaxed">
                        stark brutalist digital orange highlights with dark outline borders.
                      </p>
                    </button>

                    {/* iOS Fluent glass mode */}
                    <button
                      onClick={() => { triggerHaptic(); setAesthetic('fluent'); }}
                      className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-1 transition-all cursor-pointer
                        ${
                          aesthetic === 'fluent'
                            ? 'bg-neutral-900 border-indigo-500/30'
                            : 'bg-neutral-950/40 border-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <p className="font-display font-semibold text-sm text-indigo-400">iOS Fluid Glass Mode</p>
                      <p className="font-sans text-[10px] text-neutral-400 lowercase leading-relaxed">
                        frosted glassmorphism over neon glowing radial visual filters.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3. Preset Simulators */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Interactive Simulators
                  </h3>
                  <div className="space-y-2">
                    {/* Launch call preset */}
                    <button
                      onClick={triggerIncomingDemo}
                      className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between text-xs font-mono font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-green-400">
                        <PhoneCall size={14} /> Start Outbound Call Sim
                      </span>
                      <ChevronRight size={14} />
                    </button>

                    {/* Simulate notifications */}
                    <button
                      onClick={() => {
                        triggerOutgoingDemoCall(contacts, handleStartCall);
                        setSettingsOpen(false);
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between text-xs font-mono font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-rose-400">
                        <Heart size={14} /> Trigger Arthur Vance Sim
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* 4. Reset & Destruct operations */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    Danger zone
                  </h3>
                  <button
                    onClick={handleResetFactory}
                    className="w-full py-3.5 px-4 rounded-2xl bg-red-950/30 hover:bg-red-900/20 border border-red-500/20 transition-all text-red-400 text-xs font-mono font-semibold tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={14} /> CLEAR DATA / APP RESET
                  </button>
                </div>
              </div>

              {/* Footer specs */}
              <div className="pt-4 border-t border-white/5 text-center">
                <p className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest">
                  Nothing Dialer • v1.1.0 Build
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Outbound Call Screens overlay */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 h-screen"
          >
            <ActiveCallScreen
              theme={theme}
              number={activeCall.number}
              contactName={activeCall.name}
              avatarImage={activeCall.image}
              onEndCall={handleEndCall}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Contacts visual popover wizard */}
      <AddContactDialog
        theme={theme}
        initialNumber={currentNumber}
        isOpen={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        onSave={handleSaveNewContact}
      />

      {/* Call Information popup modal */}
      <InfoCardModal
        theme={theme}
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        selectedLog={selectedLog}
        selectedContact={selectedContact}
        onStartCall={handleStartCall}
        onDeleteLog={handleDeleteLog}
        onDeleteContact={handleDeleteContact}
      />

      {/* Central Notification Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-neutral-900 border border-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-neutral-100 shadow-xl flex items-center gap-2"
          >
            <Sparkles size={14} className="text-yellow-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility to launch customized Arthur Vance outgoing call sim
function triggerOutgoingDemoCall(contacts: Contact[], handleStartCall: (num: string) => void) {
  // Find Arthur Vance in contacts
  const av = contacts.find(c => c.name.toLowerCase().includes('arthur'));
  if (av) {
    handleStartCall(av.number);
  } else {
    handleStartCall('+1 (555) 012-3456');
  }
}
