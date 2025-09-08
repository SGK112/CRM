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

export interface ProjectData {
  id: string;
  _id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId?: string;
  clientName?: string;
  address?: string;
  estimatedBudget?: number;
  actualCost?: number;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  progress?: number;
  assignedTeam?: string[];
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentData {
  id: string;
  _id: string;
  name: string;
  type: 'contract' | 'estimate' | 'invoice' | 'drawing' | 'permit' | 'photo' | 'other';
  size: number;
  uploadedBy: string;
  projectId?: string;
  clientId?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  userId: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
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

// Mock project data
const devMockProjects: ProjectData[] = [
  {
    id: '1',
    _id: '1',
    name: 'Johnson Kitchen Remodel',
    description: 'Complete kitchen renovation including new cabinets, countertops, and appliances',
    status: 'active',
    priority: 'high',
    clientId: '1',
    clientName: 'Johnson Family',
    address: '123 Oak Street, New York, NY 10001',
    estimatedBudget: 35000,
    actualCost: 28500,
    startDate: '2024-08-15T00:00:00Z',
    endDate: '2024-10-15T00:00:00Z',
    estimatedDuration: 60,
    progress: 65,
    assignedTeam: ['John Smith', 'Sarah Connor'],
    tags: ['kitchen', 'remodel', 'residential'],
    notes: 'Client wants premium finishes. Ordered custom cabinets with 3-week lead time.',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-09-05T14:30:00Z'
  },
  {
    id: '2',
    _id: '2',
    name: 'Martinez Office Build-out',
    description: 'Commercial office space renovation for tech startup',
    status: 'planning',
    priority: 'medium',
    clientId: '2',
    clientName: 'Martinez Construction',
    address: '456 Pine Avenue, Los Angeles, CA 90210',
    estimatedBudget: 75000,
    actualCost: 0,
    startDate: '2024-10-01T00:00:00Z',
    endDate: '2024-12-01T00:00:00Z',
    estimatedDuration: 90,
    progress: 15,
    assignedTeam: ['Mike Johnson', 'Lisa Park'],
    tags: ['commercial', 'office', 'build-out'],
    notes: 'Need to coordinate with IT team for network infrastructure requirements.',
    createdAt: '2024-08-20T09:15:00Z',
    updatedAt: '2024-09-02T11:20:00Z'
  },
  {
    id: '3',
    _id: '3',
    name: 'Residential Addition',
    description: 'Two-story addition with master suite and family room',
    status: 'completed',
    priority: 'low',
    clientId: '1',
    clientName: 'Johnson Family',
    address: '123 Oak Street, New York, NY 10001',
    estimatedBudget: 125000,
    actualCost: 132000,
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-07-30T00:00:00Z',
    estimatedDuration: 150,
    progress: 100,
    assignedTeam: ['David Wilson', 'Emma Davis'],
    tags: ['addition', 'residential', 'two-story'],
    notes: 'Project completed successfully. Small cost overrun due to structural modifications.',
    createdAt: '2024-02-15T08:30:00Z',
    updatedAt: '2024-07-30T16:45:00Z'
  }
];

export const projectStorage = {
  getAll: (): ProjectData[] => {
    return [...devMockProjects];
  },

  getById: (id: string): ProjectData | undefined => {
    return devMockProjects.find(p => p.id === id || p._id === id);
  },

  create: (projectData: Partial<ProjectData>): ProjectData => {
    const newProject: ProjectData = {
      id: String(Date.now()),
      _id: String(Date.now()),
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      clientId: projectData.clientId || '',
      clientName: projectData.clientName || '',
      address: projectData.address || '',
      estimatedBudget: projectData.estimatedBudget || 0,
      actualCost: projectData.actualCost || 0,
      startDate: projectData.startDate || new Date().toISOString(),
      endDate: projectData.endDate || '',
      estimatedDuration: projectData.estimatedDuration || 30,
      progress: projectData.progress || 0,
      assignedTeam: projectData.assignedTeam || [],
      tags: projectData.tags || [],
      notes: projectData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...projectData
    };

    devMockProjects.unshift(newProject);
    return newProject;
  },

  update: (id: string, updateData: Partial<ProjectData>): ProjectData | null => {
    const index = devMockProjects.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    devMockProjects[index] = {
      ...devMockProjects[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return devMockProjects[index];
  },

  delete: (id: string): boolean => {
    const index = devMockProjects.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return false;

    devMockProjects.splice(index, 1);
    return true;
  }
};

// Mock document data
const devMockDocuments: DocumentData[] = [
  {
    id: '1',
    _id: '1',
    name: 'Kitchen_Remodel_Contract.pdf',
    type: 'contract',
    size: 256000,
    uploadedBy: 'John Smith',
    projectId: '1',
    clientId: '1',
    url: '/uploads/documents/Kitchen_Remodel_Contract.pdf',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-08-15T10:00:00Z'
  },
  {
    id: '2',
    _id: '2',
    name: 'Building_Permits.pdf',
    type: 'permit',
    size: 128000,
    uploadedBy: 'Sarah Connor',
    projectId: '2',
    clientId: '2',
    url: '/uploads/documents/Building_Permits.pdf',
    createdAt: '2024-08-20T14:30:00Z',
    updatedAt: '2024-08-20T14:30:00Z'
  },
  {
    id: '3',
    _id: '3',
    name: 'Progress_Photos_Week_4.zip',
    type: 'photo',
    size: 15600000,
    uploadedBy: 'Mike Johnson',
    projectId: '1',
    clientId: '1',
    url: '/uploads/documents/Progress_Photos_Week_4.zip',
    createdAt: '2024-09-05T09:15:00Z',
    updatedAt: '2024-09-05T09:15:00Z'
  }
];

export const documentStorage = {
  getAll: (): DocumentData[] => {
    return [...devMockDocuments];
  },

  getById: (id: string): DocumentData | undefined => {
    return devMockDocuments.find(d => d.id === id || d._id === id);
  },

  create: (documentData: Partial<DocumentData>): DocumentData => {
    const newDocument: DocumentData = {
      id: String(Date.now()),
      _id: String(Date.now()),
      name: documentData.name || 'Untitled Document',
      type: documentData.type || 'other',
      size: documentData.size || 0,
      uploadedBy: documentData.uploadedBy || 'Unknown',
      projectId: documentData.projectId || '',
      clientId: documentData.clientId || '',
      url: documentData.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...documentData
    };

    devMockDocuments.unshift(newDocument);
    return newDocument;
  },

  update: (id: string, updateData: Partial<DocumentData>): DocumentData | null => {
    const index = devMockDocuments.findIndex(d => d.id === id || d._id === id);
    if (index === -1) return null;

    devMockDocuments[index] = {
      ...devMockDocuments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return devMockDocuments[index];
  },

  delete: (id: string): boolean => {
    const index = devMockDocuments.findIndex(d => d.id === id || d._id === id);
    if (index === -1) return false;

    devMockDocuments.splice(index, 1);
    return true;
  }
};

// Mock notification data
const devMockNotifications: NotificationData[] = [
  {
    id: '1',
    _id: '1',
    title: 'Project Update',
    message: 'Kitchen remodel project is 65% complete',
    type: 'info',
    read: false,
    userId: 'user1',
    actionUrl: '/dashboard/projects/1',
    createdAt: '2024-09-05T14:30:00Z',
    updatedAt: '2024-09-05T14:30:00Z'
  },
  {
    id: '2',
    _id: '2',
    title: 'New Document Uploaded',
    message: 'Progress photos for Week 4 have been uploaded',
    type: 'success',
    read: false,
    userId: 'user1',
    actionUrl: '/dashboard/documents',
    createdAt: '2024-09-05T09:15:00Z',
    updatedAt: '2024-09-05T09:15:00Z'
  },
  {
    id: '3',
    _id: '3',
    title: 'Payment Reminder',
    message: 'Invoice #INV-2024-0023 is due in 3 days',
    type: 'warning',
    read: true,
    userId: 'user1',
    actionUrl: '/dashboard/financial',
    createdAt: '2024-09-02T10:00:00Z',
    updatedAt: '2024-09-02T10:00:00Z'
  },
  {
    id: '4',
    _id: '4',
    title: 'Permit Approved',
    message: 'Building permit for Martinez Office project has been approved',
    type: 'success',
    read: false,
    userId: 'user1',
    actionUrl: '/dashboard/projects/2',
    createdAt: '2024-09-01T15:45:00Z',
    updatedAt: '2024-09-01T15:45:00Z'
  }
];

export const notificationStorage = {
  getAll: (): NotificationData[] => {
    return [...devMockNotifications];
  },

  getById: (id: string): NotificationData | undefined => {
    return devMockNotifications.find(n => n.id === id || n._id === id);
  },

  getUnread: (): NotificationData[] => {
    return devMockNotifications.filter(n => !n.read);
  },

  create: (notificationData: Partial<NotificationData>): NotificationData => {
    const newNotification: NotificationData = {
      id: String(Date.now()),
      _id: String(Date.now()),
      title: notificationData.title || 'New Notification',
      message: notificationData.message || '',
      type: notificationData.type || 'info',
      read: notificationData.read || false,
      userId: notificationData.userId || 'user1',
      actionUrl: notificationData.actionUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...notificationData
    };

    devMockNotifications.unshift(newNotification);
    return newNotification;
  },

  update: (id: string, updateData: Partial<NotificationData>): NotificationData | null => {
    const index = devMockNotifications.findIndex(n => n.id === id || n._id === id);
    if (index === -1) return null;

    devMockNotifications[index] = {
      ...devMockNotifications[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return devMockNotifications[index];
  },

  markAsRead: (id: string): boolean => {
    const index = devMockNotifications.findIndex(n => n.id === id || n._id === id);
    if (index === -1) return false;

    devMockNotifications[index].read = true;
    devMockNotifications[index].updatedAt = new Date().toISOString();
    return true;
  },

  delete: (id: string): boolean => {
    const index = devMockNotifications.findIndex(n => n.id === id || n._id === id);
    if (index === -1) return false;

    devMockNotifications.splice(index, 1);
    return true;
  }
};
