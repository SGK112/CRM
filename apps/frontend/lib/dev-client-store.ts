// Shared in-memory client store for development
export interface DevClient {
  // Basic Identification
  id: string;
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;

  // Contact Information
  email: string;
  phone?: string;
  alternatePhone?: string;
  workPhone?: string;
  mobilePhone?: string;

  // Business Information
  company?: string;
  title?: string;
  department?: string;
  website?: string;

  // Primary Address (Service Location)
  address?: string;
  address2?: string; // Unit, suite, etc.
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Secondary Address (Billing/Mailing if different)
  billingAddress?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;

  // Service Industry Specific
  serviceLocation?: 'primary_address' | 'billing_address' | 'custom' | 'multiple';
  customServiceAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  accessInstructions?: string; // Gate codes, building access, etc.
  preferredServiceTimes?: string;

  // Business Details
  type?: string;
  entityType?: string;
  businessType?: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
  taxId?: string;

  // Project Information
  projectType?: string;
  budget?: string;
  timeline?: string;
  description?: string;
  specialRequirements?: string;

  // System Fields
  status?: string;
  notes?: string;
  projects?: string[];
  createdAt: string;
  updatedAt: string;

  // Service History
  lastServiceDate?: string;
  preferredContactMethod?: 'phone' | 'email' | 'text' | 'app';

  // Emergency Information
  hasKeys?: boolean;
  alarmCode?: string;
  petInformation?: string;
  specialInstructions?: string;
}

// Initial mock client data - cleared for production use
const initialClients: DevClient[] = [];

// In-memory store for development - this will persist contacts during the dev session
const devClientsStore: DevClient[] = [...initialClients];

// Persist contacts to localStorage in development mode
function persistToLocalStorage(contacts: DevClient[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('crm-dev-contacts', JSON.stringify(contacts));
    } catch (e) {
      // Silent fail - localStorage might be disabled
    }
  }
}

// Load contacts from localStorage in development mode
function loadFromLocalStorage(): DevClient[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('crm-dev-contacts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the data structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(contact => contact.id && contact.name);
        }
      }
    } catch (e) {
      // Silent fail - localStorage might be corrupted
    }
  }
  return [];
}

// Initialize with empty store for production
function initializeDevStore() {
  // Try to load from localStorage first
  const storedContacts = loadFromLocalStorage();

  if (storedContacts.length > 0) {
    // Use stored contacts if we have any
    devClientsStore.splice(0, devClientsStore.length, ...storedContacts);
    return;
  }

  // Start with completely empty store for production
  devClientsStore.splice(0, devClientsStore.length);

  // Persist the empty state
  persistToLocalStorage(devClientsStore);
}

// Initialize the store
initializeDevStore();

export const getDevClientsStore = (): DevClient[] => devClientsStore;

export const addToDevClientsStore = (client: DevClient): void => {
  devClientsStore.unshift(client); // Add to beginning for recent display

  // Try to persist to localStorage if available (browser environment)
  if (typeof window !== 'undefined') {
    persistToLocalStorage(devClientsStore);
  }
};

export const updateInDevClientsStore = (id: string, updates: Partial<DevClient>): DevClient | null => {
  const index = devClientsStore.findIndex(c => c.id === id || c._id === id);
  if (index === -1) return null;

  devClientsStore[index] = { ...devClientsStore[index], ...updates, updatedAt: new Date().toISOString() };

  // Try to persist to localStorage if available (browser environment)
  if (typeof window !== 'undefined') {
    persistToLocalStorage(devClientsStore);
  }

  return devClientsStore[index];
};

export const findInDevClientsStore = (id: string): DevClient | undefined => {
  return devClientsStore.find(c => c.id === id || c._id === id);
};

export const removeFromDevClientsStore = (id: string): boolean => {
  const index = devClientsStore.findIndex(c => c.id === id || c._id === id);
  if (index === -1) return false;

  devClientsStore.splice(index, 1);

  // Try to persist to localStorage if available (browser environment)
  if (typeof window !== 'undefined') {
    persistToLocalStorage(devClientsStore);
  }

  return true;
};
