import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { isAuthenticated } from '@/lib/authStore';

export function CelLogo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 min-h-11 text-cream no-underline" aria-label="Anveshak home">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-butter border-2 border-night shadow-[2px_3px_0_var(--color-teal)]">
        <img src={logo} alt="" className={`${size === 'lg' ? 'w-5 h-5' : 'w-[1.1rem] h-[1.1rem]'} brightness-0`} />
      </span>
      <span className={`font-display ${size === 'lg' ? 'text-2xl' : 'text-xl'} tracking-[0.01em]`}>Anveshak</span>
    </Link>
  );
}

type HeaderLink = { href: string; label: string };

const navLink = 'inline-flex items-center min-h-11 px-3 font-semibold text-cream-dim hover:text-butter transition-colors';
const outlineLink =
  'items-center whitespace-nowrap min-h-11 px-4 rounded-full border-2 border-cream/80 text-cream font-bold hover:bg-cream hover:text-night transition-colors';

export function CelHeader({ links = [], overlay = false }: { links?: HeaderLink[]; overlay?: boolean }) {
  const loggedIn = isAuthenticated();
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-20' : 'relative z-10'}>
      <div className="mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
        <CelLogo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden md:flex items-center gap-1 mr-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={navLink}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/about-this-demo" className={navLink}>
                About this demo
              </Link>
            </li>
          </ul>
          {loggedIn ? (
            <Link to="/dashboard" className={`inline-flex ${outlineLink}`}>
              Open workspace
            </Link>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center whitespace-nowrap min-h-11 px-3 font-bold text-cream hover:text-butter transition-colors">
                Log in
              </Link>
              <Link to="/signup" className={`hidden sm:inline-flex ${outlineLink}`}>
                Create an account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function CelFooter() {
  return (
    <footer className="bg-night border-t-2 border-dusk-raised">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12 py-10 flex flex-col sm:flex-row gap-6 sm:items-center justify-between text-cream-dim">
        <CelLogo />
        <ul className="flex flex-wrap gap-x-6 gap-y-1 font-semibold">
          <li><Link to="/login" className="inline-flex min-h-11 items-center hover:text-butter">Log in</Link></li>
          <li><Link to="/signup" className="inline-flex min-h-11 items-center hover:text-butter">Create an account</Link></li>
          <li><Link to="/about-this-demo" className="inline-flex min-h-11 items-center hover:text-butter">About this demo</Link></li>
        </ul>
      </div>
    </footer>
  );
}
