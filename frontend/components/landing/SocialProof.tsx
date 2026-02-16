"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Zap,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Section, Container } from "@/components/ui";

// ============================================================================
// SocialProof Layout Controls
// ============================================================================
interface SocialProofLayout {
  // Section
  sectionX: number;
  sectionY: number;
  // Header
  headerX: number;
  headerY: number;
  headerScale: number;
  // Logo Ticker
  tickerX: number;
  tickerY: number;
  tickerGap: number;
  // Stats grid
  statsX: number;
  statsY: number;
  statsGap: number;
  // Stat cards
  stat1X: number; stat1Y: number; stat1Scale: number;
  stat2X: number; stat2Y: number; stat2Scale: number;
  stat3X: number; stat3Y: number; stat3Scale: number;
}

const spDefaults: SocialProofLayout = {
  sectionX: 0, sectionY: 0,
  headerX: 0, headerY: -25, headerScale: 1.12,
  tickerX: 0, tickerY: 0, tickerGap: 96,
  statsX: 0, statsY: 0, statsGap: 32,
  stat1X: 0, stat1Y: 0, stat1Scale: 1,
  stat2X: 0, stat2Y: 0, stat2Scale: 1,
  stat3X: 0, stat3Y: 0, stat3Scale: 1,
};

type ControlDef = {
  key: keyof SocialProofLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const spControls: ControlDef[] = [
  // Section
  { key: 'sectionX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Section' },
  // Header
  { key: 'headerX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Header' },
  { key: 'headerY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Header' },
  { key: 'headerScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Header' },
  // Ticker
  { key: 'tickerX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Logo Ticker' },
  { key: 'tickerY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Logo Ticker' },
  { key: 'tickerGap', label: 'Gap', min: 16, max: 200, step: 4, unit: 'px', group: 'Logo Ticker' },
  // Stats grid
  { key: 'statsX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Stats Grid' },
  { key: 'statsY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Stats Grid' },
  { key: 'statsGap', label: 'Gap', min: 0, max: 80, step: 4, unit: 'px', group: 'Stats Grid' },
  // Stat cards
  { key: 'stat1X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Teams' },
  { key: 'stat1Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Teams' },
  { key: 'stat1Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '📊 Teams' },
  { key: 'stat2X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Notes' },
  { key: 'stat2Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Notes' },
  { key: 'stat2Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '📊 Notes' },
  { key: 'stat3X', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Uptime' },
  { key: 'stat3Y', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '📊 Uptime' },
  { key: 'stat3Scale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '📊 Uptime' },
];

function SocialProofControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: SocialProofLayout;
  onChange: (key: keyof SocialProofLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== spDefaults[k as keyof SocialProofLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// SocialProof Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [values]);

  const toggleGroup = (group: string) => {
    setCollapsed(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleBtn = (
    <button
      onClick={onToggle}
      className="fixed bottom-4 left-[660px] z-[9999] bg-amber-600 text-white p-3 rounded-full shadow-xl hover:bg-amber-700 transition-colors"
      title="Toggle SocialProof Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  const groups: Record<string, ControlDef[]> = {};
  spControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-16 left-[660px] z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[70vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-amber-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Social Proof
          </span>
          <div className="flex gap-1">
            <button onClick={copyValues} className="p-1.5 rounded-lg hover:bg-black/5" title="Copy values">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-black/5" title="Reset all">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="text-green-600 text-center text-[11px] font-sans font-medium mb-2">
            ✓ Values copied to clipboard
          </div>
        )}

        {Object.entries(groups).map(([group, ctrls]) => (
          <div key={group} className="mb-1">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex justify-between items-center py-1.5 px-1 text-[11px] font-sans font-bold text-brand-dark/60 hover:text-brand-dark uppercase tracking-wider"
            >
              {group}
              <span className="text-[10px]">{collapsed[group] ? '▸' : '▾'}</span>
            </button>
            {!collapsed[group] && (
              <div className="space-y-2 pl-1 pb-2">
                {ctrls.map((c) => (
                  <div key={c.key} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-brand-dark/70 font-sans font-medium">{c.label}</span>
                      <span className="text-brand-dark font-bold">
                        {c.unit === 'x' ? values[c.key].toFixed(2) : values[c.key]}{c.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={values[c.key]}
                      onChange={(e) => onChange(c.key, parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-amber-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// Data
// ============================================================================
const LOGOS = [
  { name: "Acme Corp", width: 120 },
  { name: "GlobalTech", width: 140 },
  { name: "Nebula", width: 110 },
  { name: "Trio", width: 90 },
  { name: "FoxHub", width: 130 },
  { name: "Circle", width: 100 },
  { name: "Aven", width: 110 },
  { name: "Treva", width: 100 },
];

const STATS = [
  { value: "4,000+", label: "Teams", icon: Users },
  { value: "2M+", label: "Notes Created", icon: Sparkles },
  { value: "99.9%", label: "Uptime", icon: Zap },
];

// ============================================================================
// SocialProof Component
// ============================================================================
const SocialProof = () => {
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<SocialProofLayout>(spDefaults);

  const handleChange = useCallback((key: keyof SocialProofLayout, val: number) => {
    setLayout(prev => ({ ...prev, [key]: val }));
  }, []);

  const t = (x: number, y: number, scale?: number) => ({
    transform: `translate(${x}px, ${y}px)${scale !== undefined ? ` scale(${scale})` : ''}`,
    transformOrigin: 'center center' as const,
  });

  const statKeys: Array<{ x: keyof SocialProofLayout; y: keyof SocialProofLayout; s: keyof SocialProofLayout }> = [
    { x: 'stat1X', y: 'stat1Y', s: 'stat1Scale' },
    { x: 'stat2X', y: 'stat2Y', s: 'stat2Scale' },
    { x: 'stat3X', y: 'stat3Y', s: 'stat3Scale' },
  ];

  return (
    <>
      <Section
        spacing="medium"
        fullWidth
        className="border-y border-black/5 bg-[#F9F9F9]"
        style={t(layout.sectionX, layout.sectionY)}
      >
        <Container>
          {/* Header */}
          <div
            className="text-center mb-10"
            style={t(layout.headerX, layout.headerY, layout.headerScale)}
          >
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Trusted by innovative teams worldwide
            </p>
          </div>

          {/* Logo Ticker */}
          <div
            className="relative w-full overflow-hidden mask-linear-fade"
            style={t(layout.tickerX, layout.tickerY)}
          >
            <div
              className="flex items-center w-max animate-scroll"
              style={{ gap: `${layout.tickerGap}px` }}
            >
              {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
                <div key={i} className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                  <span className="text-xl md:text-2xl font-black text-gray-800 font-serif">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            className="grid md:grid-cols-3 mt-20 border-t border-black/5 pt-12"
            style={{
              gap: `${layout.statsGap}px`,
              ...t(layout.statsX, layout.statsY),
            }}
          >
            {STATS.map((stat, i) => (
              <div key={i} style={t(layout[statKeys[i].x] as number, layout[statKeys[i].y] as number, layout[statKeys[i].s] as number)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center space-y-2 p-6 rounded-2xl bg-white border border-black/5 shadow-sm"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-beige mb-2 text-brand-dark">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-brand-dark">{stat.value}</h3>
                  <p className="text-base font-medium text-gray-500">{stat.label}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* SocialProof Layout Controls (dev tool) */}
      <SocialProofControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(spDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default SocialProof;
