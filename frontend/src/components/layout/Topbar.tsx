import { Search, Bell, Moon } from 'lucide-react';
import logo from '@/assets/logo.svg';

export default function Topbar() {
  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Area */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search your research library..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-inter text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all"
          />
        </div>

        {/* Tabs: Recent / Starred */}
        <div className="flex items-center gap-1">
          <button className="font-inter text-sm font-semibold text-deep-indigo border-b-2 border-deep-indigo pb-0.5 px-1 transition-colors">
            Recent
          </button>
          <button className="font-inter text-sm font-medium text-slate-400 hover:text-slate-700 pb-0.5 px-1 transition-colors ml-2">
            Starred
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Upgrade to Pro */}
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-medium text-xs transition-all shadow-sm active:scale-[0.98]">
          Upgrade to Pro
        </button>

        {/* Notification Bell */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-deep-indigo"></span>
        </button>

        {/* Dark Mode Toggle */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Moon className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 hover:border-deep-indigo transition-colors flex items-center justify-center bg-indigo-100 flex-shrink-0">
          <img
            src={logo}
            alt="User avatar"
            className="w-5 h-5 object-contain opacity-60"
          />
        </button>
      </div>
    </header>
  );
}
