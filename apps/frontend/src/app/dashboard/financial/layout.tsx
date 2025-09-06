export const dynamic = 'force-dynamic';

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout used only for build debugging to avoid global providers
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white text-black">
          {children}
        </div>
      </body>
    </html>
  );
}
