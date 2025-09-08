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
  website?: string;
  orderPortalUrl?: string;
  catalogUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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
  specialties?: string[];
  certifications?: string[];
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
    address: '123 Oak Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
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
    notes: 'Kitchen remodel project - premium finishes requested. Second project for bathroom renovation scheduled for Q4.'
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
    website: 'www.martinezconstruction.com',
    address: '456 Pine Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
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
    specialties: ['Electrical', 'HVAC', 'Plumbing'],
    certifications: ['Licensed Electrician', 'OSHA Certified'],
    notes: 'Reliable electrical contractor specializing in residential projects. Great communication and punctual delivery.'
  },
  {
    id: '3',
    _id: '3',
    name: 'Home Depot Pro',
    company: 'Home Depot',
    email: 'pro@homedepot.com',
    phone: '(555) 345-6789',
    website: 'www.homedepot.com',
    orderPortalUrl: 'https://pro.homedepot.com/orders',
    catalogUrl: 'https://pro.homedepot.com/catalog',
    address: '789 Builder Blvd',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30309',
    status: 'active',
    contactType: 'vendor',
    projectsCount: 0,
    totalProjects: 0,
    totalValue: 15000,
    lastContact: '2024-08-28T14:20:00Z',
    updatedAt: '2024-08-28T14:20:00Z',
    unreadNotifications: 0,
    quickbooksSynced: true,
    estimatesSent: 0,
    estimatesViewed: 0,
    notes: 'Primary supplier for lumber, hardware, and construction materials. Pro account with bulk pricing.'
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
      website: clientData.website || '',
      orderPortalUrl: clientData.orderPortalUrl || '',
      catalogUrl: clientData.catalogUrl || '',
      address: clientData.address || '',
      city: clientData.city || '',
      state: clientData.state || '',
      zipCode: clientData.zipCode || '',
      status: clientData.status || 'active',
      contactType: clientData.contactType || clientData.type as ClientData['contactType'] || 'client',
      projectsCount: 0,
      totalProjects: 0,
      totalValue: 0,
      lastContact: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadNotifications: 0,
      quickbooksSynced: false,
      estimatesSent: 0,
      estimatesViewed: 0,
      accountType: clientData.accountType || '',
      source: clientData.source || '',
      notes: clientData.notes || '',
      specialties: clientData.specialties || [],
      certifications: clientData.certifications || [],
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
