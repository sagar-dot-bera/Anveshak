// The horizon the public pages stand on: a low suburban roofline, the sun
// going down behind it, and telephone wires strung across the sky.
// All of it is flat night-violet silhouette, the way a background cel is painted.

type Building = { x: number; w: number; h: number; roof?: 'gable' | 'tank' | 'antenna' | 'step' };

// A 1440-wide strip of rooftops, left to right. Heights are in px above the ground line.
const buildings: Building[] = [
  { x: 0, w: 70, h: 66, roof: 'gable' },
  { x: 64, w: 54, h: 52 },
  { x: 112, w: 92, h: 98, roof: 'antenna' },
  { x: 198, w: 64, h: 60, roof: 'gable' },
  { x: 256, w: 44, h: 74 },
  { x: 294, w: 120, h: 86, roof: 'tank' },
  { x: 408, w: 58, h: 56, roof: 'gable' },
  { x: 460, w: 72, h: 64, roof: 'step' },
  { x: 526, w: 50, h: 50, roof: 'gable' },
  { x: 570, w: 130, h: 112, roof: 'antenna' },
  { x: 694, w: 62, h: 62, roof: 'gable' },
  { x: 750, w: 46, h: 54 },
  { x: 790, w: 84, h: 78, roof: 'tank' },
  { x: 868, w: 60, h: 58, roof: 'gable' },
  { x: 922, w: 110, h: 94, roof: 'step' },
  { x: 1026, w: 56, h: 60, roof: 'gable' },
  { x: 1076, w: 70, h: 70 },
  { x: 1140, w: 120, h: 104, roof: 'antenna' },
  { x: 1254, w: 64, h: 62, roof: 'gable' },
  { x: 1312, w: 50, h: 76 },
  { x: 1356, w: 84, h: 68, roof: 'gable' },
];

const GROUND = 144;

function buildingPath({ x, w, h, roof }: Building): string {
  const top = GROUND - h;
  const body = `M${x} ${GROUND}V${top}H${x + w}V${GROUND}Z`;
  switch (roof) {
    case 'gable':
      return `${body}M${x - 4} ${top + 2}L${x + w / 2} ${top - 18}L${x + w + 4} ${top + 2}Z`;
    case 'tank': {
      const tx = x + w * 0.62;
      return `${body}M${tx} ${top}V${top - 14}H${tx + 6}V${top}ZM${tx + 18} ${top}V${top - 14}H${tx + 24}V${top}ZM${tx - 4} ${top - 14}H${tx + 28}V${top - 34}Q${tx + 12} ${top - 42} ${tx - 4} ${top - 34}Z`;
    }
    case 'antenna': {
      const ax = x + w * 0.3;
      return `${body}M${ax} ${top}V${top - 46}H${ax + 3}V${top}ZM${ax - 12} ${top - 30}H${ax + 15}V${top - 27}H${ax - 12}ZM${ax - 8} ${top - 40}H${ax + 11}V${top - 37}H${ax - 8}Z`;
    }
    case 'step':
      return `${body}M${x + w * 0.2} ${top}V${top - 14}H${x + w * 0.75}V${top}Z`;
    default:
      return body;
  }
}

const roofline = buildings.map(buildingPath).join('');

export function Rooftops({ className = '', height = 'h-[9rem]' }: { className?: string; height?: string }) {
  return (
    <svg
      className={`block w-full ${height} text-night ${className}`}
      viewBox={`0 0 1440 ${GROUND}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <path d={roofline} fill="currentColor" />
      {/* Lit windows: a few, scattered, the way somebody is always still up. */}
      <g fill="var(--color-butter)">
        {[
          [140, 70], [166, 90], [330, 88], [356, 88], [600, 54], [626, 54], [652, 80], [612, 106],
          [948, 76], [982, 98], [1172, 64], [1198, 64], [1224, 92], [1330, 94], [820, 100],
        ].map(([wx, wy]) => (
          <rect key={`${wx}-${wy}`} x={wx} y={wy} width="9" height="11" rx="1" />
        ))}
      </g>
    </svg>
  );
}

/** Two telephone poles and their wires across the sky. Purely scenery; hidden on small screens. */
export function PowerLines({ className = '' }: { className?: string }) {
  const stroke = { vectorEffect: 'non-scaling-stroke' as const };
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g stroke="#0d0619" fill="none" strokeLinecap="round">
        {/* Poles */}
        <line x1="2.6" y1="100" x2="2.6" y2="16" strokeWidth="9" style={stroke} />
        <line x1="97" y1="100" x2="97" y2="4" strokeWidth="9" style={stroke} />
        {/* Crossarms */}
        <line x1="0.4" y1="19" x2="4.8" y2="19" strokeWidth="5" style={stroke} />
        <line x1="0.9" y1="22.5" x2="4.3" y2="22.5" strokeWidth="5" style={stroke} />
        <line x1="94.4" y1="7" x2="99.6" y2="7" strokeWidth="5" style={stroke} />
        <line x1="94.9" y1="10.5" x2="99.1" y2="10.5" strokeWidth="5" style={stroke} />
        {/* Wires, sagging across the top of the sky above the page and running off both edges */}
        <path d="M0.4 19 Q50 30 94.4 7" strokeWidth="1.8" style={stroke} />
        <path d="M4.8 19 Q52 27 99.6 7" strokeWidth="1.8" style={stroke} />
        <path d="M0.9 22.5 Q48 35 94.9 10.5" strokeWidth="1.5" style={stroke} />
        <path d="M4.3 22.5 Q53 32 99.1 10.5" strokeWidth="1.5" style={stroke} />
        <path d="M99.6 7 Q100.2 7.4 101 7.6" strokeWidth="1.8" style={stroke} />
        <path d="M0.4 19 Q0 19.3 -1 19.6" strokeWidth="1.8" style={stroke} />
      </g>
    </svg>
  );
}

/** The low sun: flat discs of colour, no blur, sinking once on load. */
export function Sun({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`sun-set rounded-full ${className}`}
      style={{
        background:
          'radial-gradient(circle, #fff1b8 0 40%, var(--color-butter) 40% 56%, rgb(255 173 79 / 0.55) 56% 72%, rgb(255 138 61 / 0.28) 72% 100%)',
      }}
    />
  );
}
