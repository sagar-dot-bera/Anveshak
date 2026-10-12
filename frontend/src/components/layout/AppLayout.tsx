import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex flex-1 min-h-0 bg-background overflow-hidden">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Page content scrollable area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-aurora">
        <Outlet />
      </main>
    </div>
  );
}
