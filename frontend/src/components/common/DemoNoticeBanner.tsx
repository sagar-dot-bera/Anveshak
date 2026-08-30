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
    <div className="flex items-center gap-2.5 bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800">
      <Info className="w-4 h-4 flex-shrink-0" />
      <p className="font-inter text-xs sm:text-sm leading-snug flex-1 min-w-0">
        This is a portfolio demo hosted on free-tier infrastructure — AI-powered features
        (summaries, chat, roadmaps) may take up to a minute on first use while services spin up.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="flex-shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
