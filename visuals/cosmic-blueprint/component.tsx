import React from 'react';
import { CosmicBlueprintSchema, type CosmicBlueprintData } from './schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sampleData from './sample-data.json';

interface CosmicBlueprintProps {
  schema: typeof CosmicBlueprintSchema | null;
  data?: CosmicBlueprintData | null;
}

declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<CosmicBlueprintProps>) => void;
  }
}

/* ── Constants ── */
const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△',
  square: '□', sextile: '⚹', quincunx: '☦',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#4f46e5', opposition: '#dc2626', trine: '#16a34a',
  square: '#ea580c', sextile: '#0891b2', quincunx: '#9333ea',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#dc2626', Earth: '#78716c', Air: '#6366f1', Water: '#0891b2',
};

const HOUSE_TITLES = [
  'Identity', 'Values', 'Communication', 'Home', 'Creativity',
  'Health', 'Partnerships', 'Transformation', 'Philosophy',
  'Career', 'Community', 'Subconscious',
];

/* ── Section Title ── */
const SectionTitle: React.FC<{ number: number; title: string; subtitle?: string }> = ({ number, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-[11px] tracking-[0.2em] text-stone-300">{String(number).padStart(2, '0')}</span>
      <div className="h-px flex-1 bg-stone-200" />
    </div>
    <h2 className="mt-2 text-base font-semibold tracking-tight text-stone-900">{title}</h2>
    {subtitle && <p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>}
  </div>
);

/* ── Thin Bar ── */
const ThinBar: React.FC<{ value: number; label?: string; color?: string }> = ({ value, label, color = 'bg-indigo-700' }) => (
  <div>
    {label && (
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] text-stone-600">{label}</span>
        <span className="font-mono text-xs text-stone-400">{value}%</span>
      </div>
    )}
    <div className="h-1.5 bg-stone-100 rounded-full">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} />
    </div>
  </div>
);

/* ── Cover Mini Wheel ── */
const CoverWheel: React.FC = React.memo(() => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 120;
  const innerR = 95;
  const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[280px]" role="img" aria-label="Zodiac wheel preview">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#e7e5e4" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#e7e5e4" strokeWidth={0.5} />

      {/* Sign segments & symbols */}
      {signs.map((sign, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const labelR = (outerR + innerR) / 2;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const lineAngle1 = ((i * 30) - 90) * (Math.PI / 180);
        const lineAngle2 = (((i + 1) * 30) - 90) * (Math.PI / 180);
        return (
          <g key={sign}>
            <line
              x1={cx + innerR * Math.cos(lineAngle1)} y1={cy + innerR * Math.sin(lineAngle1)}
              x2={cx + outerR * Math.cos(lineAngle1)} y2={cy + outerR * Math.sin(lineAngle1)}
              stroke="#d6d3d1" strokeWidth={0.5}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#78716c" style={{ fontSize: 13 }}>
              {SIGN_SYMBOLS[sign]}
            </text>
          </g>
        );
      })}

      {/* Center decoration */}
      <circle cx={cx} cy={cy} r={40} fill="none" stroke="#e7e5e4" strokeWidth={0.5} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#1c1917" style={{ fontSize: 16, fontWeight: 700 }}>☉</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#78716c" style={{ fontSize: 8, letterSpacing: '0.1em' }}>CAP</text>

      {/* Sample planet positions on the wheel */}
      {[
        { symbol: '☽', deg: 96, r: innerR - 12 },
        { symbol: '☿', deg: 327, r: innerR - 12 },
        { symbol: '♀', deg: 261, r: innerR - 12 },
        { symbol: '♂', deg: 15, r: innerR - 12 },
        { symbol: '♃', deg: 48, r: innerR - 12 },
        { symbol: '♄', deg: 52, r: innerR - 12 },
      ].map((p, i) => {
        const a = (p.deg - 90) * (Math.PI / 180);
        return (
          <text key={i} x={cx + p.r * Math.cos(a)} y={cy + p.r * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="#4f46e5" style={{ fontSize: 10 }}>
            {p.symbol}
          </text>
        );
      })}
    </svg>
  );
});
CoverWheel.displayName = 'CoverWheel';

/* ── Full Zodiac Wheel ── */
const ZodiacWheel: React.FC<{
  wheel: CosmicBlueprintData['zodiacWheel'];
  planets: CosmicBlueprintData['planetPositions']['content'];
  aspects: CosmicBlueprintData['aspects']['content'];
}> = React.memo(({ wheel, planets, aspects }) => {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 220;
  const signRingOuter = 200;
  const signRingInner = 170;
  const houseRingOuter = 170;
  const houseRingInner = 145;
  const planetRing = 130;
  const centerR = 60;

  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  const degToRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[500px]" role="img" aria-label="Natal chart zodiac wheel">
      {/* Sign ring background segments */}
      {signs.map((sign, i) => {
        const startAngle = i * 30;
        const endAngle = (i + 1) * 30;
        const midAngle = (startAngle + endAngle) / 2;
        const r1 = signRingOuter;
        const r2 = signRingInner;
        const a1 = degToRad(startAngle);
        const a2 = degToRad(endAngle);
        const midA = degToRad(midAngle);

        const fill = i % 2 === 0 ? 'rgba(244,244,245,0.5)' : 'rgba(228,228,231,0.5)';

        const x1o = cx + r1 * Math.cos(a1);
        const y1o = cy + r1 * Math.sin(a1);
        const x2o = cx + r1 * Math.cos(a2);
        const y2o = cy + r1 * Math.sin(a2);
        const x1i = cx + r2 * Math.cos(a2);
        const y1i = cy + r2 * Math.sin(a2);
        const x2i = cx + r2 * Math.cos(a1);
        const y2i = cy + r2 * Math.sin(a1);

        const labelR = (r1 + r2) / 2;
        const lx = cx + labelR * Math.cos(midA);
        const ly = cy + labelR * Math.sin(midA);

        return (
          <g key={sign}>
            <path
              d={`M ${x1o} ${y1o} A ${r1} ${r1} 0 0 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r2} ${r2} 0 0 0 ${x2i} ${y2i} Z`}
              fill={fill} stroke="#d6d3d1" strokeWidth={0.3}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#57534e" style={{ fontSize: 12 }}>
              {SIGN_SYMBOLS[sign]}
            </text>
          </g>
        );
      })}

      {/* House cusp lines */}
      {wheel.houses.map((house, i) => {
        const a = degToRad(house.startDegree);
        return (
          <line key={`house-${i}`}
            x1={cx + houseRingInner * Math.cos(a)} y1={cy + houseRingInner * Math.sin(a)}
            x2={cx + centerR * Math.cos(a)} y2={cy + centerR * Math.sin(a)}
            stroke="#a8a29e" strokeWidth={0.5} strokeDasharray={i === 0 ? 'none' : '2,2'}
          />
        );
      })}

      {/* House ring borders */}
      <circle cx={cx} cy={cy} r={houseRingOuter} fill="none" stroke="#d6d3d1" strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={houseRingInner} fill="none" stroke="#d6d3d1" strokeWidth={0.5} />

      {/* House numbers */}
      {wheel.houses.map((house, i) => {
        const midDeg = house.startDegree + 15;
        const a = degToRad(midDeg);
        const labelR = (houseRingOuter + houseRingInner) / 2;
        return (
          <text key={`hn-${i}`}
            x={cx + labelR * Math.cos(a)} y={cy + labelR * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fill="#a8a29e" style={{ fontSize: 8, fontWeight: 600 }}
          >
            {i + 1}
          </text>
        );
      })}

      {/* Aspect lines */}
      {aspects.map((aspect, i) => {
        const p1 = planets.find(p => p.planet === aspect.planet1);
        const p2 = planets.find(p => p.planet === aspect.planet2);
        if (!p1 || !p2) return null;
        const a1 = degToRad(p1.degree);
        const a2 = degToRad(p2.degree);
        return (
          <line key={`aspect-${i}`}
            x1={cx + planetRing * Math.cos(a1)} y1={cy + planetRing * Math.sin(a1)}
            x2={cx + planetRing * Math.cos(a2)} y2={cy + planetRing * Math.sin(a2)}
            stroke={ASPECT_COLORS[aspect.type] || '#d6d3d1'}
            strokeWidth={0.7} opacity={0.5}
          />
        );
      })}

      {/* Planet markers */}
      {planets.map((p) => {
        const a = degToRad(p.degree);
        const px = cx + planetRing * Math.cos(a);
        const py = cy + planetRing * Math.sin(a);
        return (
          <g key={p.planet}>
            <circle cx={px} cy={py} r={8} fill="white" stroke="#4f46e5" strokeWidth={0.8} />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fill="#1c1917" style={{ fontSize: 9 }}>
              {p.symbol}
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={centerR} fill="white" stroke="#e7e5e4" strokeWidth={1} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#78716c" style={{ fontSize: 8, letterSpacing: '0.15em' }}>ASCENDANT</text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#1c1917" style={{ fontSize: 13, fontWeight: 700 }}>{SIGN_SYMBOLS[wheel.ascendant]} {wheel.ascendant}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#a8a29e" style={{ fontSize: 7 }}>MC: {SIGN_SYMBOLS[wheel.midheaven]} {wheel.midheaven}</text>
    </svg>
  );
});
ZodiacWheel.displayName = 'ZodiacWheel';

/* ── Element Donut Chart ── */
const ElementDonut: React.FC<{ elements: CosmicBlueprintData['elements']['content'] }> = React.memo(({ elements }) => {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 55;
  const stroke = 16;
  const circumference = 2 * Math.PI * r;

  let cumulativeOffset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-[140px]" role="img" aria-label="Element distribution donut">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f4" strokeWidth={stroke} />
      {elements.map((el) => {
        const dash = (el.percentage / 100) * circumference;
        const gap = circumference - dash;
        const offset = cumulativeOffset;
        cumulativeOffset += dash;
        return (
          <circle key={el.element}
            cx={cx} cy={cy} r={r} fill="none"
            stroke={ELEMENT_COLORS[el.element]}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#78716c" style={{ fontSize: 7, letterSpacing: '0.15em' }}>ELEMENTS</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#1c1917" style={{ fontSize: 11, fontWeight: 600 }}>
        {elements.reduce((a, e) => a > e.percentage ? a : e.percentage, 0)}%
      </text>
    </svg>
  );
});
ElementDonut.displayName = 'ElementDonut';

/* ── Aspect Network Diagram ── */
const AspectNetwork: React.FC<{ aspects: CosmicBlueprintData['aspects']['content'] }> = React.memo(({ aspects }) => {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;

  const uniquePlanets = Array.from(new Set(aspects.flatMap(a => [a.planet1, a.planet2])));
  const planetPositions = new Map(uniquePlanets.map((name, i) => {
    const angle = (i * 360 / uniquePlanets.length - 90) * (Math.PI / 180);
    return [name, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }];
  }));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]" role="img" aria-label="Aspect network diagram">
      {/* Connection lines */}
      {aspects.map((a, i) => {
        const p1 = planetPositions.get(a.planet1);
        const p2 = planetPositions.get(a.planet2);
        if (!p1 || !p2) return null;
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={ASPECT_COLORS[a.type] || '#d6d3d1'} strokeWidth={1} opacity={0.4} />
            <text
              x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2}
              textAnchor="middle" dominantBaseline="central"
              fill={ASPECT_COLORS[a.type] || '#78716c'}
              style={{ fontSize: 10 }}
            >
              {ASPECT_SYMBOLS[a.type]}
            </text>
          </g>
        );
      })}

      {/* Planet nodes */}
      {uniquePlanets.map((name) => {
        const pos = planetPositions.get(name)!;
        return (
          <g key={name}>
            <circle cx={pos.x} cy={pos.y} r={16} fill="white" stroke="#4f46e5" strokeWidth={1} />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill="#1c1917" style={{ fontSize: 9, fontWeight: 600 }}>
              {name.slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
AspectNetwork.displayName = 'AspectNetwork';

/* ── Helper ── */
const ordinal = (n: number) => n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';

/* ── Main Component ── */
const CosmicBlueprint: React.FC<CosmicBlueprintProps> = ({ data }) => {
  let validatedData: CosmicBlueprintData;
  try {
    validatedData = data
      ? CosmicBlueprintSchema.parse(data)
      : CosmicBlueprintSchema.parse(sampleData);
  } catch (error) {
    console.error('Data validation failed:', error);
    validatedData = CosmicBlueprintSchema.parse(sampleData);
  }

  const d = validatedData;
  const house = d.planetPositions.houseTitle ?? d.houseAnalysis.houseTitle ?? 'house';

  return (
    <main className="mx-auto max-w-3xl p-6 font-[system-ui,sans-serif] print:max-w-none print:p-0">

      {/* ── 1. Cover / Header ── */}
      <header className="mb-12 border-b border-stone-200 pb-10">
        <CoverWheel />
        <div className="mt-6 text-center">
          <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-stone-400">{d.birthInfo.coverTitle ?? 'Cosmic Blueprint'}</p>
          <h1 className="font-[Georgia,serif] text-3xl text-stone-900">{d.subjectName}</h1>
          <p className="mt-2 text-sm text-stone-400">
            {d.birthInfo.bornTitle ?? 'Born:'} {d.birthInfo.date}
          </p>
          <p className="text-sm text-stone-400">
            {d.birthInfo.time} &middot; {d.birthInfo.location}
          </p>
          <span className="mt-4 inline-block border border-stone-200 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-stone-300">{d.birthInfo.generatedByTitle ?? 'Generated by VizuLLM'}</span>
        </div>
      </header>

      {/* ── 2. Executive Summary ── */}
      <section className="mb-10" aria-label="Executive Summary">
        <SectionTitle number={2} title={d.executiveSummary.title ?? 'Executive Summary'} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-sm leading-relaxed text-stone-500">{d.executiveSummary.summary}</p>
            <p className="mt-3 text-xs text-indigo-600">
              {d.executiveSummary.dominantEnergyTitle ?? 'Dominant Energy:'} <span className="font-medium">{d.executiveSummary.dominantEnergy}</span>
            </p>
          </div>
          <div className="space-y-3">
            {d.elements.content.map((el) => (
              <div key={el.element} className="flex items-center gap-3">
                <span className="w-12 text-[11px] text-stone-500">{el.element}</span>
                <div className="h-1.5 flex-1 rounded-full bg-stone-100">
                  <div className="h-full rounded-full" style={{ width: `${el.percentage}%`, backgroundColor: ELEMENT_COLORS[el.element] }} />
                </div>
                <span className="font-mono text-[11px] text-stone-400">{el.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Planet Positions ── */}
      <section className="mb-10" aria-label="Planet Positions">
        <SectionTitle number={3} title={d.planetPositions.title ?? 'Planet Positions'} subtitle={d.planetPositions.subtitle ?? 'Natal placements at time of birth'} />
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {d.planetPositions.content.map((p) => (
            <div key={p.planet} className="flex items-center gap-3 bg-white p-4">
              <span className="text-xl leading-none text-indigo-600">{p.symbol}</span>
              <div>
                <div className="text-[13px] font-medium text-stone-900">{p.planet}</div>
                <div className="text-[11px] text-stone-400">
                  {SIGN_SYMBOLS[p.sign]} {p.sign} &middot; {p.house}{ordinal(p.house)} {house}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Zodiac Wheel ── */}
      <section className="mb-10" aria-label="Zodiac Wheel">
        <SectionTitle number={4} title={d.zodiacWheel.title ?? 'Zodiac Wheel'} subtitle={d.zodiacWheel.subtitle ?? 'Natal chart with houses, planets, and aspect lines'} />
        <div className="border border-stone-200 p-4">
          <ZodiacWheel wheel={d.zodiacWheel} planets={d.planetPositions.content} aspects={d.aspects.content} />
        </div>
      </section>

      {/* ── 5. Element Distribution ── */}
      <section className="mb-10" aria-label="Element Distribution">
        <SectionTitle number={5} title={d.elements.title ?? 'Element Distribution'} subtitle={d.elements.subtitle ?? 'Dominant elemental energies in your chart'} />
        <div className="grid grid-cols-1 gap-6 border border-stone-200 p-6 sm:grid-cols-2">
          <div className="flex items-center justify-center">
            <ElementDonut elements={d.elements.content} />
          </div>
          <div className="space-y-4">
            {d.elements.content.map((el) => (
              <div key={el.element}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-stone-600">
                    <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[el.element] }} />
                    {el.element}
                  </span>
                  <span className="font-mono text-xs text-stone-400">{el.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100">
                  <div className="h-full rounded-full" style={{ width: `${el.percentage}%`, backgroundColor: ELEMENT_COLORS[el.element] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Modalities ── */}
      <section className="mb-10" aria-label="Modalities">
        <SectionTitle number={6} title={d.modalities.title ?? 'Modalities'} subtitle={d.modalities.subtitle ?? 'Cardinal, Fixed, Mutable — your action dynamic'} />
        <div className="space-y-3 border border-stone-200 p-6">
          {d.modalities.content.map((m) => (
            <ThinBar key={m.modality} value={m.percentage} label={m.modality} color="bg-stone-700" />
          ))}
        </div>
      </section>

      {/* ── 7. Planetary Strengths ── */}
      <section className="mb-10" aria-label="Planetary Strengths">
        <SectionTitle number={7} title={d.planetaryStrengths.title ?? 'Planetary Strengths'} subtitle={d.planetaryStrengths.subtitle ?? 'Most dominant planetary influences'} />
        <div className="space-y-3 border border-stone-200 p-6">
          {d.planetaryStrengths.content.map((p) => (
            <div key={p.planet}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[13px] text-stone-600">{p.planet}</span>
                <span className="font-mono text-xs text-stone-400">{p.score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${p.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Major Aspects ── */}
      <section className="mb-10" aria-label="Major Aspects">
        <SectionTitle number={8} title={d.aspects.title ?? 'Major Aspects'} subtitle={d.aspects.subtitle ?? 'Key planetary relationships in your chart'} />
        <AspectNetwork aspects={d.aspects.content} />
        <div className="mt-6 space-y-4 border border-stone-200 p-6">
          {d.aspects.content.map((a, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-sm" style={{ color: ASPECT_COLORS[a.type] }}>
                {ASPECT_SYMBOLS[a.type]}
              </span>
              <div>
                <div className="text-[13px] font-medium text-stone-900">
                  {a.planet1} {a.type} {a.planet2}
                </div>
                {a.description && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-400">{a.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. House Analysis ── */}
      <section className="mb-10" aria-label="House Analysis">
        <SectionTitle number={9} title={d.houseAnalysis.title ?? 'House Analysis'} subtitle={d.houseAnalysis.subtitle ?? 'Life areas shaped by your natal placements'} />
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {d.houseAnalysis.content.map((h) => (
            <div key={h.house} className="bg-white p-5">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-mono text-[10px] text-stone-300">{h.house}{ordinal(h.house)} {d.houseAnalysis.houseTitle ?? 'house'}</span>
                <span className="text-[11px] text-indigo-500">{SIGN_SYMBOLS[h.sign]} {h.sign}</span>
              </div>
              <h3 className="text-[13px] font-semibold text-stone-900">{h.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-400">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Personality Themes ── */}
      <section className="mb-10" aria-label="Personality Themes">
        <SectionTitle number={10} title={d.personalityThemes.title ?? 'Personality Themes'} subtitle={d.personalityThemes.subtitle ?? 'Your dominant archetypal patterns'} />
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {d.personalityThemes.content.map((theme) => (
            <div key={theme.title} className="bg-white p-5">
              <h3 className="font-[Georgia,serif] text-[14px] font-semibold text-stone-900">{theme.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">{theme.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 11. Relationship Style ── */}
      <section className="mb-10" aria-label="Relationship Style">
        <SectionTitle number={11} title={d.relationshipStyle.title ?? 'Relationship Style'} subtitle={d.relationshipStyle.subtitle ?? 'How you connect, communicate, and love'} />
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-2">
          {d.relationshipStyle.content.map((r) => (
            <div key={r.title} className="bg-white p-5">
              <div className="mb-2 text-xl leading-none">{r.icon}</div>
              <h3 className="text-[13px] font-semibold text-stone-900">{r.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12. Career Tendencies ── */}
      <section className="mb-10" aria-label="Career Tendencies">
        <SectionTitle number={12} title={d.careerTendencies.title ?? 'Career Tendencies'} subtitle={d.careerTendencies.subtitle ?? 'Professional inclinations based on chart energy'} />
        <div className="space-y-3 border border-stone-200 p-6">
          {d.careerTendencies.content.map((c) => (
            <ThinBar key={c.area} value={c.score} label={c.area} color="bg-indigo-700" />
          ))}
        </div>
      </section>

      {/* ── 13. Growth Areas ── */}
      <section className="mb-10" aria-label="Growth Areas">
        <SectionTitle number={13} title={d.growthAreas.title ?? 'Growth Areas'} subtitle={d.growthAreas.subtitle ?? 'Opportunities for evolution'} />
        <div className="border border-stone-200 py-4 pl-5 pr-6">
          <ul className="space-y-2.5">
            {d.growthAreas.content.map((area) => (
              <li key={area} className="flex items-start gap-3 text-[13px] leading-relaxed text-stone-500">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 14. Cosmic Timeline ── */}
      <section className="mb-10" aria-label="Cosmic Timeline">
        <SectionTitle number={14} title={d.cosmicTimeline.title ?? 'Cosmic Timeline'} subtitle={d.cosmicTimeline.subtitle ?? 'Upcoming planetary influences — for entertainment'} />
        <div className="border border-stone-200 p-6">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[22px] top-2 bottom-2 w-px bg-stone-200" />
            <div className="space-y-6">
              {d.cosmicTimeline.content.map((tItem) => (
                <div key={tItem.year} className="relative flex gap-4">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="size-3 rounded-full border-2 border-indigo-500 bg-white" />
                  </div>
                  <div className="-mt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-stone-400">{tItem.year}</span>
                      <span className="text-[13px] font-medium text-stone-900">{tItem.theme}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-400">{tItem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 15. Compatibility Snapshot ── */}
      <section className="mb-10" aria-label="Compatibility Snapshot">
        <SectionTitle number={15} title={d.compatibilitySnapshot.title ?? 'Compatibility Snapshot'} subtitle={d.compatibilitySnapshot.subtitle ?? 'Which elemental energies resonate with yours'} />
        <div className="space-y-3 border border-stone-200 p-6">
          {d.compatibilitySnapshot.content.map((c) => (
            <ThinBar key={c.signType} value={c.score} label={c.signType} color="bg-stone-700" />
          ))}
        </div>
      </section>

      {/* ── 16. AI Reflection ── */}
      <section className="mb-10" aria-label="AI Reflection">
        <SectionTitle number={16} title={d.aiReflection.title ?? 'AI Reflection'} subtitle={d.aiReflection.subtitle} />
        <div className="border-l-2 border-indigo-600 py-3 pl-6">
          <p className="font-[Georgia,serif] text-lg italic leading-relaxed text-stone-700">
            &ldquo;{d.aiReflection.content}&rdquo;
          </p>
        </div>
      </section>

      {/* ── 17. Confidence & Disclaimer ── */}
      <section className="mb-6" aria-label="Confidence & Disclaimer">
        <SectionTitle number={17} title={d.disclaimer.title ?? 'Confidence & Disclaimer'} />
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-3">
          <div className="bg-white p-4 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-stone-400">{d.disclaimer.birthDataAccuracyTitle ?? 'Birth Data Accuracy'}</div>
            <div className="mt-1 font-[Georgia,serif] text-2xl text-stone-900">{d.disclaimer.dataAccuracy}%</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-stone-400">{d.disclaimer.chartCalculationTitle ?? 'Chart Calculation'}</div>
            <div className="mt-1 text-sm font-medium text-stone-900">{d.disclaimer.chartCalculation}</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-stone-400">{d.disclaimer.interpretationTitle ?? 'Interpretation'}</div>
            <div className="mt-1 text-sm font-medium text-stone-900">{d.disclaimer.interpretation}</div>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] leading-relaxed text-stone-300">
          {d.disclaimer.disclaimerText ?? 'This report is intended for personal reflection and entertainment. It does not provide scientific or psychological evaluation.'}
        </p>
      </section>
    </main>
  );
};

export default CosmicBlueprint;

if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('cosmic-blueprint', CosmicBlueprint);
}
