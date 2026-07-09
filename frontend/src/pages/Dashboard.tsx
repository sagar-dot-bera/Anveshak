import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  MessageSquare,
  BookOpen,
  Map,
  TrendingUp,
  Star,
  Upload,
  GitCompare,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import PaperListItem from '@/components/common/PaperListItem';
import ActivityItem from '@/components/common/ActivityItem';
import { getProfile } from '@/api/userApi';
import { listPapers } from '@/api/papersApi';
import { listChatSessions } from '@/api/chatApi';
import { listCollections } from '@/api/collectionsApi';
import {
  mockCollaborators,
  mockRecentActivity,
} from '@/data/dashboardMockData';

// Quick Action button data
const quickActions = [
  { label: 'Upload', icon: Upload, path: '/upload' },
  { label: 'Chat', icon: MessageSquare, path: '/talk-to-paper' },
  { label: 'Compare', icon: GitCompare, path: '/compare' },
  { label: 'Analyze', icon: Sparkles, path: '/semantic-search' },
];

// SVG graph node data for Knowledge Connectivity placeholder
const graphNodes = [
  { cx: 200, cy: 220, r: 8, fill: '#4f46e5', label: 'Deep Learning' },
  { cx: 340, cy: 140, r: 6, fill: '#4f46e5', label: 'Genomics' },
  { cx: 480, cy: 200, r: 9, fill: '#4f46e5', label: 'Neural Nets' },
  { cx: 600, cy: 130, r: 6, fill: '#4f46e5', label: 'Finance' },
  { cx: 520, cy: 300, r: 6, fill: '#3b82f6', label: 'Vision' },
  { cx: 380, cy: 310, r: 5, fill: '#3b82f6', label: 'Transformers' },
  { cx: 260, cy: 340, r: 5, fill: '#f59e0b', label: 'Ethics' },
  { cx: 680, cy: 250, r: 5, fill: '#3b82f6', label: 'CV Review' },
  { cx: 150, cy: 310, r: 4, fill: '#f59e0b', label: 'NLP' },
  { cx: 700, cy: 160, r: 4, fill: '#4f46e5', label: 'Portfolio' },
];

const graphLinks = [
  { x1: 200, y1: 220, x2: 340, y2: 140 },
  { x1: 340, y1: 140, x2: 480, y2: 200 },
  { x1: 480, y1: 200, x2: 600, y2: 130 },
  { x1: 480, y1: 200, x2: 520, y2: 300 },
  { x1: 520, y1: 300, x2: 380, y2: 310 },
  { x1: 380, y1: 310, x2: 260, y2: 340 },
  { x1: 260, y1: 340, x2: 200, y2: 220 },
  { x1: 600, y1: 130, x2: 700, y2: 160 },
  { x1: 520, y1: 300, x2: 680, y2: 250 },
  { x1: 260, y1: 340, x2: 150, y2: 310 },
  { x1: 200, y1: 220, x2: 150, y2: 310 },
];

export default function Dashboard() {
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: papers, isLoading: isPapersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: listPapers,
  });

  const { data: chatSessions } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: listChatSessions,
  });

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: listCollections,
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isLoading = isProfileLoading || isPapersLoading;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-deep-indigo border-t-transparent" />
          <p className="font-inter text-sm text-slate-500 font-medium">Loading research space...</p>
        </div>
      </div>
    );
  }

  // Sort papers by createdAt descending
  const recentPapers = [...(papers || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const userName = profile ? `${profile.firstName} ${profile.lastName}` : 'Researcher';
  const continuingProjectName = collections?.length ? collections[0].name : 'My Papers';

  return (
    <div className="p-6 md:p-8 max-w-[1440px] space-y-6">

      {/* ── Greeting Row ─────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
            {getGreeting()}, {userName}
          </h1>
          <p className="font-inter text-sm text-slate-500 mt-1.5">
            Continue where you left off in{' '}
            <Link to="/dashboard" className="text-vibrant-blue hover:text-primary font-medium transition-colors">
              {continuingProjectName}.
            </Link>
          </p>
        </div>

        {/* Collaborators */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {mockCollaborators.map((c) => (
              <div
                key={c.initials}
                className={`w-7 h-7 rounded-full border-2 border-white ${c.color} flex items-center justify-center font-mono text-[9px] font-bold text-white shadow-sm`}
              >
                {c.initials}
              </div>
            ))}
          </div>
          <span className="font-inter text-xs text-slate-500">
            3 collaborators active
          </span>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Papers"
          value={(papers?.length || 0).toString()}
          badge={
            <span className="flex items-center gap-1 text-success-green font-semibold">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          }
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="AI Conversations"
          value={(chatSessions?.length || 0).toString()}
          badge={<span className="text-slate-400">Total Sessions</span>}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Lit Reviews"
          value={(collections?.length || 0).toString()}
          badge={
            <span className="flex items-center gap-1 text-warning-amber font-semibold">
              <Star className="w-3 h-3 fill-warning-amber" />
              Active
            </span>
          }
        />
        <StatCard
          icon={<Map className="w-5 h-5" />}
          label="Roadmaps"
          value="1"
          badge={
            <Link to="/dashboard" className="text-vibrant-blue hover:underline text-[10px] font-semibold">
              View All
            </Link>
          }
        />
      </div>

      {/* ── Main Two-Column Row ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* LEFT: Recently Uploaded Papers */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-hanken font-semibold text-base text-slate-900">
              Recently Uploaded Papers
            </h2>
            <Link
              to="/my-papers"
              className="font-inter text-xs font-semibold text-vibrant-blue hover:text-primary transition-colors"
            >
              View Library
            </Link>
          </div>

          <div className="space-y-0 divide-y divide-slate-50">
            {recentPapers.length > 0 ? (
              recentPapers.map((paper) => (
                <PaperListItem key={paper.id} paper={paper} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-inter text-sm text-slate-400">No papers uploaded yet.</p>
                <Link
                  to="/upload"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-medium text-xs transition-all shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload First Paper
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick Actions + Recent Activity */}
        <div className="flex flex-col gap-5">

          {/* Quick Actions */}
          <div className="bg-deep-indigo rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(49,46,129,0.4)]">
            <h2 className="font-hanken font-semibold text-sm text-white/90 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <Link
                  key={label}
                  to={path}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all cursor-pointer group"
                >
                  <Icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                  <span className="font-inter text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 flex-1 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-hanken font-semibold text-sm text-slate-900">
                Recent Activity
              </h2>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-0 divide-y divide-slate-50">
              {mockRecentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Knowledge Connectivity ────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="font-hanken font-semibold text-base text-slate-900">
              Knowledge Connectivity
            </h2>
            <p className="font-inter text-xs text-slate-400 mt-0.5">
              AI-generated semantic map of your current research projects.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="font-mono text-[10px] font-semibold tracking-wider text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors">
              3D VIEW
            </button>
            <button className="font-mono text-[10px] font-semibold tracking-wider text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors">
              FILTER
            </button>
          </div>
        </div>

        {/* SVG Placeholder Graph */}
        <div className="w-full h-64 md:h-80 rounded-lg bg-slate-50/60 overflow-hidden mt-4 relative">
          <svg
            viewBox="0 0 860 400"
            className="w-full h-full"
            aria-label="Knowledge connectivity graph"
          >
            {/* Links */}
            {graphLinks.map((link, i) => (
              <line
                key={i}
                x1={link.x1} y1={link.y1}
                x2={link.x2} y2={link.y2}
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            ))}

            {/* Nodes */}
            {graphNodes.map((node) => (
              <g key={node.label} className="cursor-pointer group">
                <circle
                  cx={node.cx} cy={node.cy} r={node.r + 4}
                  fill={node.fill}
                  opacity="0.08"
                />
                <circle
                  cx={node.cx} cy={node.cy} r={node.r}
                  fill={node.fill}
                  opacity="0.85"
                />
                <text
                  x={node.cx} y={node.cy + node.r + 13}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#4f46e5]"></span>
            <span className="font-inter text-xs text-slate-500">Direct Citation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
            <span className="font-inter text-xs text-slate-500">Semantic Link</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
            <span className="font-inter text-xs text-slate-500">New Discovery</span>
          </div>
        </div>
      </div>

    </div>
  );
}
