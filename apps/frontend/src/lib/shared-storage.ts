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
}

export interface Contact {
  id: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  contactType?: 'client' | 'subcontractor' | 'vendor' | 'contributor' | 'team';
  status?: string;
  physicalAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessInfo?: {
    businessName?: string;
    taxId?: string;
    website?: string;
    industry?: string;
  };
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Global storage for development mode
declare global {
  var __DEV_CLIENT_STORAGE__: Contact[] | undefined;
  var __DEV_PROJECT_STORAGE__: Project[] | undefined;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: string;
  endDate?: string;
  budget?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export const clientStorage = {
  getAll(): Contact[] {
    if (typeof global !== 'undefined') {
      global.__DEV_CLIENT_STORAGE__ = global.__DEV_CLIENT_STORAGE__ || [];
      return global.__DEV_CLIENT_STORAGE__;
    }
    return [];
  },

  getById(id: string): Contact | undefined {
    const clients = this.getAll();
    return clients.find(client => client.id === id || client._id === id);
  },

  create(clientData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const clients = this.getAll();
    const newClient: Contact = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    clients.push(newClient);
    return newClient;
  },

  update(id: string, updates: Partial<Contact>): Contact | null {
    const clients = this.getAll();
    const index = clients.findIndex(client => client.id === id || client._id === id);
    if (index === -1) return null;
    
    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return clients[index];
  },

  delete(id: string): boolean {
    const clients = this.getAll();
    const index = clients.findIndex(client => client.id === id || client._id === id);
    if (index === -1) return false;
    
    clients.splice(index, 1);
    return true;
  }
};

export const projectStorage = {
  getAll(): Project[] {
    if (typeof global !== 'undefined') {
      global.__DEV_PROJECT_STORAGE__ = global.__DEV_PROJECT_STORAGE__ || [];
      return global.__DEV_PROJECT_STORAGE__;
    }
    return [];
  },

  getById(id: string): Project | undefined {
    const projects = this.getAll();
    return projects.find(project => project.id === id);
  },

  create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getAll();
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    return newProject;
  },

  update(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getAll();
    const index = projects.findIndex(project => project.id === id);
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return projects[index];
  },

  delete(id: string): boolean {
    const projects = this.getAll();
    const index = projects.findIndex(project => project.id === id);
    if (index === -1) return false;
    
    projects.splice(index, 1);
    return true;
  }
};
