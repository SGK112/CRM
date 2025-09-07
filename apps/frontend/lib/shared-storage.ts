// Shared in-memory storage for development mode
// This simulates database persistence across API routes

export interface ClientData {
  id: string;
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  projectsCount?: number;
  totalProjects?: number;
  totalValue?: number;
  lastContact?: string;
  updatedAt?: string;
  unreadNotifications?: number;
  quickbooksSynced?: boolean;
  estimatesSent?: number;
  estimatesViewed?: number;
  type?: string;
  contactRole?: string;
  accountType?: string;
  source?: string;
  notes?: string;
  
  // Enhanced profile data
  website?: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  taxId?: string;
  businessLicense?: string;
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    expirationDate?: string;
    coverage?: string;
  };
  certifications?: Array<{
    name: string;
    number?: string;
    issuer?: string;
    expirationDate?: string;
  }>;
  
  // Contact preferences
  preferredContact?: 'email' | 'phone' | 'text' | 'app';
  bestTimeToContact?: string;
  communicationNotes?: string;
  
  // Financial
  creditLimit?: number;
  paymentTerms?: string;
  paymentMethod?: string;
  
  // Residential specific
  homeOwner?: boolean;
  propertyType?: 'single-family' | 'condo' | 'townhouse' | 'apartment' | 'mobile-home';
  occupancy?: 'owner-occupied' | 'rental' | 'vacation';
  
  // Vendor/Sub specific
  specialty?: string[];
  serviceArea?: string;
  hourlyRate?: number;
  availability?: string;
  equipment?: string;
  
  // Team specific
  role?: string;
  department?: string;
  startDate?: string;
  employeeId?: string;
  
  // Metadata
  createdAt?: string;
  profileCompleteness?: number;
}

// In-memory storage (simulates database persistence)
const devMockClients: ClientData[] = [
  {
    id: '1',
    _id: '1',
    name: 'Johnson Family',
    firstName: 'John',
    lastName: 'Johnson',
    email: 'contact@johnsonfamily.com',
    phone: '(555) 123-4567',
    status: 'active',
    contactType: 'client',
    projectsCount: 2,
    totalProjects: 2,
    totalValue: 45000,
    lastContact: '2024-09-03T10:30:00Z',
    updatedAt: '2024-09-03T10:30:00Z',
    unreadNotifications: 3,
    quickbooksSynced: true,
    estimatesSent: 2,
    estimatesViewed: 1,
  },
  {
    id: '2',
    _id: '2',
    name: 'Martinez Construction',
    firstName: 'Carlos',
    lastName: 'Martinez',
    company: 'Martinez Construction',
    email: 'info@martinezconstruction.com',
    phone: '(555) 234-5678',
    status: 'active',
    contactType: 'subcontractor',
    projectsCount: 1,
    totalProjects: 1,
    totalValue: 28000,
    lastContact: '2024-09-01T09:15:00Z',
    updatedAt: '2024-09-01T09:15:00Z',
    unreadNotifications: 1,
    quickbooksSynced: false,
    estimatesSent: 1,
    estimatesViewed: 1,
  }
];

export const clientStorage = {
  getAll: (): ClientData[] => {
    return [...devMockClients];
  },

  getById: (id: string): ClientData | undefined => {
    return devMockClients.find(c => c.id === id || c._id === id);
  },

  create: (clientData: Partial<ClientData>): ClientData => {
    const newClient: ClientData = {
      id: String(Date.now()),
      _id: String(Date.now()),
      name: clientData.name || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'New Contact',
      firstName: clientData.firstName || '',
      lastName: clientData.lastName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      company: clientData.company || '',
      status: clientData.status || 'active',
      contactType: clientData.contactType || clientData.type as ClientData['contactType'] || 'client',
      projectsCount: 0,
      totalProjects: 0,
      totalValue: 0,
      lastContact: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadNotifications: 0,
      quickbooksSynced: false,
      estimatesSent: 0,
      estimatesViewed: 0,
      accountType: clientData.accountType || '',
      source: clientData.source || '',
      notes: clientData.notes || '',
      profileCompleteness: 0,
      ...clientData
    };

    // Add to the beginning of the array
    devMockClients.unshift(newClient);
    
    return newClient;
  },

  update: (id: string, updateData: Partial<ClientData>): ClientData | null => {
    const index = devMockClients.findIndex(c => c.id === id || c._id === id);
    if (index === -1) return null;

    devMockClients[index] = {
      ...devMockClients[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return devMockClients[index];
  },

  delete: (id: string): boolean => {
    const index = devMockClients.findIndex(c => c.id === id || c._id === id);
    if (index === -1) return false;

    devMockClients.splice(index, 1);
    return true;
  }
};
