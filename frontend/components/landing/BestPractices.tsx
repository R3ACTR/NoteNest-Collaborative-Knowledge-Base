"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Type,
  List,
  Code,
  AlignLeft,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Section } from "@/components/ui";
import { COLORS } from "@/lib/design-tokens";

// ============================================================================
// Layout Controls
// ============================================================================
interface BPLayout {
  // Section
  sectionX: number;
  sectionY: number;
  sectionMinHeight: number;
  // Grid
  gridGap: number;
  // Left column
  leftX: number;
  leftY: number;
  leftScale: number;
  // Badge
  badgeX: number;
  badgeY: number;
  // Heading
  headingX: number;
  headingY: number;
  headingScale: number;
  // Principles grid
  principlesX: number;
  principlesY: number;
  principlesGap: number;
  // Right column
  rightX: number;
  rightY: number;
  rightScale: number;
  // Comparison card
  cardX: number;
  cardY: number;
  cardScale: number;
  cardMaxWidth: number;
  cardHeight: number;
  // Comparison card text
  badTextX: number;
  badTextY: number;
  goodTextX: number;
  goodTextY: number;
}

const bpDefaults: BPLayout = {
  sectionX: 0, sectionY: 27, sectionMinHeight: 650,
  gridGap: 128,
  leftX: 50, leftY: -40, leftScale: 1.12,
  badgeX: 0, badgeY: 0,
  headingX: 0, headingY: 0, headingScale: 1,
  principlesX: 0, principlesY: 32, principlesGap: 24,
  rightX: 76, rightY: 16, rightScale: 1,
  cardX: 6, cardY: -2, cardScale: 1, cardMaxWidth: 500, cardHeight: 600,
  badTextX: 0, badTextY: 0, goodTextX: 20, goodTextY: 20,
};

type ControlDef = {
  key: keyof BPLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const bpControls: ControlDef[] = [
  { key: 'sectionX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionMinHeight', label: 'Min Height', min: 0, max: 1200, step: 10, unit: 'px', group: 'Section' },
  { key: 'gridGap', label: 'Grid Gap', min: 0, max: 128, step: 4, unit: 'px', group: 'Section' },
  // Left
  { key: 'leftX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Left Column' },
  { key: 'leftY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Left Column' },
  { key: 'leftScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Left Column' },
  // Badge
  { key: 'badgeX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Badge' },
  { key: 'badgeY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Badge' },
  // Heading
  { key: 'headingX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Heading' },
  // Principles
  { key: 'principlesX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Principles' },
  { key: 'principlesY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Principles' },
  { key: 'principlesGap', label: 'Gap', min: 0, max: 60, step: 4, unit: 'px', group: 'Principles' },
  // Right
  { key: 'rightX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Right Column' },
  { key: 'rightY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Right Column' },
  { key: 'rightScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Right Column' },
  // Card
  { key: 'cardX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: '📝 Comparison Card' },
  { key: 'cardY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '📝 Comparison Card' },
  { key: 'cardScale', label: 'Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '📝 Comparison Card' },
  { key: 'cardMaxWidth', label: 'Max Width', min: 300, max: 800, step: 10, unit: 'px', group: '📝 Comparison Card' },
  { key: 'cardHeight', label: 'Height', min: 300, max: 900, step: 10, unit: 'px', group: '📝 Comparison Card' },
  // Card text
  { key: 'badTextX', label: 'Weak ← →', min: -100, max: 100, step: 1, unit: 'px', group: '📝 Card Text' },
  { key: 'badTextY', label: 'Weak ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '📝 Card Text' },
  { key: 'goodTextX', label: 'Strong ← →', min: -100, max: 100, step: 1, unit: 'px', group: '📝 Card Text' },
  { key: 'goodTextY', label: 'Strong ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '📝 Card Text' },
];

function BPControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: BPLayout;
  onChange: (key: keyof BPLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== bpDefaults[k as keyof BPLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// BestPractices Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
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
      className="fixed bottom-4 left-[980px] z-[9999] bg-rose-600 text-white p-3 rounded-full shadow-xl hover:bg-rose-700 transition-colors"
      title="Toggle BestPractices Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  const groups: Record<string, ControlDef[]> = {};
  bpControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-16 left-[980px] z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[70vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-rose-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Best Practices
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
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-rose-600 cursor-pointer"
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
const principles = [
  {
    title: "Clear Purpose",
    description: "Start every note with a 'Why'. Define the context immediately.",
    icon: Type
  },
  {
    title: "Structured Content",
    description: "Use H1, H2, and H3s to create a scannable hierarchy.",
    icon: AlignLeft
  },
  {
    title: "Actionable Info",
    description: "Include code snippets, commands, and direct links.",
    icon: Code
  },
  {
    title: "Consistent Formatting",
    description: "Stick to standard Markdown conventions for readability.",
    icon: List
  }
];

const BadNote = ({ textStyle }: { textStyle?: React.CSSProperties }) => (
  <div className="h-full bg-red-50/50 rounded-3xl border border-red-100 relative">
    <div className="absolute top-4 right-4 text-red-400">
      <XCircle className="w-8 h-8" />
    </div>
    <div className="relative p-8" style={textStyle}>
      <div className="space-y-6 opacity-70 font-mono text-sm sm:text-base text-brand-dark">
        <p>Setup stuff</p>
        <p>Just install things and run the command.</p>
        <div className="bg-black/5 p-4 rounded-lg">
          npm install<br />
          start
        </div>
        <p>its easy.</p>
      </div>
    </div>
    <div className="absolute inset-0 bg-red-500/5 pointer-events-none rounded-3xl" />
  </div>
);

const GoodNote = ({ textStyle }: { textStyle?: React.CSSProperties }) => (
  <div className="h-full bg-white rounded-3xl border border-green-100 shadow-sm relative">
    <div className="absolute top-4 right-4 text-green-500">
      <CheckCircle2 className="w-8 h-8" />
    </div>
    <div className="relative p-8" style={textStyle}>
      <div className="space-y-4 text-brand-dark">
        <h3 className="text-xl font-bold font-serif border-b border-black/5 pb-2">Local Development Setup</h3>
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-dark/60">Prerequisites</h4>
          <ul className="list-disc list-inside text-sm pl-2 space-y-1">
            <li>Node.js {'>'} 18</li>
            <li>NPM {'>'} 9</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-dark/60">Steps</h4>
          <div className="bg-brand-dark text-white p-4 rounded-xl font-mono text-xs shadow-inner">
            <p className="text-green-400"># 1. Install dependencies</p>
            <p>npm install</p>
            <br />
            <p className="text-green-400"># 2. Start dev server</p>
            <p>npm run dev</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// BestPractices Component
// ============================================================================
const BestPractices = () => {
  const [activeView, setActiveView] = useState<'bad' | 'good'>('good');
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<BPLayout>(bpDefaults);

  const handleChange = useCallback((key: keyof BPLayout, val: number) => {
    setLayout(prev => ({ ...prev, [key]: val }));
  }, []);

  const t = (x: number, y: number, scale?: number) => ({
    transform: `translate(${x}px, ${y}px)${scale !== undefined ? ` scale(${scale})` : ''}`,
    transformOrigin: 'center center' as const,
  });

  return (
    <>
      <Section
        spacing="large"
        background="bg-brand-beige"
        className="overflow-hidden"
        style={{
          ...t(layout.sectionX, layout.sectionY),
          ...(layout.sectionMinHeight > 0 ? { minHeight: `${layout.sectionMinHeight}px` } : {}),
        }}
      >
        <div
          className="grid lg:grid-cols-2 items-center"
          style={{ gap: `${layout.gridGap}px` }}
        >
          {/* Left: Content & Principles */}
          <div
            className="space-y-10"
            style={t(layout.leftX, layout.leftY, layout.leftScale)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm text-sm font-bold uppercase tracking-wider"
              style={t(layout.badgeX, layout.badgeY)}
            >
              NoteNest Methodology
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-black text-brand-dark leading-tight"
              style={t(layout.headingX, layout.headingY, layout.headingScale)}
            >
              Write notes that <br />
              <span className="text-brand-accent">actually get read.</span>
            </motion.h2>

            <div
              className="grid"
              style={{
                gap: `${layout.principlesGap}px`,
                ...t(layout.principlesX, layout.principlesY),
              }}
            >
              {principles.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/50 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-dark mb-1">{p.title}</h4>
                    <p className="text-brand-dark/70 text-sm font-medium">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Comparison */}
          <div
            className="relative"
            style={t(layout.rightX, layout.rightY, layout.rightScale)}
          >
            {/* Toggle Switch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex bg-brand-dark rounded-full p-1 shadow-xl">
              <button
                onClick={() => setActiveView('bad')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeView === 'bad' ? 'bg-white text-brand-dark' : 'text-white/60 hover:text-white'}`}
              >
                Weak
              </button>
              <button
                onClick={() => setActiveView('good')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeView === 'good' ? 'bg-white text-brand-dark' : 'text-white/60 hover:text-white'}`}
              >
                Strong
              </button>
            </div>

            <div
              className="relative w-full mx-auto perspective-1000 group"
              style={{
                maxWidth: `${layout.cardMaxWidth}px`,
                height: `${layout.cardHeight}px`,
                ...t(layout.cardX, layout.cardY, layout.cardScale),
              }}
            >
              {/* Background Decorative Element */}
              <div className="absolute inset-0 bg-brand-dark rounded-[3rem] rotate-3 opacity-10 scale-95 group-hover:rotate-6 transition-transform duration-500 will-change-transform" />

              <div className="relative h-full bg-white rounded-[2.5rem] shadow-2xl p-2 border-4 border-white overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                  >
                    {activeView === 'bad'
                      ? <BadNote textStyle={t(layout.badTextX, layout.badTextY)} />
                      : <GoodNote textStyle={t(layout.goodTextX, layout.goodTextY)} />
                    }
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="text-center mt-8 text-sm font-bold text-brand-dark/40 uppercase tracking-widest animate-pulse">
              Toggle to compare
            </div>
          </div>
        </div>
      </Section>

      {/* BestPractices Layout Controls (dev tool) */}
      <BPControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(bpDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default BestPractices;
