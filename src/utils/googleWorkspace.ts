import { Contact } from '../types';

/**
 * Fetches Google Contacts using Google People API
 */
export async function fetchGoogleContacts(accessToken: string): Promise<Contact[]> {
  try {
    const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,photos&pageSize=100', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Google Contacts: ${res.statusText}`);
    }
    const data = await res.json();
    const connections = data.connections || [];
    return connections.map((person: any) => {
      const nameObj = person.names?.[0] || {};
      const name = nameObj.displayName || 'Unnamed Contact';
      const phoneObj = person.phoneNumbers?.[0] || {};
      const number = phoneObj.value || 'No number';
      const label = phoneObj.type?.toUpperCase() || 'MOBILE';
      const image = person.photos?.[0]?.url || undefined;
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';
      const group = name[0]?.toUpperCase() || '#';

      return {
        id: person.resourceName || `google-${Date.now()}-${Math.random()}`,
        name,
        number,
        label,
        image,
        initials,
        group: group >= 'A' && group <= 'Z' ? group : '#',
        isStarred: false,
        isGoogleContact: true
      };
    });
  } catch (error) {
    console.error('Error fetching Google Contacts:', error);
    return [];
  }
}

/**
 * Creates a Google Contact in actual Google Contacts
 */
export async function createGoogleContact(accessToken: string, name: string, number: string, label: string): Promise<boolean> {
  try {
    const nameParts = name.trim().split(/\s+/);
    const givenName = nameParts[0] || '';
    const familyName = nameParts.slice(1).join(' ') || '';

    const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        names: [{ givenName, familyName }],
        phoneNumbers: [{ value: number, type: label.toLowerCase() }]
      })
    });

    return response.ok;
  } catch (err) {
    console.error('Error creating Google contact:', err);
    return false;
  }
}

/**
 * Creates an instant Google Meet Space link via Meet Spaces REST API v2
 */
export async function createGoogleMeetMeeting(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Meet creation failed: ${errText}`);
    }
    const data = await response.json();
    return data.meetingUri || null;
  } catch (err) {
    console.error('Error creating Google Meet space:', err);
    return null;
  }
}
