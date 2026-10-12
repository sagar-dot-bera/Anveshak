import { useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'demoNoticeBannerDismissed';

export default function DemoNoticeBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  );

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-white">
      <Info className="w-4 h-4 flex-shrink-0" />
      <p className="font-inter font-medium text-xs sm:text-sm leading-snug flex-1 min-w-0">
        This is a portfolio demo hosted on free-tier infrastructure — AI-powered features
        (summaries, chat, roadmaps) may take up to a minute on first use while services spin up.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
