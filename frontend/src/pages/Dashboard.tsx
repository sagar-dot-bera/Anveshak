import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  MessageSquare,
  BookOpen,
  Map,
  Upload,
  GitCompare,
  Sparkles,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import PaperListItem from '@/components/common/PaperListItem';
import ActivityItem from '@/components/common/ActivityItem';
import { getProfile } from '@/api/userApi';
import { listPapers } from '@/api/papersApi';
import { listChatSessions } from '@/api/chatApi';
import { listCollections } from '@/api/collectionsApi';
import { getAllRoadmaps } from '@/api/roadmapApi';

// Quick Action button data
const quickActions = [
  { label: 'Upload', icon: Upload, path: '/upload', tint: 'from-indigo-500 to-violet-500' },
  { label: 'Chat', icon: MessageSquare, path: '/talk-to-paper', tint: 'from-emerald-500 to-teal-400' },
  { label: 'Compare', icon: GitCompare, path: '/compare', tint: 'from-violet-500 to-purple-600' },
  { label: 'Analyze', icon: Sparkles, path: '/semantic-search', tint: 'from-cyan-500 to-sky-500' },
];

// Helper to format relative time
function formatTimeAgo(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'RECENTLY';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}D AGO`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

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

  const { data: roadmaps } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: getAllRoadmaps,
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
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-r-violet-500 border-b-violet-300 border-t-transparent" />
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

  // Build real dynamic Recent Activity stream across user's entities
  const realActivities: any[] = [];

  (papers || []).forEach((paper) => {
    realActivities.push({
      id: `paper-${paper.id}`,
      type: 'review',
      title: 'Paper Added to Library',
      description: paper.title,
      timeAgo: formatTimeAgo(paper.createdAt),
      timestamp: new Date(paper.createdAt).getTime(),
    });
  });

  (chatSessions || []).forEach((session) => {
    realActivities.push({
      id: `chat-${session.sessionId}`,
      type: 'ai',
      title: 'AI Chat Session Active',
      description: `Talk to Paper conversation.`,
      timeAgo: formatTimeAgo(session.createdAt),
      timestamp: new Date(session.createdAt).getTime(),
    });
  });

  (roadmaps || []).forEach((rm) => {
    const ts = rm.createdAt ? new Date(rm.createdAt).getTime() : Date.now();
    realActivities.push({
      id: `rm-${rm.id}`,
      type: 'share',
      title: 'Research Roadmap Generated',
      description: rm.topic ? `Topic: "${rm.topic}"` : 'AI Research Roadmap',
      timeAgo: formatTimeAgo(rm.createdAt),
      timestamp: ts,
    });
  });

  const sortedActivities = realActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] space-y-7">

      {/* ── Greeting Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#141433] text-white px-7 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-indigo-600/45 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 w-96 h-72 rounded-full bg-violet-600/30 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/15 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-white/85">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {papers?.length || 0} papers in your library
            </span>
            <h1 className="font-hanken font-extrabold text-3xl md:text-5xl leading-[1.05] mt-4">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-sky-200 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>
            <p className="font-inter text-sm md:text-base text-white/70 mt-3">
              Continue where you left off in{' '}
              <Link to="/my-papers" className="font-bold text-white underline decoration-indigo-300 decoration-2 underline-offset-4 hover:decoration-sky-300 transition-colors">
                {continuingProjectName}
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ label, icon: Icon, path, tint }) => (
              <Link
                key={label}
                to={path}
                className="group flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur transition-all hover:-translate-y-0.5"
              >
                <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${tint} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </span>
                <span className="font-inter text-sm font-bold text-white">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          tone="indigo"
          icon={<FileText className="w-5 h-5" />}
          label="Total Papers"
          value={(papers?.length || 0).toString()}
          badge={<Link to="/my-papers">Manage →</Link>}
        />
        <StatCard
          tone="violet"
          icon={<MessageSquare className="w-5 h-5" />}
          label="AI Conversations"
          value={(chatSessions?.length || 0).toString()}
          badge={<Link to="/talk-to-paper">Open chat →</Link>}
        />
        <StatCard
          tone="sky"
          icon={<BookOpen className="w-5 h-5" />}
          label="Lit Reviews"
          value={(collections?.length || 0).toString()}
          badge={<Link to="/literature-reviews">Synthesize →</Link>}
        />
        <StatCard
          tone="teal"
          icon={<Map className="w-5 h-5" />}
          label="Roadmaps"
          value={(roadmaps?.length || 0).toString()}
          badge={<Link to="/research-roadmaps">Generate →</Link>}
        />
      </div>

      {/* ── Main Two-Column Row ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

        {/* LEFT: Recently Uploaded Papers */}
        <div className="bg-white/85 backdrop-blur border border-white rounded-[1.75rem] p-6 shadow-[0_20px_50px_-32px_rgba(79,70,229,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(79,70,229,0.8)]">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-hanken font-bold text-lg text-slate-900 leading-tight">
                  Recently Uploaded
                </h2>
                <p className="font-inter text-xs text-slate-500">Your newest additions, ready to explore</p>
              </div>
            </div>
            <Link
              to="/my-papers"
              className="font-inter text-xs font-bold px-3.5 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              View Library →
            </Link>
          </div>

          <div className="space-y-0">
            {recentPapers.length > 0 ? (
              recentPapers.map((paper) => (
                <PaperListItem key={paper.id} paper={paper} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-dashed border-indigo-200">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mb-3 rotate-[-6deg] shadow-lg">
                  <FileText className="w-7 h-7" />
                </div>
                <p className="font-hanken font-bold text-base text-slate-800">Your library is waiting</p>
                <p className="font-inter text-sm text-slate-500 mt-1">Drop in your first paper to get started.</p>
                <Link
                  to="/upload"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-deep-indigo text-white font-inter font-bold text-xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload First Paper
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Recent Activity */}
        <div className="bg-white/85 backdrop-blur border border-white rounded-[1.75rem] p-6 shadow-[0_20px_50px_-32px_rgba(79,70,229,0.35)]">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(245,158,11,0.7)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-hanken font-bold text-lg text-slate-900 leading-tight">
                Recent Activity
              </h2>
              <p className="font-inter text-xs text-slate-500">What's been happening</p>
            </div>
          </div>
          <div className="space-y-0">
            {sortedActivities.length > 0 ? (
              sortedActivities.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 font-inter text-sm">
                No research activity yet — it'll show up here.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
