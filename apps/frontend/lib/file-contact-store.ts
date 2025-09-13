// Simple file-based store for development persistence
import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), '.dev-contacts.json');

export interface FileContact {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: string;
  entityType?: string;
  businessType?: string;
  status?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Initialize store file if it doesn't exist
function initializeStore() {
  if (!fs.existsSync(STORE_FILE)) {
    const initialContacts: FileContact[] = [];

    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialContacts, null, 2));
    } catch (error) {
      console.error('Failed to initialize contact store:', error);
    }
  }
}

// Read contacts from file
export function readContactsFromFile(): FileContact[] {
  try {
    initializeStore();
    const data = fs.readFileSync(STORE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read contacts:', error);
    return [];
  }
}

// Write contacts to file
export function writeContactsToFile(contacts: FileContact[]): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.error('Failed to write contacts:', error);
  }
}

// Add contact to file store
export function addContactToFile(contact: FileContact): boolean {
  try {
    const contacts = readContactsFromFile();
    contacts.unshift(contact);
    writeContactsToFile(contacts);
    return true;
  } catch (error) {
    console.error('Failed to add contact:', error);
    return false;
  }
}

// Find contact in file store
export function findContactInFile(id: string): FileContact | undefined {
  try {
    const contacts = readContactsFromFile();
    return contacts.find(c => c.id === id || c._id === id);
  } catch (error) {
    console.error('Failed to find contact:', error);
    return undefined;
  }
}

// Update contact in file store
export function updateContactInFile(id: string, updates: Partial<FileContact>): FileContact | null {
  try {
    const contacts = readContactsFromFile();
    const index = contacts.findIndex(c => c.id === id || c._id === id);

    if (index === -1) return null;

    contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date().toISOString() };
    writeContactsToFile(contacts);
    return contacts[index];
  } catch (error) {
    console.error('Failed to update contact:', error);
    return null;
  }
}

// Remove contact from file store
export function removeContactFromFile(id: string): boolean {
  try {
    const contacts = readContactsFromFile();
    const index = contacts.findIndex(c => c.id === id || c._id === id);

    if (index === -1) return false;

    contacts.splice(index, 1);
    writeContactsToFile(contacts);
    return true;
  } catch (error) {
    console.error('Failed to remove contact:', error);
    return false;
  }
}
