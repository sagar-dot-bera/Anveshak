import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky top bar */}
        <Topbar />

        {/* Page content scrollable area */}
        <main className="flex-1 overflow-y-auto bg-[#f7f9fb]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
