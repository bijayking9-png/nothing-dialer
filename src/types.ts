/**
 * Typings for Nothing Phone Dialer
 */

export interface Contact {
  id: string;
  name: string;
  number: string;
  label: string; // 'MOBILE' | 'WORK' | 'HOME' | 'UNKNOWN'
  image?: string; // Avatar URL
  initials: string;
  group: string; // 'A' | 'B' | 'C' etc.
  isStarred?: boolean;
}

export interface CallLog {
  id: string;
  name?: string; // If matched with a contact
  number: string;
  type: 'missed' | 'received' | 'made';
  label: string; // 'MOBILE' | 'WORK' | 'HOME' | 'UNKNOWN'
  time: string; // e.g. "10:42 AM", "Yesterday", "Monday", "Mar 10"
  duration?: string; // e.g. "12:04"
  count?: number; // missed count (e.g. 2)
  image?: string; // contact thumbnail
  contactId?: string; // link to contact
}

export type ThemeMode = 'dark' | 'light';

export type ActiveTab = 'recents' | 'keypad' | 'contacts';
