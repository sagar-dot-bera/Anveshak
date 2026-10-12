import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
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
  Sparkles,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { isAuthenticated } from '@/lib/authStore';
import { useDemoLogin } from '@/lib/useDemoLogin';
import {
  landingHero,
  landingHighlights,
  landingFeatures,
  landingRoadmapPreview,
  landingRigorPoints,
  landingRigorRoadmap,
} from '@/data/landingMockData';

const highlightIconMap = { PenTool, Waypoints, ShieldCheck };
const featureIconMap = { Search, Map, GitCompare, BookOpen };

const highlightTones = [
  'from-violet-500 to-fuchsia-500 shadow-[0_14px_30px_-12px_rgba(139,92,246,0.9)]',
  'from-pink-500 to-orange-400 shadow-[0_14px_30px_-12px_rgba(236,72,153,0.9)]',
  'from-teal-400 to-cyan-500 shadow-[0_14px_30px_-12px_rgba(20,184,166,0.9)]',
];

// Bento tiles: each feature gets its own colourway.
const featureTones: Record<string, { tile: string; icon: string; ring: string }> = {
  'feat-1': { tile: 'bg-gradient-to-br from-cyan-50 to-sky-100/70', icon: 'from-cyan-500 to-sky-500', ring: 'hover:shadow-[0_24px_50px_-24px_rgba(14,165,233,0.7)]' },
  'feat-2': { tile: 'bg-gradient-to-br from-violet-50 to-fuchsia-100/70', icon: 'from-violet-500 to-fuchsia-500', ring: 'hover:shadow-[0_24px_50px_-24px_rgba(139,92,246,0.7)]' },
  'feat-3': { tile: 'bg-gradient-to-br from-amber-50 to-orange-100/70', icon: 'from-orange-500 to-amber-400', ring: 'hover:shadow-[0_24px_50px_-24px_rgba(249,115,22,0.7)]' },
  'feat-4': { tile: 'bg-gradient-to-br from-pink-50 to-rose-100/70', icon: 'from-pink-500 to-rose-500', ring: 'hover:shadow-[0_24px_50px_-24px_rgba(236,72,153,0.7)]' },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const demo = useDemoLogin();

  useEffect(() => {
    if (demo.state === 'error') toast.error(demo.error);
  }, [demo.state, demo.error]);

  const handleDemo = () => {
    if (loggedIn) navigate('/dashboard');
    else demo.open();
  };

  const heroParts = landingHero.title.split(landingHero.highlight);

  return (
    <div className="relative isolate bg-[#fbf8ff] min-h-screen text-slate-800 flex flex-col overflow-x-hidden">

      {/* Aurora wash: spans the header and hero so the top of the page has no flat band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full bg-violet-400/40 blur-[110px] animate-float-slow" />
        <div className="absolute -top-20 -right-24 w-[32rem] h-[32rem] rounded-full bg-pink-400/40 blur-[110px] animate-float" />
        <div className="absolute top-[520px] left-1/3 w-[28rem] h-[22rem] rounded-full bg-orange-300/40 blur-[110px] animate-float-slow" />
        <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_at_50%_35%,black_15%,transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-[#fbf8ff]" />
      </div>

      {/* ── Public Navigation Bar ────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 md:px-8 pt-4 select-none">
        <div className="max-w-[1180px] mx-auto h-14 glass border border-white/80 rounded-full shadow-[0_10px_30px_-15px_rgba(124,58,237,0.35)] flex items-center justify-between pl-3 pr-2">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(99,102,241,0.8)]">
                <img src={logo} alt="Anveshak" className="w-4.5 h-4.5 object-contain brightness-0 invert" />
              </div>
              <span className="font-hanken font-extrabold text-lg text-slate-900 tracking-tight">Anveshak</span>
            </div>

            <nav className="hidden md:flex items-center gap-1 text-sm font-inter font-semibold">
              <a href="#" className="px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700">Home</a>
              <a href="#features" className="px-3.5 py-1.5 rounded-full text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">Features</a>
              <a href="#rigor" className="px-3.5 py-1.5 rounded-full text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">Why Anveshak</a>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {loggedIn ? (
              <>
                <Link to="/semantic-search" className="p-2 rounded-full text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-colors" aria-label="Search">
                  <Search className="w-4.5 h-4.5" />
                </Link>
                <Link to="/talk-to-paper" className="p-2 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" aria-label="Recent activity">
                  <History className="w-4.5 h-4.5" />
                </Link>
                <Link to="/dashboard" className="ml-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-deep-indigo text-white font-inter font-bold text-xs" aria-label="Go to dashboard">
                  <UserCircle className="w-4 h-4" />
                  Workspace
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-slate-700 hover:text-violet-700 font-inter font-bold text-sm transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-full bg-deep-indigo text-white font-inter font-bold text-sm transition-all active:scale-[0.97]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-16 pb-24 md:pt-24 md:pb-32 select-none">
        <div className="relative max-w-[1180px] mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-white/80 border border-violet-100 shadow-sm font-inter text-xs font-bold text-slate-700">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[10px] tracking-wide">NEW</span>
              AI research companion for the curious
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            </span>

            <h1 className="font-hanken font-extrabold text-5xl md:text-7xl text-slate-900 tracking-[-0.035em] leading-[0.98] mt-6">
              {heroParts[0]}
              <span className="relative inline-block">
                <span className="text-prism">{landingHero.highlight}</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 9 C 50 2, 120 2, 198 8" stroke="url(#hero-underline)" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="hero-underline" x1="0" x2="1">
                      <stop offset="0" stopColor="#8b5cf6" />
                      <stop offset="0.5" stopColor="#ec4899" />
                      <stop offset="1" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {heroParts[1]}
            </h1>

            <p className="font-inter text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mt-7">
              {landingHero.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-9">
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-deep-indigo text-white font-inter font-bold text-base transition-all active:scale-[0.97]"
              >
                Start Researching
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleDemo}
                disabled={demo.busy}
                className="disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white border-2 border-violet-100 hover:border-pink-200 text-slate-800 font-inter font-bold text-base transition-all active:scale-[0.97] shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-pink-500" />
                {demo.state === 'waking' ? 'Waking the server…' : demo.busy ? 'Opening demo…' : 'View Demo'}
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
              <div className="flex -space-x-2.5">
                {['from-violet-500 to-fuchsia-500', 'from-pink-500 to-rose-400', 'from-orange-500 to-amber-400', 'from-teal-400 to-cyan-500'].map((g, i) => (
                  <span key={g} className={`w-9 h-9 rounded-full border-[3px] border-white bg-gradient-to-br ${g} flex items-center justify-center font-hanken text-[11px] font-bold text-white`}>
                    {['JD', 'AK', 'RS', 'MP'][i]}
                  </span>
                ))}
              </div>
              <p className="font-inter text-sm text-slate-600">
                Loved by <span className="font-bold text-slate-900">10k+ researchers</span>
              </p>
            </div>
          </div>

          {/* Hero collage */}
          <div className="relative h-[460px] hidden md:block">
            {/* Chat card */}
            <div className="absolute top-0 right-0 w-[78%] bg-white rounded-[1.75rem] border border-white shadow-[0_40px_80px_-40px_rgba(124,58,237,0.6)] p-5 rotate-[2deg] animate-float-slow">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="font-hanken font-bold text-sm text-slate-900">Talk to Paper</span>
                <span className="ml-auto font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">LIVE</span>
              </div>
              <div className="space-y-2.5">
                <div className="ml-auto w-fit max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-pink-500 text-white font-inter text-xs font-medium">
                  What does DPO change compared to RLHF?
                </div>
                <div className="w-fit max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-slate-100 text-slate-700 font-inter text-xs leading-relaxed">
                  DPO drops the separate reward model and optimizes preferences directly — simpler training, comparable alignment.{' '}
                  <span className="font-mono text-[10px] font-bold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded">[p.4]</span>
                </div>
              </div>
            </div>

            {/* Search card */}
            <div className="absolute top-[42%] left-0 w-[66%] bg-white rounded-[1.5rem] border border-white shadow-[0_40px_80px_-40px_rgba(236,72,153,0.6)] p-4 rotate-[-3deg] animate-float">
              <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-100 rounded-full px-3 py-2">
                <Search className="w-3.5 h-3.5 text-cyan-600" />
                <span className="font-inter text-[11px] text-slate-600 truncate">{landingRoadmapPreview.query}</span>
              </div>
              <div className="mt-3 space-y-2">
                {[['bg-violet-500', 'w-11/12'], ['bg-pink-500', 'w-9/12'], ['bg-orange-400', 'w-10/12']].map(([c, w]) => (
                  <div key={c} className="flex items-center gap-2">
                    <span className={`w-6 h-7 rounded-md ${c} opacity-90 flex items-center justify-center`}>
                      <FileText className="w-3 h-3 text-white" />
                    </span>
                    <div className={`h-2 rounded-full bg-slate-200 ${w}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Stat bubble */}
            <div className="absolute bottom-4 right-6 bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-[1.5rem] px-5 py-4 shadow-[0_30px_60px_-25px_rgba(249,115,22,0.9)] rotate-[4deg]">
              <p className="font-hanken font-extrabold text-4xl leading-none">{landingRoadmapPreview.resultCount}</p>
              <p className="font-inter text-xs font-semibold text-white/85 mt-1">relevant papers found</p>
            </div>

            {/* Sticker */}
            <div className="absolute top-[30%] right-[-6px] w-16 h-16 rounded-full bg-amber-300 border-4 border-white shadow-lg flex items-center justify-center rotate-12">
              <Sparkles className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights Band ─────────────────────────────── */}
      <section className="relative px-4 md:px-8 -mt-10 select-none">
        <div className="max-w-[1180px] mx-auto rounded-[2rem] bg-[#1c1035] text-white overflow-hidden relative">
          <div className="pointer-events-none absolute -top-20 left-10 w-72 h-72 rounded-full bg-violet-600/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-10 w-80 h-72 rounded-full bg-pink-600/40 blur-3xl" />
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 px-8 md:px-14 py-12">
            {landingHighlights.map((item, i) => {
              const Icon = highlightIconMap[item.icon];
              return (
                <div key={item.id} className="flex flex-col items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${highlightTones[i % highlightTones.length]} flex items-center justify-center ${i % 2 ? 'rotate-6' : '-rotate-6'}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-hanken font-bold text-xl text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-inter text-sm text-white/65 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features Bento ───────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-24 md:py-32 max-w-[1180px] mx-auto w-full">
        <div className="text-center mb-14">
          <span className="inline-block font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
            Your research toolkit
          </span>
          <h2 className="font-hanken font-extrabold text-4xl md:text-5xl text-slate-900 tracking-[-0.03em] leading-[1.05] mt-5">
            Designed for <span className="text-prism">deep focus</span>
          </h2>
          <p className="font-inter text-slate-600 text-base md:text-lg max-w-xl mx-auto mt-4">
            Powerful tools behind a joyful, distraction-free interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 text-left select-none">
          {landingFeatures.map((feature, idx) => {
            const Icon = featureIconMap[feature.icon];
            const tone = featureTones[feature.id] ?? featureTones['feat-1'];
            const span = idx === 0 || idx === 3 ? 'md:col-span-4' : 'md:col-span-2';
            return (
              <div
                key={feature.id}
                className={`${span} ${tone.tile} ${tone.ring} rounded-[1.75rem] border border-white p-7 flex flex-col transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tone.icon} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-hanken font-bold text-slate-900 text-xl leading-snug">
                  {feature.title}
                </h3>
                <p className="font-inter text-sm text-slate-600 leading-relaxed mt-2">
                  {feature.description}
                </p>

                {/* Semantic Search preview */}
                {feature.id === 'feat-1' && (
                  <div className="rounded-2xl bg-white/90 p-4 mt-6 space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-2 bg-white border-2 border-cyan-200 rounded-full px-3.5 py-2.5 text-slate-500">
                      <Search className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
                      <span className="font-inter text-xs truncate">"{landingRoadmapPreview.query}"</span>
                    </div>
                    <p className="font-inter text-xs font-semibold text-cyan-700 pl-2">
                      ✦ Found {landingRoadmapPreview.resultCount} relevant papers across your library.
                    </p>
                  </div>
                )}

                {/* Research Roadmaps preview */}
                {feature.id === 'feat-2' && (
                  <div className="rounded-2xl bg-white/90 p-4 mt-6 space-y-2.5 shadow-sm">
                    {landingRoadmapPreview.stages.map((stage) => (
                      <div key={stage.title} className="flex items-center gap-2 min-w-0">
                        {stage.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        {stage.status === 'in-progress' && <CircleDot className="w-4 h-4 text-fuchsia-500 flex-shrink-0" />}
                        {stage.status === 'pending' && <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                        <span className="font-inter text-xs text-slate-700 truncate">{stage.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comparison preview */}
                {feature.id === 'feat-3' && (
                  <div className="rounded-2xl bg-white/90 p-4 mt-6 grid grid-cols-2 gap-2 shadow-sm">
                    {['Dataset', 'Method', 'Accuracy', 'Params'].map((k, i) => (
                      <div key={k} className={`rounded-xl px-3 py-2 ${i % 2 ? 'bg-amber-100' : 'bg-orange-100'}`}>
                        <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-orange-700">{k}</p>
                        <div className="h-1.5 mt-1.5 rounded-full bg-orange-300/70" style={{ width: `${60 + i * 10}%` }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Lit Review Generation preview */}
                {feature.id === 'feat-4' && (
                  <div className="rounded-2xl bg-white/90 p-4 mt-6 space-y-2.5 shadow-sm">
                    <div className="space-y-1.5">
                      <div className="h-2 bg-pink-200 rounded-full w-full" />
                      <div className="h-2 bg-pink-200 rounded-full w-11/12" />
                      <div className="h-2 bg-rose-200 rounded-full w-4/6" />
                    </div>
                    <div className="flex gap-1.5 pt-1 flex-wrap">
                      {landingRoadmapPreview.litReviewCitations.map((c) => (
                        <span key={c} className="font-mono text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full px-2.5 py-1">
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
      <section id="rigor" className="px-4 md:px-8 select-none scroll-mt-24">
        <div className="relative max-w-[1240px] mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-violet-100 via-pink-50 to-orange-100 border border-white shadow-[0_30px_80px_-50px_rgba(124,58,237,0.6)]">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
        <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="relative px-6 md:px-14 py-16 md:py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: checklist */}
          <div className="space-y-8 text-left">
            <h2 className="font-hanken font-extrabold text-4xl md:text-5xl text-slate-900 tracking-[-0.03em] leading-[1.05]">
              Elevate your <span className="text-prism">academic rigor</span>
            </h2>
            <div className="space-y-4">
              {landingRigorPoints.map((point, i) => (
                <div key={point.id} className="flex items-start gap-4 bg-white/75 backdrop-blur rounded-3xl p-5 border border-white shadow-sm">
                  <span className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-hanken font-extrabold bg-gradient-to-br ${['from-violet-500 to-fuchsia-500', 'from-pink-500 to-rose-500', 'from-orange-500 to-amber-400'][i % 3]}`}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-hanken font-bold text-lg text-slate-900">
                      {point.title}
                    </h3>
                    <p className="font-inter text-sm text-slate-600 leading-relaxed mt-0.5">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: roadmap mockup card */}
          <div className="relative min-w-0">
            <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-violet-500 opacity-30 blur-2xl" />
            <div className="relative bg-white rounded-[2rem] shadow-[0_40px_80px_-30px_rgba(124,58,237,0.5)] overflow-hidden text-left">
              <div className="flex items-center gap-1.5 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-500">
                <span className="w-3 h-3 rounded-full bg-white/90" />
                <span className="w-3 h-3 rounded-full bg-white/60" />
                <span className="w-3 h-3 rounded-full bg-white/35" />
                <span className="ml-3 font-mono text-[10px] font-bold tracking-widest text-white/90 uppercase">anveshak · roadmap</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Map className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    <span className="font-hanken text-sm font-bold text-slate-900">{landingRigorRoadmap.title}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {landingRigorRoadmap.progress}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                </div>

                <div className="space-y-2.5">
                  {landingRigorRoadmap.stages.map((stage) => (
                    <div
                      key={stage.title}
                      className={`rounded-2xl p-3.5 flex items-start gap-3 ${
                        stage.status === 'active'
                          ? 'bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-pink-200'
                          : stage.status === 'completed'
                            ? 'bg-emerald-50/70 border border-emerald-100'
                            : 'border border-slate-100'
                      }`}
                    >
                      {stage.status === 'completed' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                      {stage.status === 'active' && <CircleDot className="w-4.5 h-4.5 text-pink-500 flex-shrink-0 mt-0.5" />}
                      {stage.status === 'pending' && <Circle className="w-4.5 h-4.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <span className="font-inter text-sm font-bold text-slate-800">{stage.title}</span>
                          {stage.badge && (
                            <span className="font-mono text-[9px] font-bold text-white bg-gradient-to-r from-violet-500 to-pink-500 px-2 py-0.5 rounded-full flex-shrink-0">
                              {stage.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-inter text-xs text-slate-500 mt-0.5">{stage.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 font-inter text-sm font-bold text-slate-800">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      {landingRigorRoadmap.synthesis.title}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      {landingRigorRoadmap.synthesis.citations}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-slate-600 italic leading-relaxed">
                    "{landingRigorRoadmap.synthesis.quote}"
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* ── CTA Band ────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-20 md:py-24 select-none">
        <div className="relative max-w-[1180px] mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-16 md:py-20 text-center text-white">
          <div className="pointer-events-none absolute -top-16 -left-10 w-64 h-64 rounded-full border-[28px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-white/10" />
          <h2 className="relative font-hanken font-extrabold text-4xl md:text-6xl tracking-[-0.03em] leading-[1.02]">
            Your next breakthrough<br className="hidden md:block" /> starts with one upload.
          </h2>
          <p className="relative font-inter text-white/85 text-base md:text-lg mt-5 max-w-xl mx-auto">
            Bring a PDF, ask anything, and watch your library come alive.
          </p>
          <Link
            to={loggedIn ? '/dashboard' : '/signup'}
            className="relative inline-flex items-center gap-2 mt-9 px-8 py-4 rounded-full bg-white text-slate-900 font-inter font-extrabold text-base shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            {loggedIn ? 'Open your workspace' : 'Create your free account'}
            <ArrowRight className="w-5 h-5 text-pink-500" />
          </Link>
        </div>
      </section>

      {/* ── Footer Section ──────────────────────────────── */}
      <footer className="py-8 px-6 md:px-12 select-none border-t border-violet-100">
        <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <img src={logo} alt="Anveshak" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
            </div>
            <span className="font-hanken font-extrabold text-sm text-slate-900">Anveshak</span>
            <span className="font-inter text-xs text-slate-500 ml-2">
              &copy; 2026 Anveshak AI Research. Built for academic rigor.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
