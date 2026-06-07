import { Navigation } from "@/components/Navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-warm-gradient">
      <Navigation />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
