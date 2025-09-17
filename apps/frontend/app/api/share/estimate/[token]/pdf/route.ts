import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/share/estimate/${token}/pdf`, {
      method: 'GET',
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: backendResponse.status }
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await backendResponse.arrayBuffer();
    
    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate-${token}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}