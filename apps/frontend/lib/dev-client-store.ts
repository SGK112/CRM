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

// Initial mock client data
const initialClients: DevClient[] = [
  {
    id: '1',
    _id: '1',
    name: 'Johnson Family',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'johnson@example.com',
    phone: '(555) 123-4567',
    mobilePhone: '(555) 123-4567',
    address: '123 Oak Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    serviceLocation: 'primary_address',
    accessInstructions: 'Use side gate, ring doorbell twice',
    preferredServiceTimes: 'Weekdays 9AM-5PM',
    type: 'residential',
    status: 'active',
    notes: 'Preferred customer - always pays on time',
    projects: ['1', '3'],
    preferredContactMethod: 'phone',
    petInformation: '2 dogs - friendly',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-09-05T14:30:00Z'
  },
  {
    id: '2',
    _id: '2',
    name: 'Martinez Construction',
    company: 'Martinez Construction LLC',
    email: 'contact@martinez-construction.com',
    phone: '(555) 987-6543',
    workPhone: '(555) 987-6543',
    alternatePhone: '(555) 987-6544',
    address: '456 Pine Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    billingAddress: '789 Business Blvd',
    billingCity: 'Los Angeles',
    billingState: 'CA',
    billingZipCode: '90211',
    serviceLocation: 'multiple',
    website: 'www.martinez-construction.com',
    licenseNumber: 'CA-LIC-123456',
    type: 'commercial',
    entityType: 'subcontractor',
    businessType: 'construction',
    status: 'active',
    notes: 'Large commercial projects - net 30 payment terms',
    projects: ['2'],
    preferredContactMethod: 'email',
    createdAt: '2024-08-20T09:15:00Z',
    updatedAt: '2024-09-02T11:20:00Z'
  }
];

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

// Auto-populate with recent test contacts on server restart
function initializeDevStore() {
  // Try to load from localStorage first
  const storedContacts = loadFromLocalStorage();
  
  if (storedContacts.length > initialClients.length) {
    // Use stored contacts if we have more than the initial set
    devClientsStore.splice(0, devClientsStore.length, ...storedContacts);
    return;
  }

  // Add some recent test contacts that might have been lost due to server restart
  const recentTestContacts: DevClient[] = [
    {
      id: 'test-client-1',
      _id: 'test-client-1',
      name: 'Recent Test Contact',
      firstName: 'Recent',
      lastName: 'Contact',
      email: 'recent@test.com',
      phone: '(555) 111-2222',
      address: '123 Recent Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '90210',
      type: 'client',
      entityType: 'client',
      businessType: 'Residential Property Owner',
      status: 'lead',
      notes: 'Auto-generated test contact for development',
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Only add test contacts if store only has initial contacts
  if (devClientsStore.length <= 2) {
    recentTestContacts.forEach(contact => {
      const exists = devClientsStore.find(c => c.id === contact.id || c.email === contact.email);
      if (!exists) {
        devClientsStore.push(contact);
      }
    });
  }
  
  // Persist the initial state
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
