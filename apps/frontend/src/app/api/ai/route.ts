import { NextRequest, NextResponse } from 'next/server';

// Simple placeholder AI route to unblock build. In future, integrate real model or backend proxy.
export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}));
		const { message } = body;
		if (!message || typeof message !== 'string') {
			return NextResponse.json({ error: 'Missing message' }, { status: 400 });
		}
		// Echo-style stub response
		return NextResponse.json({
			reply: `AI placeholder response for: ${message}`,
			actions: [],
			timestamp: new Date().toISOString(),
		});
	} catch (err: any) {
		return NextResponse.json({ error: 'AI route error', detail: err?.message }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({ status: 'ok', message: 'AI route ready' });
}

