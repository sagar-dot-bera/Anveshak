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
  FolderOpen,
  ChevronRight,
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
  { label: 'Upload', icon: Upload, path: '/upload' },
  { label: 'Chat', icon: MessageSquare, path: '/talk-to-paper' },
  { label: 'Compare', icon: GitCompare, path: '/compare' },
  { label: 'Analyze', icon: Sparkles, path: '/semantic-search' },
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
    const ts = session.createdAt ? new Date(session.createdAt).getTime() : Date.now();
    realActivities.push({
      id: `chat-${session.sessionId}`,
      type: 'ai',
      title: 'AI Chat Session Active',
      description: `Talk to Paper conversation.`,
      timeAgo: formatTimeAgo(session.createdAt),
      timestamp: ts,
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
    <div className="p-6 md:p-8 max-w-[1440px] space-y-6">

      {/* ── Greeting Row ─────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
            {getGreeting()}, {userName}
          </h1>
          <p className="font-inter text-sm text-slate-500 mt-1.5">
            Continue where you left off in{' '}
            <Link to="/my-papers" className="text-vibrant-blue hover:text-primary font-medium transition-colors">
              {continuingProjectName}.
            </Link>
          </p>
        </div>

        {/* Active Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 font-inter text-xs text-deep-indigo font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{papers?.length || 0} Saved Papers</span>
          </div>
        </div>
      </div>

      {/* ── Real Stat Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Papers"
          value={(papers?.length || 0).toString()}
          badge={
            <Link to="/my-papers" className="text-vibrant-blue hover:underline text-[10px] font-semibold">
              Manage Library
            </Link>
          }
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="AI Conversations"
          value={(chatSessions?.length || 0).toString()}
          badge={
            <Link to="/talk-to-paper" className="text-vibrant-blue hover:underline text-[10px] font-semibold">
              Open Chat
            </Link>
          }
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Lit Reviews"
          value={(collections?.length || 0).toString()}
          badge={
            <Link to="/literature-reviews" className="text-vibrant-blue hover:underline text-[10px] font-semibold">
              Synthesize
            </Link>
          }
        />
        <StatCard
          icon={<Map className="w-5 h-5" />}
          label="Roadmaps"
          value={(roadmaps?.length || 0).toString()}
          badge={
            <Link to="/research-roadmaps" className="text-vibrant-blue hover:underline text-[10px] font-semibold">
              Generate
            </Link>
          }
        />
      </div>

      {/* ── Main Two-Column Row ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

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

        {/* RIGHT: Quick Actions + Real Recent Activity */}
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

          {/* Dynamic Recent Activity */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 flex-1 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-hanken font-semibold text-sm text-slate-900">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-0 divide-y divide-slate-50">
              {sortedActivities.length > 0 ? (
                sortedActivities.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 font-inter text-xs">
                  No recent research activities yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Research Collections ─────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-hanken font-semibold text-base text-slate-900">
              Your Collections
            </h2>
            <p className="font-inter text-xs text-slate-400 mt-0.5">
              Groups of papers you're actively organizing for review.
            </p>
          </div>
          <Link
            to="/literature-reviews"
            className="font-inter text-xs font-semibold text-vibrant-blue hover:text-primary transition-colors flex items-center gap-0.5"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {collections.slice(0, 4).map((collection) => (
              <Link
                key={collection.id}
                to="/literature-reviews"
                className="border border-slate-100 rounded-lg p-4 flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-indigo-100 transition-colors">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <p className="font-hanken font-semibold text-sm text-slate-800 truncate">
                  {collection.name}
                </p>
                <p className="font-mono text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  {collection.papers?.length || 0} {collection.papers?.length === 1 ? 'Paper' : 'Papers'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FolderOpen className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-inter text-sm text-slate-400">No collections yet.</p>
            <Link
              to="/literature-reviews"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-medium text-xs transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Start a Literature Review
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
