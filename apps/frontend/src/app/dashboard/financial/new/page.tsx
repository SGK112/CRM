// Minimal placeholder used to isolate prerender serialization issues.
// Keep this file client-only and dynamic while we bisect imports.

'use server';
export const dynamic = 'force-dynamic';

export default function NewFinancialDocumentPagePlaceholder() {
  // log so we can see server render activity during build
  // eslint-disable-next-line no-console
  console.log('Rendering server-side: /dashboard/financial/new');

  return (
    <div style={{ padding: 24 }}>
      <h1>New Financial Document (server placeholder)</h1>
      <p>Minimal server-side page used while debugging prerender issues.</p>
    </div>
  );
}
