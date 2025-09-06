// Minimal server placeholder for /dashboard/financial/new to avoid build-time serialization issues.
export const dynamic = 'force-dynamic';

export default function FinancialNewPlaceholder() {
	// lightweight server-side render only, no imports
	// eslint-disable-next-line no-console
	console.log('Rendering placeholder for /dashboard/financial/new (app tree)');

	return (
		<div style={{ padding: 24 }}>
			<h1>New Financial Document (placeholder)</h1>
			<p>This is a minimal server-side placeholder used during build debugging.</p>
		</div>
	);
}
