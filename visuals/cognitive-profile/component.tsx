import React, { useMemo } from 'react';
import { CognitiveProfileSchema, type CognitiveProfileData } from './schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sampleData from './sample-data.json';

interface CognitiveProfileProps {
  schema: typeof CognitiveProfileSchema | null;
  data?: CognitiveProfileData | null;
}

declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<CognitiveProfileProps>) => void;
  }
}

/* ──────────────── Radar Chart ──────────────── */
const RadarChart: React.FC<{ traits: Array<{ name: string; score: number }> }> = React.memo(({ traits }) => {
  const n = traits.length;
  const padding = 80;
  const maxR = 100;
  const size = maxR * 2 + padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const angleStep = (2 * Math.PI) / n;
  const labelOffset = 22;

  const pt = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const dataPoints = traits.map((t, i) => pt(i, t.score));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[400px]" role="img" aria-label="Core traits radar chart">
      {[20, 40, 60, 80, 100].map((level) => {
        const pts = traits.map((_, i) => pt(i, level));
        return <polygon key={level} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e7e5e4" strokeWidth={0.5} />;
      })}
      {traits.map((_, i) => {
        const edge = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="#e7e5e4" strokeWidth={0.5} />;
      })}
      <polygon points={polygon} fill="rgba(28,25,23,0.06)" stroke="#1c1917" strokeWidth={1.5} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1c1917" />
      ))}
      {traits.map((t, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const lx = cx + (maxR + labelOffset) * Math.cos(angle);
        const ly = cy + (maxR + labelOffset) * Math.sin(angle);
        const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        return (
          <g key={t.name}>
            <text x={lx} y={ly - 5} textAnchor={anchor} fill="#78716c" style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.03em' }}>{t.name}</text>
            <text x={lx} y={ly + 8} textAnchor={anchor} fill="#1c1917" style={{ fontSize: 13, fontWeight: 700 }}>{t.score}</text>
          </g>
        );
      })}
    </svg>
  );
});
RadarChart.displayName = 'RadarChart';

/* ──────────────── Bubble Chart ──────────────── */
const BubbleChart: React.FC<{ interests: Array<{ topic: string; size: number }> }> = React.memo(({ interests }) => {
  const sorted = useMemo(() => [...interests].sort((a, b) => b.size - a.size), [interests]);
  const minR = 16;
  const maxR = 44;
  const maxSize = Math.max(...interests.map((i) => i.size));

  const bubbles = useMemo(() => {
    const result: Array<{ topic: string; r: number; cx: number; cy: number }> = [];
    const svgW = 420;
    const svgH = 220;
    const cx = svgW / 2;
    const cy = svgH / 2;

    sorted.forEach((item) => {
      const r = minR + ((item.size / maxSize) * (maxR - minR));
      let placed = false;
      let attempts = 0;
      let bx = cx;
      let by = cy;

      while (!placed && attempts < 300) {
        const angle = attempts * 0.618033988749895 * Math.PI * 2;
        const dist = attempts * 2.5;
        bx = cx + dist * Math.cos(angle);
        by = cy + dist * Math.sin(angle);
        const collision = result.some((b) => {
          const dx = b.cx - bx;
          const dy = b.cy - by;
          return Math.sqrt(dx * dx + dy * dy) < b.r + r + 3;
        });
        if (!collision && bx - r > 0 && bx + r < svgW && by - r > 0 && by + r < svgH) placed = true;
        attempts++;
      }
      result.push({ topic: item.topic, r, cx: bx, cy: by });
    });
    return result;
  }, [sorted, maxSize]);

  const tones = ['#1c1917', '#292524', '#44403c', '#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#78716c', '#57534e'];

  return (
    <svg viewBox="0 0 420 220" className="mx-auto w-full max-w-[440px]" role="img" aria-label="Interest map bubble chart">
      {bubbles.map((b, i) => (
        <g key={b.topic}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill={tones[i % tones.length]} opacity={0.85} />
          <text x={b.cx} y={b.cy} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: b.r > 28 ? 11 : 9, fontWeight: 600 }}>{b.topic}</text>
        </g>
      ))}
    </svg>
  );
});
BubbleChart.displayName = 'BubbleChart';

/* ──────────────── Section Title ──────────────── */
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

/* ──────────────── Thin Bar ──────────────── */
const ThinBar: React.FC<{ value: number; label?: string; color?: string }> = ({ value, label, color = 'bg-stone-800' }) => (
  <div>
    {label && (
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] text-stone-600">{label}</span>
        <span className="font-mono text-xs text-stone-400">{value}%</span>
      </div>
    )}
    <div className="h-1 bg-stone-100">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} />
    </div>
  </div>
);

/* ──────────────── Communication Spectrum ──────────────── */
const Spectrum: React.FC<{ left: string; right: string; position: number }> = ({ left, right, position }) => (
  <div className="mb-5 last:mb-0">
    <div className="mb-1.5 flex justify-between">
      <span className={`text-[11px] uppercase tracking-wider ${position < 50 ? 'font-medium text-stone-900' : 'text-stone-400'}`}>{left}</span>
      <span className={`text-[11px] uppercase tracking-wider ${position > 50 ? 'font-medium text-stone-900' : 'text-stone-400'}`}>{right}</span>
    </div>
    <div className="relative h-px bg-stone-200">
      <div className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 bg-stone-900" style={{ left: `${position}%` }} role="slider" aria-valuenow={position} aria-valuemin={0} aria-valuemax={100} aria-label={`${left} to ${right}`} />
    </div>
  </div>
);

/* ──────────────── Main Component ──────────────── */
const CognitiveProfile: React.FC<CognitiveProfileProps> = ({ data }) => {
  let validatedData: CognitiveProfileData;
  try {
    validatedData = data
      ? CognitiveProfileSchema.parse(data)
      : CognitiveProfileSchema.parse(sampleData);
  } catch (error) {
    console.error('Data validation failed:', error);
    validatedData = CognitiveProfileSchema.parse(sampleData);
  }

  const d = validatedData;

  return (
    <main className="mx-auto max-w-3xl p-6 font-[system-ui,sans-serif] print:max-w-none print:p-0">

      {/* ── 1. Executive Summary ── */}
      <header className="mb-10 border-b border-stone-200 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.25em] text-stone-400">Cognitive Profile</p>
            <h1 className="font-[Georgia,serif] text-3xl text-stone-900">{d.subjectName}</h1>
          </div>
          <div className="flex shrink-0 gap-6 pt-1">
            <div className="text-right">
              <div className="font-[Georgia,serif] text-3xl font-normal text-stone-900">{d.executiveSummary.overallScore}</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Score</div>
            </div>
            <div className="text-right">
              <div className="font-[Georgia,serif] text-3xl font-normal text-stone-900">{d.executiveSummary.aiConfidence}<span className="text-lg">%</span></div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Confidence</div>
            </div>
          </div>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-500">{d.executiveSummary.summary}</p>
      </header>

      {/* ── 2. Core Traits ── */}
      <section className="mb-10" aria-label="Core Traits">
        <SectionTitle number={2} title="Core Traits" subtitle="Multi-axis personality trait visualization" />
        <RadarChart traits={d.coreTraits} />
      </section>

      {/* ── 3. Big Five ── */}
      <section className="mb-10" aria-label="Big Five Approximation">
        <SectionTitle number={3} title="Big Five Approximation" subtitle="Estimated — based on conversational analysis" />
        <div className="mb-4 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
          {d.bigFive.traits.map((t) => (
            <div key={t.trait}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[13px] text-stone-600">{t.trait}</span>
                <span className="font-mono text-xs text-stone-400">{t.score}</span>
              </div>
              <div className="h-1 bg-stone-100">
                <div className={`h-full ${t.score >= 75 ? 'bg-stone-900' : t.score >= 50 ? 'bg-stone-600' : 'bg-stone-400'}`} style={{ width: `${t.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        {d.bigFive.commentary && (
          <p className="border-l border-stone-200 py-1 pl-4 text-xs italic leading-relaxed text-stone-400">{d.bigFive.commentary}</p>
        )}
      </section>

      {/* ── 4. Decision Making ── */}
      <section className="mb-10" aria-label="Decision Making Style">
        <SectionTitle number={4} title="Decision Making Style" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          {d.decisionMaking.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[13px] text-stone-600">
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </span>
                <span className="font-mono text-xs text-stone-400">{item.score}%</span>
              </div>
              <div className="h-1 bg-stone-100">
                <div className="h-full bg-stone-800" style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Communication Style ── */}
      <section className="mb-10" aria-label="Communication Style">
        <SectionTitle number={5} title="Communication Style" subtitle="Position on each spectrum" />
        <div className="border border-stone-200 p-6">
          {d.communicationStyle.map((s) => (
            <Spectrum key={`${s.left}-${s.right}`} left={s.left} right={s.right} position={s.position} />
          ))}
        </div>
      </section>

      {/* ── 6. Learning Preferences ── */}
      <section className="mb-10" aria-label="Learning Preferences">
        <SectionTitle number={6} title="Learning Preferences" />
        <div className="mb-6 space-y-3">
          {d.learningPreferences.methods.map((m) => (
            <ThinBar key={m.label} value={m.percentage} label={m.label} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-stone-200 bg-stone-200">
          <div className="bg-white p-4">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">Learns Best Through</h3>
            <ul className="space-y-2">
              {d.learningPreferences.learnsBestThrough.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-stone-600">
                  <span className="mt-0.5 text-stone-900">+</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-4">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">Struggles With</h3>
            <ul className="space-y-2">
              {d.learningPreferences.strugglesWith.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-stone-400">
                  <span className="mt-0.5 text-stone-300">−</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. Strengths ── */}
      <section className="mb-10" aria-label="Strengths">
        <SectionTitle number={7} title="Strengths" />
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-stone-200 bg-stone-200 lg:grid-cols-3">
          {d.strengths.map((s) => (
            <div key={s.title} className="bg-white p-5">
              <div className="mb-2 text-xl leading-none">{s.icon}</div>
              <h3 className="text-[13px] font-semibold text-stone-900">{s.title}</h3>
              {s.description && <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">{s.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Blind Spots ── */}
      <section className="mb-10" aria-label="Potential Blind Spots">
        <SectionTitle number={8} title="Potential Blind Spots" subtitle="Observed tendencies — not limitations" />
        <div className="border border-stone-200 py-4 pl-5 pr-6">
          <ul className="space-y-2.5">
            {d.blindSpots.map((spot) => (
              <li key={spot} className="flex items-start gap-3 text-[13px] leading-relaxed text-stone-500">
                <span className="mt-1.5 size-1 shrink-0 bg-stone-300" />
                {spot}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 9. Interest Map + Topics ── */}
      <section className="mb-10" aria-label="Interest Map">
        <SectionTitle number={9} title="Interest Map" subtitle="Relative interest intensity" />
        <BubbleChart interests={d.interestMap} />
        {d.conversationStats.mostDiscussedTopics.length > 0 && (
          <div className="mt-5 border-t border-stone-100 pt-4">
            <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-stone-400">Most Discussed Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {d.conversationStats.mostDiscussedTopics.map((topic) => (
                <span key={topic} className="border border-stone-200 px-2.5 py-1 text-[11px] text-stone-600">{topic}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 10. Motto ── */}
      <section className="mb-10" aria-label="AI Generated Motto">
        <SectionTitle number={10} title="Motto" />
        <div className="border-l-2 border-stone-900 py-2 pl-6">
          <p className="font-[Georgia,serif] text-xl italic leading-relaxed text-stone-800">
            &ldquo;{d.motto}&rdquo;
          </p>
        </div>
      </section>

      {/* ── 11. Operating Guide ── */}
      <section className="mb-10" aria-label="Personal Operating Guide">
        <SectionTitle number={11} title="Personal Operating Guide" subtitle="How to collaborate effectively" />
        <div className="grid grid-cols-3 gap-px overflow-hidden border border-stone-200 bg-stone-200">
          <div className="bg-white p-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">Works Best When</h3>
            <ul className="space-y-2.5">
              {d.operatingGuide.worksBestWhen.map((item) => (
                <li key={item} className="text-[12px] leading-relaxed text-stone-600">{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">May Struggle When</h3>
            <ul className="space-y-2.5">
              {d.operatingGuide.mayStruggleWhen.map((item) => (
                <li key={item} className="text-[12px] leading-relaxed text-stone-400">{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone-400">Best Feedback Style</h3>
            <ul className="space-y-2.5">
              {d.operatingGuide.bestFeedbackStyle.map((item) => (
                <li key={item} className="text-[12px] leading-relaxed text-stone-600">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 12. Archetype ── */}
      <section className="mb-10" aria-label="Archetype">
        <SectionTitle number={12} title="Archetype" subtitle="Dominant personality classification" />
        <div className="mb-4 flex flex-wrap gap-2">
          {d.archetype.archetypes.map((a) => (
            <div key={a.name} className="border border-stone-900 px-4 py-2">
              <span className="text-sm font-medium text-stone-900">{a.name}</span>
              <span className="ml-2 font-mono text-xs text-stone-400">{a.confidence}%</span>
            </div>
          ))}
        </div>
        <p className="text-[12px] italic leading-relaxed text-stone-400">{d.archetype.description}</p>
      </section>

      {/* ── 13. Confidence Meter ── */}
      <section className="mb-6" aria-label="Confidence Meter">
        <SectionTitle number={13} title="Confidence Meter" subtitle="Analysis reliability per section" />
        <div className="space-y-2.5">
          {d.confidenceMeter.map((c) => (
            <div key={c.section} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-[12px] text-stone-500">{c.section}</span>
              <div className="h-px flex-1 bg-stone-100">
                <div className="h-px bg-stone-700" style={{ width: `${c.confidence}%` }} role="progressbar" aria-valuenow={c.confidence} />
              </div>
              <span className="w-8 text-right font-mono text-[11px] text-stone-400">{c.confidence}%</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-stone-300">Lower confidence means the estimate is less reliably inferred from available data.</p>
      </section>
    </main>
  );
};

export default CognitiveProfile;

if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('cognitive-profile', CognitiveProfile);
}
