import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  MessageSquare,
  BookOpen,
  Map,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { isAuthenticated } from '@/lib/authStore';
import {
  landingStats,
  landingTrustedBy,
  landingFeatures,
  landingProcess,
  landingTestimonial,
} from '@/data/landingMockData';

export default function LandingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleDemo = () => {
    toast.info('Starting product demo walk...', {
      description: 'Redirecting to workspace...',
    });
    setTimeout(() => navigate(loggedIn ? '/dashboard' : '/login'), 1000);
  };

  return (
    <div className="bg-[#fcfcff] min-h-screen text-slate-800 flex flex-col font-sans">
      
      {/* ── Public Navigation Bar ────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 shadow-[0_1px_4px_rgba(0,0,0,0.01)] select-none">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-deep-indigo flex items-center justify-center">
            <img src={logo} alt="Anveshak" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <div>
            <p className="font-hanken font-bold text-sm text-slate-900 leading-none">Anveshak</p>
            <p className="font-mono text-[8px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
              AI Research Assistant
            </p>
          </div>
        </div>

        {/* Center menu links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-inter font-medium text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#process" className="hover:text-slate-900 transition-colors">Process</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-xs transition-all shadow active:scale-[0.98]"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Go to Dashboard
            </Link>
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
      <section className="px-6 md:px-12 py-12 md:py-20 max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
        
        {/* Left text context */}
        <div className="space-y-6">
          {/* Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary select-none">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
              {landingStats.lastUpdated}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-hanken font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-[1.08] select-none">
            Your Second Brain for <br />
            <span className="bg-gradient-to-r from-primary to-vibrant-blue bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
            Accelerate your research cycle. Anveshak uses advanced AI to search, read, and synthesize scholarly papers with human-like precision.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/signup"
              className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-deep-indigo hover:bg-primary text-white font-inter font-bold text-sm transition-all shadow-md active:scale-[0.97]"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemo}
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-inter font-bold text-sm transition-all shadow-sm active:scale-[0.97]"
            >
              View Demo
            </button>
          </div>

          {/* Trust stats */}
          <div className="flex items-center gap-3.5 pt-4 select-none">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-700">A</div>
              <div className="w-7 h-7 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-teal-700">R</div>
              <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-amber-700">M</div>
            </div>
            <span className="font-inter text-xs text-slate-400">
              Used by <strong className="text-slate-600 font-semibold">{landingStats.activeResearchers}</strong> Researchers
            </span>
          </div>
        </div>

        {/* Right mockup view */}
        <div className="w-full flex justify-center lg:justify-end select-none">
          <div className="w-full max-w-[500px] bg-slate-100/80 border border-slate-200/50 rounded-2xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-4">
            
            {/* Mock Header tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[9px] text-slate-400 font-semibold">
                Nature_Climate_Study_2024.pdf
              </span>
            </div>

            {/* Split layout view */}
            <div className="grid grid-cols-[1fr_1.1fr] gap-3 h-[240px]">
              {/* Mock PDF left */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex flex-col gap-2.5 text-left font-serif">
                <div className="h-3.5 bg-slate-200 rounded w-5/6" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-11/12" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                
                {/* Highlight */}
                <div className="bg-indigo-50 border-l-2 border-primary rounded p-1.5 mt-2">
                  <span className="font-sans font-bold text-[7px] text-primary block uppercase tracking-wider mb-0.5">Selected</span>
                  <div className="h-1 bg-primary/20 rounded w-full mb-0.5" />
                  <div className="h-1 bg-primary/20 rounded w-4/6" />
                </div>
              </div>

              {/* Mock Chat right */}
              <div className="flex flex-col justify-between h-full bg-white border border-slate-200/60 rounded-xl p-3 text-left font-sans">
                
                {/* AI Bubbles */}
                <div className="space-y-2 overflow-hidden flex-1">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                    <span className="font-mono text-[7px] font-bold text-slate-400 block uppercase">Prompt</span>
                    <p className="text-[9px] text-slate-600 leading-tight">Summarize the main methodology used in this paper.</p>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100/30 rounded-lg p-2 space-y-1">
                    <span className="font-mono text-[7px] font-bold text-primary block uppercase">Anveshak AI</span>
                    <p className="text-[9.5px] text-slate-700 leading-tight">The authors utilized a multi-modal spatial analysis across 42 metropolitan zones...</p>
                  </div>
                </div>

                {/* Input box bottom */}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-300">Ask anything...</span>
                  <div className="w-4 h-4 rounded bg-deep-indigo flex items-center justify-center text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ── Trusted By Logo Bar ─────────────────────────── */}
      <section className="border-y border-slate-100 py-6 select-none bg-white">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
          <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            Trusted by Researchers From
          </span>
          <div className="flex items-center gap-10 md:gap-16 font-hanken font-bold text-base md:text-lg text-slate-400">
            {landingTrustedBy.map((logo) => (
              <span key={logo.name} className="hover:text-slate-600 transition-colors cursor-pointer">
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase Section ────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-16 md:py-24 max-w-[1200px] mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-none">
            Intelligence for every stage of research
          </h2>
          <p className="font-inter text-slate-500 text-sm max-w-lg mx-auto">
            From discovery to publication, Anveshak streamlines your workflow with specialized AI tools.
          </p>
        </div>

        {/* Feature Layout Block Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 text-left select-none">
          
          {/* Card 1: Semantic Search (Large) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[300px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                <Search className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-hanken font-bold text-slate-800 text-lg leading-snug">
                {landingFeatures[0].title}
              </h3>
              <p className="font-inter text-xs md:text-sm text-slate-500 leading-relaxed max-w-md">
                {landingFeatures[0].description}
              </p>
            </div>
            
            {/* Visual mock result box */}
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-4 mt-6 space-y-2.5">
              <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center text-slate-400 font-inter text-xs">
                <span>"The impact of micro-plastics on deep sea benthic ecosystems"</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-sans font-medium text-slate-600 bg-white border border-slate-100 rounded p-2">
                  <span>Smith et al. (2023) - Marine Biology Journal</span>
                  <span className="font-mono text-[8px] font-bold text-success-green bg-emerald-50 px-1.5 py-0.5 rounded">98% RELEVANT</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-sans font-medium text-slate-600 bg-white border border-slate-100 rounded p-2">
                  <span>Chen &amp; Wong (2024) - Oceanic Trends</span>
                  <span className="font-mono text-[8px] font-bold text-success-green bg-emerald-50 px-1.5 py-0.5 rounded">95% RELEVANT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Talk to Paper */}
          <div className="bg-deep-indigo rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[300px] text-white/90 shadow-[0_4px_30px_-5px_rgba(49,46,129,0.3)] hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-hanken font-bold text-white text-lg leading-snug">
                {landingFeatures[1].title}
              </h3>
              <p className="font-inter text-xs md:text-sm text-white/70 leading-relaxed">
                {landingFeatures[1].description}
              </p>
            </div>

            {/* Chat lines mock visual */}
            <div className="bg-white/10 rounded-xl p-4 mt-6 space-y-2">
              <div className="flex justify-end">
                <span className="text-[10px] bg-white/15 px-3 py-1.5 rounded-lg max-w-[85%] text-right">What is the research gap?</span>
              </div>
              <div className="flex justify-start">
                <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg max-w-[85%] text-left">Prior works lacked high-temperature measurements...</span>
              </div>
            </div>
          </div>

          {/* Card 3: Literature Reviews */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-hanken font-bold text-slate-800 text-lg leading-snug">
                {landingFeatures[2].title}
              </h3>
              <p className="font-inter text-xs md:text-sm text-slate-500 leading-relaxed">
                {landingFeatures[2].description}
              </p>
            </div>
            
            {/* Visual list mock */}
            <div className="flex gap-2 mt-6">
              <div className="h-6 bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-[10px] text-slate-400">Paper A</div>
              <div className="h-6 bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-[10px] text-slate-400">Paper B</div>
              <div className="h-6 bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-[10px] text-slate-400">Paper C</div>
            </div>
          </div>

          {/* Card 4: Research Roadmaps */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                <Map className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-hanken font-bold text-slate-800 text-lg leading-snug">
                {landingFeatures[3].title}
              </h3>
              <p className="font-inter text-xs md:text-sm text-slate-500 leading-relaxed">
                {landingFeatures[3].description}
              </p>
              <Link to="/signup" className="inline-flex items-center gap-1 font-inter text-xs font-semibold text-vibrant-blue hover:text-primary transition-colors pt-1">
                Explore Roadmaps
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Visual timeline dots mock */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-4 space-y-2 flex flex-col items-center">
              <div className="flex items-center gap-3 w-full max-w-[200px]">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">1</div>
                <div className="h-1 bg-slate-200 rounded flex-1" />
              </div>
              <div className="flex items-center gap-3 w-full max-w-[200px]">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[9px] font-bold">2</div>
                <div className="h-1 bg-slate-200 rounded flex-1" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Process Section ─────────────────────────────── */}
      <section id="process" className="bg-[#0b0f19] text-white py-16 md:py-24 select-none">
        <div className="px-6 md:px-12 max-w-[1200px] mx-auto w-full space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="font-hanken font-bold text-2xl md:text-3xl text-white tracking-tight leading-none">
              From Chaos to Clarity
            </h2>
            <p className="font-inter text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
              A simple 3-step process to transform your academic workflow.
            </p>
          </div>

          {/* Process flow row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {landingProcess.map((p) => (
              <div key={p.step} className="bg-white/5 border border-white/10 rounded-2xl p-6.5 space-y-3 hover:border-white/20 transition-colors">
                <span className="font-mono text-2xl font-bold text-primary block leading-none">
                  {p.step}
                </span>
                <h3 className="font-hanken font-bold text-sm md:text-base text-white/95 uppercase tracking-wide">
                  {p.title}
                </h3>
                <p className="font-inter text-xs md:text-sm text-slate-400 leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Testimonial Section ─────────────────────────── */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1000px] mx-auto w-full text-center space-y-6 select-none">
        
        <span className="font-serif text-5xl md:text-6xl text-primary font-bold block leading-none opacity-50 select-none">
          ”
        </span>
        
        <blockquote className="font-hanken font-bold text-lg md:text-2xl lg:text-3xl text-slate-900 tracking-tight leading-snug">
          "{landingTestimonial.quote}"
        </blockquote>

        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-700">
            JR
          </div>
          <div>
            <p className="font-hanken font-bold text-sm text-slate-900 leading-none">
              {landingTestimonial.author}
            </p>
            <p className="font-mono text-[9px] font-semibold tracking-wider text-slate-400 uppercase mt-1">
              {landingTestimonial.role}
            </p>
          </div>
        </div>

      </section>

      {/* ── Call To Action Card ─────────────────────────── */}
      <section id="pricing" className="px-6 md:px-12 py-6 select-none">
        <div className="max-w-[1000px] mx-auto bg-deep-indigo rounded-2xl p-10 md:p-14 text-center text-white/90 space-y-6 shadow-[0_12px_40px_rgba(49,46,129,0.35)] relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute left-0 top-0 w-32 h-32 bg-primary rounded-full blur-3xl pointer-events-none translate-x-[-20%] translate-y-[-20%] opacity-40" />
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-vibrant-blue rounded-full blur-3xl pointer-events-none translate-x-[20%] translate-y-[20%] opacity-40" />

          <h2 className="font-hanken font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none">
            Ready to Supercharge Your Research?
          </h2>
          <p className="font-inter text-xs md:text-sm text-indigo-200 max-w-md mx-auto leading-relaxed">
            Join 10,000+ researchers today and stop wasting time on manual scanning. Focus on what matters: the science.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-indigo-50 font-inter font-bold text-sm text-deep-indigo transition-all active:scale-[0.98] shadow-sm"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => toast.info('Booking sales demo request...')}
              className="px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 font-inter font-bold text-sm text-white transition-all active:scale-[0.98]"
            >
              Talk to Sales
            </button>
          </div>

          <p className="font-mono text-[9px] tracking-wider text-indigo-300">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Footer Section ──────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-6 md:px-12 mt-12 select-none text-left">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Logo & Description */}
          <div className="col-span-2 space-y-4 pr-0 md:pr-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-deep-indigo flex items-center justify-center">
                <img src={logo} alt="Anveshak" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="font-hanken font-bold text-sm text-slate-900">Anveshak</span>
            </div>
            <p className="font-inter text-[11px] text-slate-400 leading-relaxed">
              Advancing scientific discovery through intuitive, high-context AI assistance.
            </p>
          </div>

          {/* Link columns */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">Features</h4>
            <ul className="font-inter text-xs text-slate-500 space-y-2 list-none">
              <li><Link to="/signup" className="hover:text-slate-900 transition-colors">Semantic Search</Link></li>
              <li><Link to="/signup" className="hover:text-slate-900 transition-colors">Talk to Paper</Link></li>
              <li><Link to="/signup" className="hover:text-slate-900 transition-colors">Literature Reviews</Link></li>
              <li><Link to="/signup" className="hover:text-slate-900 transition-colors">Roadmaps</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">Company</h4>
            <ul className="font-inter text-xs text-slate-500 space-y-2 list-none">
              <li><button onClick={() => toast.info('About Us page')} className="hover:text-slate-900 transition-colors">About Us</button></li>
              <li><button onClick={() => toast.info('Pricing page')} className="hover:text-slate-900 transition-colors">Pricing</button></li>
              <li><button onClick={() => toast.info('Careers portal')} className="hover:text-slate-900 transition-colors">Careers</button></li>
              <li><button onClick={() => toast.info('Blog page')} className="hover:text-slate-900 transition-colors">Blog</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">Legal</h4>
            <ul className="font-inter text-xs text-slate-500 space-y-2 list-none">
              <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Security</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom stats bar */}
        <div className="max-w-[1200px] mx-auto border-t border-slate-100 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[10px] text-slate-400">
            &copy; 2026 Anveshak AI. Built for the academic community.
          </p>
          <div className="flex items-center gap-4 font-mono text-[9px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
              Status: All systems operational
            </span>
            <span>{landingStats.version}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
