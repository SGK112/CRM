export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      {children}
    </div>
  );
}
