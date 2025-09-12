import { NextResponse } from 'next/server';

export async function GET() {
  // Return empty response - no demo data
  return NextResponse.json(null);
}
