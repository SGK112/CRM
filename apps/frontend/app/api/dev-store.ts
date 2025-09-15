// Simple in-memory development store
// In production, this would be replaced with a real database

interface DevContact {
  id: string;
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  company?: string;
  contactType: string;
  businessType?: string;
  entityType: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Use a global object to persist data across requests in development
const globalKey = Symbol.for('app.dev-contacts');
const globalScope = global as any;

if (!globalScope[globalKey]) {
  globalScope[globalKey] = new Map<string, DevContact>();
}

const contacts: Map<string, DevContact> = globalScope[globalKey];

class DevStore {
  createContact(data: Partial<DevContact>): DevContact {
    const id = Math.random().toString(36).substr(2, 9);
    const contact: DevContact = {
      id,
      _id: id,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Unnamed Contact',
      email: data.email || '',
      contactType: data.contactType || 'client',
      entityType: data.entityType || 'client',
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    contacts.set(id, contact);
    return contact;
  }

  getContact(id: string): DevContact | undefined {
    return contacts.get(id);
  }

  getAllContacts(): DevContact[] {
    return Array.from(contacts.values());
  }

  updateContact(id: string, data: Partial<DevContact>): DevContact | undefined {
    const existing = contacts.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    contacts.set(id, updated);
    return updated;
  }

  deleteContact(id: string): boolean {
    return contacts.delete(id);
  }

  getCount(): number {
    return contacts.size;
  }
}

export const devStore = new DevStore();