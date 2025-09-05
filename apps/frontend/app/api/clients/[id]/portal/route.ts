import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In a real implementation, create a signed tokenized URL.
  // For now, return a plain portal path.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/portal/${params.id}`;
  return NextResponse.json({ success: true, url });
}
