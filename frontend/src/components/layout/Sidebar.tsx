import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Search,
  MessageSquare,
  GitCompare,
  BookOpen,
  Map,
  Settings,
  HelpCircle,
  Plus,
  LogOut,
} from 'lucide-react';
import logo from '@/assets/logo.svg';
import { getProfile } from '@/api/userApi';
import { clearTokens } from '@/lib/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Papers', icon: FileText, path: '/my-papers' },
  { label: 'Upload', icon: Upload, path: '/upload' },
  { label: 'Semantic Search', icon: Search, path: '/semantic-search' },
  { label: 'Talk to Paper', icon: MessageSquare, path: '/talk-to-paper' },
  { label: 'Compare', icon: GitCompare, path: '/compare' },
  { label: 'Literature Reviews', icon: BookOpen, path: '/literature-reviews' },
  { label: 'Research Roadmaps', icon: Map, path: '/research-roadmaps' },
];

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Support', icon: HelpCircle, path: '/support' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const handleLogout = () => {
    clearTokens();
    navigate('/login', { replace: true });
  };

  const userInitials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Researcher';

  return (
    <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-slate-100 flex flex-col sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-deep-indigo flex items-center justify-center">
          <img src={logo} alt="Anveshak" className="w-5 h-5 object-contain brightness-0 invert" />
        </div>
        <div>
          <p className="font-hanken font-bold text-sm text-slate-900 leading-none">Anveshak</p>
          <p className="font-mono text-[9px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
            AI Research Assistant
          </p>
        </div>
      </div>

      {/* New Project CTA */}
      <div className="px-4 py-4">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-medium text-sm transition-all duration-200 shadow-sm active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-50 text-deep-indigo'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-deep-indigo' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-4" />

      {/* Bottom Nav */}
      <nav className="px-3 py-2 space-y-0.5" aria-label="Settings navigation">
        {bottomItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-50 text-deep-indigo'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-deep-indigo' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>Logout</span>
        </button>
      </nav>

      {/* User profile card */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-deep-indigo text-white flex items-center justify-center font-mono text-xs font-semibold shadow-sm">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-hanken font-bold text-xs text-slate-800 truncate leading-tight">
            {userName}
          </p>
          <p className="font-inter text-[10px] text-slate-400 truncate leading-none mt-0.5">
            {profile?.email || 'Active Session'}
          </p>
        </div>
      </div>
    </aside>
  );
}
