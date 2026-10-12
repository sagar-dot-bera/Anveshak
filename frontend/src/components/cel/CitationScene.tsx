import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  samplePaper,
  samplePageBlocks,
  sampleQuestion,
  sampleAnswer,
} from '@/data/sampleCase';

type Point = { x: number; y: number };

const WORD_STAGGER_MS = 38;

/**
 * One continuous inked stroke from a citation chip to the cited lines:
 * a curve across the frame that becomes a loop around the source text.
 */
function buildStrokePath(start: Point, target: DOMRect, origin: DOMRect): string {
  // A tight rounded box (a superellipse) hugs the sentence's lines without
  // reaching the lines above and below, the way a marker boxes a passage.
  const padX = 7;
  const padY = 5;
  const cx = target.left - origin.left + target.width / 2;
  const cy = target.top - origin.top + target.height / 2;
  const rx = target.width / 2 + padX;
  const ry = target.height / 2 + padY;
  const squareness = 0.18; // exponent 2/n for n≈11: nearly square corners, slightly rounded

  const onBox = (t: number, grow = 1) => {
    const c = Math.cos(t);
    const sn = Math.sin(t);
    return {
      x: cx + rx * grow * Math.sign(c) * Math.abs(c) ** squareness,
      y: cy + ry * grow * Math.sign(sn) * Math.abs(sn) ** squareness,
    };
  };

  // The stroke always arrives from the side nearer the chip, travelling down
  // the page's margin rather than across its printed lines.
  const fromLeft = start.x < cx;
  const enter = fromLeft ? Math.PI : 0;
  const entry = onBox(enter);
  const gutterX = fromLeft ? entry.x - 14 : entry.x + 14;
  const c1 = { x: gutterX, y: start.y };
  const c2 = { x: gutterX, y: entry.y };

  let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${entry.x.toFixed(1)} ${entry.y.toFixed(1)}`;

  // Go round slightly more than once, the way a hand closes a loop.
  const sweep = Math.PI * 2.08;
  const steps = 96;
  for (let i = 1; i <= steps; i++) {
    const t = enter + (fromLeft ? -1 : 1) * (sweep * i) / steps;
    const p = onBox(t, 1 + (i / steps) * 0.012);
    d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
}

type CitationSceneProps = {
  /** Content placed above the question in the answer column (e.g. the page headline). */
  lead?: ReactNode;
  /** A smaller scene for the auth pages: fewer lines of the page, no lead. */
  compact?: boolean;
};

export default function CitationScene({ lead, compact = false }: CitationSceneProps) {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const citeRefs = useRef(new Map<string, HTMLButtonElement>());
  const sourceRefs = useRef(new Map<string, HTMLSpanElement>());
  const pathRef = useRef<SVGPathElement>(null);

  const [activeCite, setActiveCite] = useState('subspaces');
  const [strokePath, setStrokePath] = useState('');
  const [strokeLength, setStrokeLength] = useState(0);
  const [drawCount, setDrawCount] = useState(0);

  const blocks = compact ? samplePageBlocks.slice(1, 4) : samplePageBlocks;

  let wordIndex = 0;
  const totalWords = sampleAnswer.reduce(
    (n, part) => n + (part.kind === 'text' ? part.text.split(' ').length : 1),
    0,
  );
  const firstDrawDelay = totalWords * WORD_STAGGER_MS + 250;

  const measure = useCallback(() => {
    const container = containerRef.current;
    const cite = citeRefs.current.get(activeCite);
    const source = sourceRefs.current.get(activeCite);
    if (!container || !cite || !source) return;

    const origin = container.getBoundingClientRect();
    const citeRect = cite.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const sourceIsBelow = sourceRect.top > citeRect.bottom;

    const start = sourceIsBelow
      ? { x: citeRect.left - origin.left + citeRect.width / 2, y: citeRect.bottom - origin.top + 4 }
      : { x: citeRect.right - origin.left + 6, y: citeRect.top - origin.top + citeRect.height / 2 };

    setStrokePath(buildStrokePath(start, sourceRect, origin));
  }, [activeCite]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    document.fonts?.ready.then(() => measure());
    return () => observer.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    if (pathRef.current) setStrokeLength(Math.ceil(pathRef.current.getTotalLength()));
  }, [strokePath]);

  const showSource = (citeId: string) => {
    if (citeId === activeCite) return;
    setActiveCite(citeId);
    setDrawCount((n) => n + 1);
  };

  const pageTextSize = compact ? 'text-[0.9rem]' : 'text-[0.95rem] sm:text-base';

  return (
    <div ref={containerRef} className="relative isolate">
      <div
        className={
          compact
            ? 'grid gap-10'
            : 'grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-rows-[auto_auto] lg:gap-x-16 lg:gap-y-12 xl:gap-x-24'
        }
      >
        {lead && <div className="min-w-0 lg:col-start-1 lg:row-start-1">{lead}</div>}

        {/* The question comes up as a subtitle; the answer is spoken in a dialogue panel. */}
        <div className={`min-w-0 ${compact ? '' : 'lg:col-start-1 lg:row-start-2'}`}>
          <p className={`fansub leading-snug ${compact ? 'text-[1.35rem]' : 'text-[1.5rem] sm:text-[1.8rem]'} mb-7 text-balance`}>
            <span className="sr-only">Question: </span>
            {sampleQuestion}
          </p>
          <div className={`cel-panel ${compact ? 'px-5 pt-6 pb-5' : 'px-5 sm:px-7 pt-7 pb-6'} max-w-[40rem]`}>
            <span className="nameplate">Anveshak</span>
            <p className={`text-cream ${compact ? 'text-base' : 'text-lg sm:text-[1.2rem]'} leading-relaxed`}>
              {sampleAnswer.map((part) => {
                if (part.kind === 'cite') {
                  const source = samplePageBlocks.find((b) => b.kind === 'cited' && b.citeId === part.citeId);
                  const quote = source && source.kind === 'cited' ? source.cited : '';
                  const delay = wordIndex++ * WORD_STAGGER_MS;
                  const active = activeCite === part.citeId;
                  return (
                    <button
                      key={part.citeId}
                      type="button"
                      ref={(el) => {
                        if (el) citeRefs.current.set(part.citeId, el);
                      }}
                      onMouseEnter={() => showSource(part.citeId)}
                      onFocus={() => showSource(part.citeId)}
                      onClick={() => showSource(part.citeId)}
                      aria-describedby={`${uid}-${part.citeId}`}
                      aria-label={`Source, page ${samplePaper.page}: ${quote}`}
                      aria-pressed={active}
                      className={`sub-word ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full border-2 font-code font-bold text-[0.78em] leading-none align-[0.1em] cursor-pointer transition-colors duration-200 min-h-[1.9em] ${
                        active
                          ? 'bg-butter border-butter text-night'
                          : 'bg-transparent border-butter text-butter hover:bg-butter/15'
                      }`}
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      {part.label}
                    </button>
                  );
                }
                return part.text.split(' ').map((word, i, words) => {
                  const delay = wordIndex++ * WORD_STAGGER_MS;
                  return (
                    <span key={`${word}-${delay}`} className="sub-word" style={{ animationDelay: `${delay}ms` }}>
                      {word}
                      {i < words.length - 1 ? ' ' : ''}
                    </span>
                  );
                });
              })}
            </p>
          </div>
          <p className="mt-5 inline-block rounded-[10px] bg-night px-3 py-1.5 text-sm text-cream-dim">
            Sample answer, written to show the format. Tap a <span className="font-code font-bold text-butter">p. 5</span> to follow it to the page.
          </p>
        </div>

        {/* The printed page, laid in beside it as a cel. */}
        <figure className={`relative -z-20 min-w-0 ${compact ? '' : 'lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-end'}`}>
          <div className={`cel-page rotate-[0.8deg] ${compact ? 'px-6 pt-7 pb-6' : 'px-7 sm:px-10 pt-9 pb-7'}`}>
            <div className={`font-journal ${pageTextSize} leading-[1.55] text-ink space-y-3 hyphens-auto`} lang="en">
              {blocks.map((block, i) => {
                switch (block.kind) {
                  case 'heading':
                    return (
                      <p key={i} className="font-semibold pt-1">
                        {block.text}
                      </p>
                    );
                  case 'equation':
                    return (
                      <p key={i} className="italic text-center py-1">
                        {block.text}
                      </p>
                    );
                  case 'cited':
                    return (
                      <p key={i}>
                        {block.before}
                        <span
                          id={`${uid}-${block.citeId}`}
                          className={`box-decoration-clone transition-colors duration-500 ${
                            activeCite === block.citeId ? 'bg-butter/70' : 'bg-transparent'
                          }`}
                          ref={(el) => {
                            if (el) sourceRefs.current.set(block.citeId, el);
                          }}
                        >
                          {block.cited}
                        </span>
                        {block.after}
                      </p>
                    );
                  default:
                    return <p key={i}>{block.text}</p>;
                }
              })}
            </div>
            <p className="mt-5 text-center text-sm text-ink-soft font-journal">{samplePaper.page}</p>
          </div>
          <figcaption className="mt-6 inline-block rounded-[10px] bg-night px-3 py-1.5 text-sm text-cream-dim">
            <cite className="not-italic font-bold text-cream">{samplePaper.title}</cite>
            <span className="block sm:inline sm:ml-2">
              arXiv:{samplePaper.arxivId}, page {samplePaper.page}. Quoted as printed.
            </span>
          </figcaption>
        </figure>
      </div>

      {/* The stroke spans both columns so it can cross the gutter: over the page, under the panel. */}
      <svg className="pointer-events-none absolute inset-0 -z-10 w-full h-full overflow-visible" aria-hidden="true">
        {strokePath && strokeLength > 0 && (
          // A night outline under the butter line, the way cel line art keeps a colour readable on white.
          <path
            key={`shade-${drawCount}`}
            d={strokePath}
            className="cite-stroke cite-stroke--draw"
            stroke="var(--color-night)"
            strokeWidth={compact ? 7 : 8.5}
            style={
              {
                '--stroke-length': strokeLength,
                '--stroke-duration': '1100ms',
                '--stroke-delay': drawCount === 0 ? `${firstDrawDelay}ms` : '0ms',
              } as React.CSSProperties
            }
          />
        )}
        {strokePath && (
          <path
            key={`${drawCount}-${strokeLength > 0}`}
            ref={pathRef}
            d={strokePath}
            className={strokeLength > 0 ? 'cite-stroke cite-stroke--draw' : 'cite-stroke'}
            stroke="var(--color-butter)"
            strokeWidth={compact ? 3.5 : 4.2}
            style={
              {
                '--stroke-length': strokeLength,
                '--stroke-duration': '1100ms',
                '--stroke-delay': drawCount === 0 ? `${firstDrawDelay}ms` : '0ms',
                opacity: strokeLength > 0 ? 1 : 0,
              } as React.CSSProperties
            }
          />
        )}
      </svg>
    </div>
  );
}
