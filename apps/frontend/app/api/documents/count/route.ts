import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookie header if present
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({ count: 0, recent: 0 });
    }

    const documents = await response.json();
    const count = Array.isArray(documents) ? documents.length : 0;
    
    // Calculate recent documents (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = Array.isArray(documents) 
      ? documents.filter(doc => new Date(doc.createdAt || doc.uploadedAt || '1970-01-01') > weekAgo).length 
      : 0;
    
    return NextResponse.json({ count, recent });
  } catch (error) {
    return NextResponse.json({ count: 0, recent: 0 });
  }
}
