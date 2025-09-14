import { addToDevClientsStore, DevClient, findInDevClientsStore, getDevClientsStore } from '@/lib/dev-client-store';
import { addContactToFile, readContactsFromFile } from '@/lib/file-contact-store';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3001';

async function getDevClients() {
  // First try file-based store
  try {
    const fileClients = await readContactsFromFile();
    if (fileClients && fileClients.length > 0) {
      return fileClients;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading from file store:', error);
  }
  
  // Fallback to in-memory store
  try {
    const devClients = getDevClientsStore();
    if (devClients && devClients.length > 0) {
      return devClients;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading from dev store:', error);
  }
  
  // Final fallback to empty array
  return [];
}

export async function GET(request: NextRequest) {
  try {
    // Get token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // eslint-disable-next-line no-console
    console.log('🔍 Main API: Token received:', token ? `${token.substring(0, 20)}...` : 'None');
    
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      // Use backend if authentication is available
      try {
        // eslint-disable-next-line no-console
        console.log('🔍 Main API: Trying backend with token');
        const backendResponse = await fetch(`${BACKEND_URL}/api/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        // eslint-disable-next-line no-console
        console.log('🔍 Main API: Backend response status:', backendResponse.status);
        
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          // eslint-disable-next-line no-console
          console.log('🔍 Main API: Backend success, count:', data.length);
          return NextResponse.json(data);
        } else {
          const errorText = await backendResponse.text();
          // eslint-disable-next-line no-console
          console.log('🔍 Main API: Backend failed:', backendResponse.status, errorText);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Backend connection failed:', error);
      }
    }
    
    // Fallback to development data
    // eslint-disable-next-line no-console
    console.log('🔍 Main API: Using fallback data');
    const clients = await getDevClients();
    return NextResponse.json(clients);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // Try backend first if we have a token
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      try {
        console.log('Creating client on backend:', body);

        const response = await fetch(`${BACKEND_URL}/api/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            company: body.company,
            status: body.status || 'lead',
            address: body.address,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            notes: body.notes,
            tags: body.tags || [],
            // Additional fields from onboarding form
            businessType: body.businessType,
            entityType: body.entityType,
            contactType: body.contactType || body.entityType || 'client',
            licenseNumber: body.licenseNumber,
            insuranceNumber: body.insuranceNumber,
            hourlyRate: body.hourlyRate,
            workAddress: body.workAddress,
            accountNumber: body.accountNumber,
            taxId: body.taxId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Backend client created:', data);
          return NextResponse.json(data, { status: 201 });
        } else {
          const errorText = await response.text();
          console.log('Backend create failed:', response.status, errorText);
        }
      } catch (error) {
        console.log('Backend create error:', error);
      }
    }

    // Fallback to local storage in development mode
    if (process.env.NODE_ENV !== 'production') {
      const clientId = String(Date.now());
      const newClient: DevClient = {
        id: clientId,
        _id: clientId,
        name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'New Client',
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
        address: body.address || '',
        city: body.city || '',
        state: body.state || '',
        zipCode: body.zipCode || '',
        type: body.type || 'residential',
        entityType: body.entityType || 'client',
        businessType: body.businessType || '',
        contactType: body.contactType || body.entityType || 'client',
        status: body.status || 'lead',
        notes: body.notes || '',
        projects: body.projects || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseNumber: body.licenseNumber,
        insuranceNumber: body.insuranceNumber,
        hourlyRate: body.hourlyRate,
        workAddress: body.workAddress,
        accountNumber: body.accountNumber,
        taxId: body.taxId,
        tags: body.tags || [],
        ...body
      };

      // Add to in-memory store
      addToDevClientsStore(newClient);

      // Also add to file store for persistence
      const fileContact = {
        id: newClient.id,
        _id: newClient._id,
        name: newClient.name,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company,
        address: newClient.address,
        city: newClient.city,
        state: newClient.state,
        zipCode: newClient.zipCode,
        type: newClient.type,
        entityType: newClient.entityType,
        businessType: newClient.businessType,
        contactType: newClient.contactType,
        status: newClient.status,
        notes: newClient.notes,
        createdAt: newClient.createdAt,
        updatedAt: newClient.updatedAt,
        tags: newClient.tags,
        ...body
      };

      addContactToFile(fileContact);

      // Verify the contact was added successfully
      const verification = findInDevClientsStore(newClient.id);
      if (!verification) {
        return NextResponse.json(
          { error: 'Failed to save contact to store' },
          { status: 500 }
        );
      }

      return NextResponse.json(newClient, { status: 201 });
    }

    // Final fallback - create mock client
    const newClient = {
      id: String(Date.now()),
      _id: String(Date.now()),
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'New Client',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
