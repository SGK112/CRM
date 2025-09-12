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

// In-memory storage (simulates database persistence) - cleared for production use
const devMockClients: ClientData[] = [];

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

// Mock project data - cleared for production use
const devMockProjects: ProjectData[] = [];

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

// Mock document data - cleared for production use
const devMockDocuments: DocumentData[] = [];

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

// Mock notification data - cleared for production use
const devMockNotifications: NotificationData[] = [];

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
