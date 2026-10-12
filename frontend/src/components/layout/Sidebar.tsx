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
    <aside className="relative w-[260px] flex-shrink-0 self-stretch bg-[#12122a] text-white flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Glow pools behind the nav */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-600/30 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-10 -right-24 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl animate-float" />

      {/* Brand Header */}
      <div className="relative flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(99,102,241,0.8)]">
          <img src={logo} alt="Anveshak" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <p className="font-hanken font-extrabold text-lg text-white leading-none tracking-tight">Anveshak</p>
          <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-indigo-300/80 uppercase mt-1">
            AI Research Studio
          </p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="relative flex-1 px-3 pt-2 pb-4 space-y-1" aria-label="Main navigation">
        <p className="px-3 pb-2 font-mono text-[9px] font-semibold tracking-[0.2em] text-white/35 uppercase">Workspace</p>
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-inter font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                  : 'text-white/60 hover:bg-white/6 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_6px_16px_-6px_rgba(99,102,241,0.9)]'
                      : 'bg-white/6 text-white/70 group-hover:bg-white/10 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <nav className="relative px-3 py-2 space-y-0.5 border-t border-white/8" aria-label="Account">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-inter font-medium text-white/55 hover:bg-rose-500/15 hover:text-rose-300 transition-all duration-150 cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </nav>

      {/* User profile card */}
      <div className="relative m-3 mt-1 p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-indigo-400 to-violet-400 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-[#12122a] text-white flex items-center justify-center font-hanken text-sm font-bold">
            {userInitials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-hanken font-bold text-sm text-white truncate leading-tight">
            {userName}
          </p>
          <p className="font-inter text-[11px] text-white/50 truncate leading-none mt-1">
            {profile?.email || 'Active Session'}
          </p>
        </div>
      </div>
    </aside>
  );
}
