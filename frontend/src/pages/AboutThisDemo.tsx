import { Link } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import { CelFooter, CelHeader } from '@/components/cel/CelChrome';
import { celButton } from '@/components/cel/celStyles';
import { Rooftops } from '@/components/cel/Horizon';

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What this is',
    body: [
      'Anveshak is a portfolio project: a working research assistant for academic papers, built and hosted by one developer. It is not a commercial service and has no support team.',
      'It runs on free-tier hosting. Services go to sleep when nobody is using them, so the first request after a quiet spell (logging in, a summary, a chat answer, a roadmap) can take up to a minute.',
    ],
  },
  {
    title: 'What gets stored when you make an account',
    body: [
      'Your first and last name, email address and a username. If you sign up with a password, only a hash of it is stored. If you use Google, the ID Google gives your account is stored instead.',
      'The PDFs you upload, the text extracted from them, and the vectors that make search work. Vectors for your uploads, searches and chats are computed in your browser; the text and vectors are then sent to the server.',
      'Your chats, summaries, comparisons, literature reviews, reading roadmaps, collections, and a record of each sign-in session on your account, including its IP address and browser.',
    ],
  },
  {
    title: 'Who else sees it',
    body: [
      'To write answers, summaries and reviews, the relevant passages of your papers and your questions are sent to Google’s Gemini API.',
      'Uploaded files are kept in Supabase Storage; everything else lives in the project’s PostgreSQL database.',
    ],
  },
  {
    title: 'The sample case',
    body: [
      'The sample case is one shared, read-only account with a library of open-access papers. You can search, question and compare in it, but not upload, delete or change settings.',
      'Because it is shared, chats and roadmaps started there can be seen by the next visitor. Keep anything personal out of it.',
    ],
  },
  {
    title: 'Removing your data',
    body: [
      'You can delete papers you uploaded from My Papers. There is no self-serve account deletion yet, and no formal retention schedule, so treat this as a demo and upload only papers you are comfortable storing here.',
    ],
  },
];

const slug = (title: string) => title.toLowerCase().replace(/[^a-z]+/g, '-');

export default function AboutThisDemo() {
  usePageMeta(
    'About this demo · Anveshak',
    'What Anveshak is, how this demo is hosted, and what happens to the data you give it.',
  );

  return (
    <div className="cel-world">
      <CelHeader />
      <main className="mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12 pt-10 pb-24">
        <h1 className="title-card text-[2.6rem] sm:text-6xl leading-[1.04] max-w-[16ch] text-balance">About this demo.</h1>
        <p className="mt-6 text-xl text-cream-dim leading-relaxed max-w-[38rem]">
          The plain version: what this is, how it is hosted, and what happens to anything you give it.
        </p>

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,16rem)_minmax(0,42rem)] lg:gap-20">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-10 space-y-1 border-l-2 border-magenta pl-5">
              {sections.map((section) => (
                <li key={section.title}>
                  <a
                    href={`#about-${slug(section.title)}`}
                    className="inline-flex min-h-10 items-center text-cream-dim hover:text-cream"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14">
            {sections.map((section) => (
              <section key={section.title} aria-labelledby={`about-${slug(section.title)}`}>
                <h2 id={`about-${slug(section.title)}`} className="scroll-mt-8 title-card text-[1.75rem] leading-tight">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[1.06rem] leading-[1.7] text-cream max-w-[65ch]">
                  {section.body.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/signup" className={celButton.primary}>
                Create an account
              </Link>
              <Link to="/" className={celButton.secondary}>
                Back to the home page
              </Link>
            </div>
          </div>
        </div>
      </main>
      <div className="h-24 sky-bands--short relative" aria-hidden="true">
        <Rooftops className="absolute inset-x-0 bottom-0" height="h-20" />
      </div>
      <CelFooter />
    </div>
  );
}
