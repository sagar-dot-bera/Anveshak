import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  History,
  UserCircle,
  ArrowRight,
  PlayCircle,
  PenTool,
  Waypoints,
  ShieldCheck,
  Map,
  GitCompare,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { isAuthenticated } from '@/lib/authStore';
import {
  landingHero,
  landingHighlights,
  landingFeatures,
  landingRoadmapPreview,
  landingRigorPoints,
  landingRigorRoadmap,
  landingFooterLinks,
} from '@/data/landingMockData';

const highlightIconMap = { PenTool, Waypoints, ShieldCheck };
const featureIconMap = { Search, Map, GitCompare, BookOpen };

export default function LandingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleDemo = () => {
    toast.info('Starting product demo walk...', {
      description: 'Redirecting to workspace...',
    });
    setTimeout(() => navigate(loggedIn ? '/dashboard' : '/login'), 1000);
  };

  const heroParts = landingHero.title.split(landingHero.highlight);

  return (
    <div className="bg-white min-h-screen text-slate-800 flex flex-col font-sans">

      {/* ── Public Navigation Bar ────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 select-none">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 rounded-lg bg-deep-indigo flex items-center justify-center">
              <img src={logo} alt="Anveshak" className="w-4 h-4 object-contain brightness-0 invert" />
            </div>
            <span className="font-hanken font-bold text-sm text-slate-900">Anveshak</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-inter font-medium">
            <a href="#" className="text-primary font-semibold">Home</a>
            <a href="#features" className="text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link to="/semantic-search" className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" aria-label="Search">
                <Search className="w-4.5 h-4.5" />
              </Link>
              <button
                onClick={() => toast.info('No new notifications')}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
              </button>
              <Link to="/talk-to-paper" className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" aria-label="Recent activity">
                <History className="w-4.5 h-4.5" />
              </Link>
              <Link to="/dashboard" className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" aria-label="Go to dashboard">
                <UserCircle className="w-4.5 h-4.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-inter font-semibold text-xs transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-xs transition-all shadow active:scale-[0.98]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-16 pb-12 md:pt-24 md:pb-16 max-w-[720px] mx-auto w-full text-center select-none">
        <h1 className="font-hanken font-bold text-4xl md:text-5xl text-slate-900 tracking-tight leading-[1.1]">
          {heroParts[0]}
          <span className="text-vibrant-blue">{landingHero.highlight}</span>
          {heroParts[1]}
        </h1>

        <p className="font-inter text-slate-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto mt-5">
          {landingHero.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to="/signup"
            className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-sm transition-all shadow-sm active:scale-[0.97]"
          >
            Start Researching
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDemo}
            className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-inter font-semibold text-sm transition-all active:scale-[0.97]"
          >
            <PlayCircle className="w-4 h-4" />
            View Demo
          </button>
        </div>
      </section>

      {/* ── Highlights Band ─────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-14 select-none">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {landingHighlights.map((item) => {
            const Icon = highlightIconMap[item.icon];
            return (
              <div key={item.id} className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-100/70 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-hanken font-semibold text-sm text-slate-900">
                  {item.title}
                </h3>
                <p className="font-inter text-xs text-slate-500 leading-relaxed max-w-[220px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Designed for Deep Focus ──────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-16 md:py-24 max-w-[1000px] mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-none">
            Designed for Deep Focus
          </h2>
          <p className="font-inter text-slate-500 text-sm max-w-lg mx-auto">
            Powerful tools hidden behind a minimalist, distraction-free interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left select-none">
          {landingFeatures.map((feature) => {
            const Icon = featureIconMap[feature.icon];
            return (
              <div
                key={feature.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary mb-3">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-hanken font-bold text-slate-800 text-base leading-snug">
                  {feature.title}
                </h3>
                <p className="font-inter text-xs text-slate-500 leading-relaxed mt-1.5">
                  {feature.description}
                </p>

                {/* Semantic Search preview */}
                {feature.id === 'feat-1' && (
                  <div className="border border-slate-100 rounded-xl bg-slate-50/60 p-3 mt-5 space-y-1.5">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-400">
                      <Search className="w-3 h-3 flex-shrink-0" />
                      <span className="font-inter text-[11px] truncate">"{landingRoadmapPreview.query}"</span>
                    </div>
                    <p className="font-mono text-[10px] font-semibold text-slate-500 pl-1">
                      Found {landingRoadmapPreview.resultCount} relevant papers across your library.
                    </p>
                  </div>
                )}

                {/* Research Roadmaps preview */}
                {feature.id === 'feat-2' && (
                  <div className="border border-slate-100 rounded-xl bg-slate-50/60 p-3 mt-5 space-y-2">
                    {landingRoadmapPreview.stages.map((stage) => (
                      <div key={stage.title} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {stage.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-success-green flex-shrink-0" />}
                          {stage.status === 'in-progress' && <CircleDot className="w-3.5 h-3.5 text-vibrant-blue flex-shrink-0" />}
                          {stage.status === 'pending' && <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                          <span className="font-inter text-[11px] text-slate-600 truncate">{stage.title}</span>
                        </div>
                        {stage.status === 'completed' && (
                          <span className="font-mono text-[8px] font-bold text-success-green bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">COMPLETED</span>
                        )}
                        {stage.status === 'in-progress' && (
                          <span className="font-mono text-[8px] font-bold text-vibrant-blue bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">IN PROGRESS</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Lit Review Generation preview */}
                {feature.id === 'feat-4' && (
                  <div className="border border-slate-100 rounded-xl bg-slate-50/60 p-3 mt-5 space-y-2">
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-slate-200 rounded w-full" />
                      <div className="h-1.5 bg-slate-200 rounded w-11/12" />
                      <div className="h-1.5 bg-slate-200 rounded w-4/6" />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      {landingRoadmapPreview.litReviewCitations.map((c) => (
                        <span key={c} className="font-mono text-[9px] font-semibold text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Elevate Your Academic Rigor ──────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-16 md:py-24 select-none">
        <div className="px-6 md:px-12 max-w-[1000px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: checklist */}
          <div className="space-y-6 text-left">
            <h2 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-snug">
              Elevate Your Academic Rigor
            </h2>
            <div className="space-y-5">
              {landingRigorPoints.map((point) => (
                <div key={point.id} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-hanken font-semibold text-sm text-slate-900">
                      {point.title}
                    </h3>
                    <p className="font-inter text-xs text-slate-500 leading-relaxed mt-0.5">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: roadmap mockup card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-primary" />
                  <span className="font-inter text-xs font-semibold text-slate-800">{landingRigorRoadmap.title}</span>
                </div>
                <span className="font-mono text-[9px] font-bold text-success-green bg-emerald-50 px-1.5 py-0.5 rounded">
                  {landingRigorRoadmap.progress}
                </span>
              </div>

              <div className="space-y-2">
                {landingRigorRoadmap.stages.map((stage) => (
                  <div
                    key={stage.title}
                    className={`rounded-lg p-3 flex items-start gap-2.5 ${
                      stage.status === 'active' ? 'bg-indigo-50/60 border border-indigo-100' : 'border border-slate-100'
                    }`}
                  >
                    {stage.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-success-green flex-shrink-0 mt-0.5" />}
                    {stage.status === 'active' && <CircleDot className="w-4 h-4 text-vibrant-blue flex-shrink-0 mt-0.5" />}
                    {stage.status === 'pending' && <Circle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-inter text-xs font-semibold text-slate-800 truncate">{stage.title}</span>
                        {stage.badge && (
                          <span className="font-mono text-[8px] font-bold text-vibrant-blue bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                            {stage.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-inter text-[10px] text-slate-500 mt-0.5">{stage.meta}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 font-inter text-xs font-semibold text-slate-800">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    {landingRigorRoadmap.synthesis.title}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-success-green bg-emerald-50 px-1.5 py-0.5 rounded">
                    {landingRigorRoadmap.synthesis.citations}
                  </span>
                </div>
                <p className="font-inter text-[11px] text-slate-500 italic leading-relaxed">
                  "{landingRigorRoadmap.synthesis.quote}"
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer Section ──────────────────────────────── */}
      <footer className="bg-white py-6 px-6 md:px-12 select-none">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-deep-indigo flex items-center justify-center">
              <img src={logo} alt="Anveshak" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
            </div>
            <span className="font-hanken font-bold text-xs text-slate-900">Anveshak</span>
            <span className="font-inter text-[11px] text-slate-400 ml-2">
              &copy; 2026 Anveshak AI Research. Built for academic rigor.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-inter text-xs text-slate-500">
            {landingFooterLinks.map((label) => (
              <button
                key={label}
                onClick={() => toast.info(`${label} page`)}
                className="hover:text-slate-900 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
