import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import MobileNav from '@/components/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="flex w-full max-w-6xl">
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-64 xl:w-72 sticky top-0 h-screen border-r border-surface-border px-4 py-6">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen border-r border-surface-border bg-white pb-16 md:pb-0">
          {children}
        </main>

        {/* Right Panel */}
        <aside className="hidden lg:block w-80 xl:w-96 sticky top-0 h-screen px-4 py-6 overflow-y-auto">
          <RightPanel />
        </aside>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
