"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Move, Maximize2, RotateCcw, Copy } from "lucide-react";
import { Section, Container, FloatingCard } from "@/components/ui";
import { COLORS, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// Hero Layout Controls
// ============================================================================
interface HeroLayout {
  // Section-level
  sectionX: number;
  sectionY: number;
  // Left column (text)
  leftX: number;
  leftY: number;
  leftScale: number;
  // Heading
  headingX: number;
  headingY: number;
  headingScale: number;
  // Subtitle
  subtitleX: number;
  subtitleY: number;
  subtitleMaxWidth: number;
  // CTA Button
  ctaX: number;
  ctaY: number;
  ctaScale: number;
  // Social proof row
  socialX: number;
  socialY: number;
  // Right column (cards)
  rightX: number;
  rightY: number;
  rightScale: number;
  // Grid gap
  gridGap: number;
  // Card 1: "Real-time Collab"
  card1X: number;
  card1Y: number;
  card1Scale: number;
  card1TextX: number;
  card1TextY: number;
  card1TextScale: number;
  // Card 2: "Syncing..."
  card2X: number;
  card2Y: number;
  card2Scale: number;
  card2TextX: number;
  card2TextY: number;
  card2TextScale: number;
  // Card 3: "My Notes"
  card3X: number;
  card3Y: number;
  card3Scale: number;
  card3TextX: number;
  card3TextY: number;
  card3TextScale: number;
  // Card 3 subcard text
  card3Sub1X: number;
  card3Sub1Y: number;
  card3Sub2X: number;
  card3Sub2Y: number;
  // Card 3 subcard inner text
  card3Sub1TextX: number;
  card3Sub1TextY: number;
  card3Sub2TextX: number;
  card3Sub2TextY: number;
}

const heroDefaults: HeroLayout = {
  sectionX: 0, sectionY: 0,
  //hero text
  leftX: 20, leftY: 0, leftScale: 1,
  headingX: 0, headingY: 0, headingScale: 1,
  subtitleX: 0, subtitleY: 0, subtitleMaxWidth: 512,
  ctaX: 0, ctaY: 0, ctaScale: 1,
  socialX: 0, socialY: 20,
  //sync button
  rightX: 0, rightY: 0, rightScale: 1,
  gridGap: 64,
  // Cards
  card1X: 0, card1Y: 0, card1Scale: 3, card1TextX: 10, card1TextY: 0, card1TextScale: 1,
  card2X: 0, card2Y: 0, card2Scale: 2, card2TextX: 0, card2TextY: -10, card2TextScale: 1,
  card3X: 0, card3Y: 0, card3Scale: 2, card3TextX: 20, card3TextY: 20, card3TextScale: 1,
  card3Sub1X: 0, card3Sub1Y: 50, card3Sub2X: 0, card3Sub2Y: 50,
  card3Sub1TextX: 5, card3Sub1TextY: 0, card3Sub2TextX: 5, card3Sub2TextY: 0,
};

type ControlDef = {
  key: keyof HeroLayout;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
};

const heroControls: ControlDef[] = [
  // Section
  { key: 'sectionX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Section' },
  { key: 'sectionY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Section' },
  // Left column
  { key: 'leftX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Left Column' },
  { key: 'leftY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Left Column' },
  { key: 'leftScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Left Column' },
  // Heading
  { key: 'headingX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Heading' },
  { key: 'headingScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'Heading' },
  // Subtitle
  { key: 'subtitleX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Subtitle' },
  { key: 'subtitleY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Subtitle' },
  { key: 'subtitleMaxWidth', label: 'Max Width', min: 200, max: 900, step: 10, unit: 'px', group: 'Subtitle' },
  // CTA
  { key: 'ctaX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'CTA Button' },
  { key: 'ctaY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'CTA Button' },
  { key: 'ctaScale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: 'x', group: 'CTA Button' },
  // Social proof
  { key: 'socialX', label: '← →', min: -200, max: 200, step: 1, unit: 'px', group: 'Social Proof' },
  { key: 'socialY', label: '↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: 'Social Proof' },
  // Right column
  { key: 'rightX', label: '← →', min: -300, max: 300, step: 1, unit: 'px', group: 'Right Column' },
  { key: 'rightY', label: '↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: 'Right Column' },
  { key: 'rightScale', label: 'Scale', min: 0.3, max: 1.5, step: 0.01, unit: 'x', group: 'Right Column' },
  // Grid
  { key: 'gridGap', label: 'Gap', min: 0, max: 128, step: 4, unit: 'px', group: 'Grid' },
  // Card 1: Real-time Collab
  { key: 'card1X', label: 'Card ← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Collab Card' },
  { key: 'card1Y', label: 'Card ↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Collab Card' },
  { key: 'card1Scale', label: 'Card Scale', min: 0.3, max: 2, step: 0.01, unit: 'x', group: '🃏 Collab Card' },
  { key: 'card1TextX', label: 'Text ← →', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Collab Card' },
  { key: 'card1TextY', label: 'Text ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Collab Card' },
  { key: 'card1TextScale', label: 'Text Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Collab Card' },
  // Card 2: Syncing
  { key: 'card2X', label: 'Card ← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Syncing Card' },
  { key: 'card2Y', label: 'Card ↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Syncing Card' },
  { key: 'card2Scale', label: 'Card Scale', min: 0.3, max: 2, step: 0.01, unit: 'x', group: '🃏 Syncing Card' },
  { key: 'card2TextX', label: 'Text ← →', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Syncing Card' },
  { key: 'card2TextY', label: 'Text ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Syncing Card' },
  { key: 'card2TextScale', label: 'Text Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Syncing Card' },
  // Card 3: My Notes
  { key: 'card3X', label: 'Card ← →', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Y', label: 'Card ↑ ↓', min: -200, max: 200, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Scale', label: 'Card Scale', min: 0.3, max: 2, step: 0.01, unit: 'x', group: '🃏 Notes Card' },
  { key: 'card3TextX', label: 'Title ← →', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3TextY', label: 'Title ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3TextScale', label: 'Title Scale', min: 0.5, max: 2, step: 0.01, unit: 'x', group: '🃏 Notes Card' },
  { key: 'card3Sub1X', label: 'Sub1 ← →', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub1Y', label: 'Sub1 ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub1TextX', label: 'Sub1 Text ←→', min: -50, max: 50, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub1TextY', label: 'Sub1 Text ↑↓', min: -50, max: 50, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub2X', label: 'Sub2 ← →', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub2Y', label: 'Sub2 ↑ ↓', min: -100, max: 100, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub2TextX', label: 'Sub2 Text ←→', min: -50, max: 50, step: 1, unit: 'px', group: '🃏 Notes Card' },
  { key: 'card3Sub2TextY', label: 'Sub2 Text ↑↓', min: -50, max: 50, step: 1, unit: 'px', group: '🃏 Notes Card' },
];

function HeroControls({
  values,
  onChange,
  onReset,
  visible,
  onToggle,
}: {
  values: HeroLayout;
  onChange: (key: keyof HeroLayout, val: number) => void;
  onReset: () => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const copyValues = useCallback(() => {
    const changed = Object.entries(values).filter(
      ([k, v]) => v !== heroDefaults[k as keyof HeroLayout]
    );
    const output = changed.length === 0
      ? '// All values at defaults'
      : `// Hero Layout Values\n${changed.map(([k, v]) => `// ${k}: ${v}`).join('\n')}`;
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
      className="fixed bottom-4 left-4 z-[9999] bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
      title="Toggle Hero Layout Controls"
      style={{ transform: 'none' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );

  if (!visible) return toggleBtn;

  // Group controls
  const groups: Record<string, ControlDef[]> = {};
  heroControls.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  return (
    <>
      {toggleBtn}
      <div
        className="fixed bottom-16 left-4 z-[9999] w-72 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl p-4 text-xs font-mono max-h-[70vh] overflow-y-auto"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/95 py-1">
          <span className="text-sm font-bold text-blue-700 font-sans flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" /> Hero Controls
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
                      className="w-full h-1.5 rounded-full appearance-none bg-black/10 accent-blue-600 cursor-pointer"
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
// Hero Component
// ============================================================================
const Hero = () => {
  const [showControls, setShowControls] = useState(false);
  const [layout, setLayout] = useState<HeroLayout>(heroDefaults);

  const handleChange = useCallback((key: keyof HeroLayout, val: number) => {
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
        fullWidth
        className="relative overflow-hidden"
        style={{
          backgroundColor: COLORS.brand.beige,
          ...t(layout.sectionX, layout.sectionY),
        }}
      >
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-yellow/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-brand-accent/10 blur-[100px]" />
        </div>

        {/* Relative wrapper for fixed-height hero layout */}
        <div className="relative h-[600px] lg:h-[700px]">

          {/* Left column: inside Container for centered alignment */}
          <Container className="relative h-full z-10">
            <div
              className="flex items-center h-full"
              style={{ gap: `${layout.gridGap}px` }}
            >
              {/* Left: Text Content */}
              <div
                className="text-center lg:text-left w-full lg:w-1/2"
                style={t(layout.leftX, layout.leftY, layout.leftScale)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-8 border border-black/5"
                >
                  <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                  <span className="text-sm font-bold tracking-wide uppercase text-brand-dark">MIT License • Open Source</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                  className={cn(TYPOGRAPHY.heading.h1, "leading-[1.1] mb-8 tracking-tight")}
                  style={{
                    color: COLORS.text.primary,
                    ...t(layout.headingX, layout.headingY, layout.headingScale),
                  }}
                >
                  Collaborative <br />
                  Knowledge Base <br />
                  <span className="relative inline-block z-10">
                    for Teams.
                    <svg className="absolute w-[110%] h-4 -bottom-1 -left-2 text-brand-yellow -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" opacity="0.8" />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-brand-dark/80 mb-10 mx-auto lg:mx-0 leading-relaxed font-medium text-justify"
                  style={{
                    maxWidth: `${layout.subtitleMaxWidth}px`,
                    ...t(layout.subtitleX, layout.subtitleY),
                  }}
                >
                  NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  style={t(layout.ctaX, layout.ctaY, layout.ctaScale)}
                >
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center pl-8 pr-2 py-3 text-xl font-bold text-white bg-brand-dark rounded-full hover:bg-black hover:scale-105 transition-all duration-300 shadow-xl z-20"
                  >
                    Start Writing
                    <div className="ml-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </Link>
                </motion.div>

                <div
                  className="mt-16 flex items-center justify-center lg:justify-start gap-4"
                  style={t(layout.socialX, layout.socialY)}
                >
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-brand-beige bg-gray-200 flex items-center justify-center text-xs font-bold bg-white text-black shadow-md relative z-0 hover:z-10 hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5 opacity-50" />
                      </div>
                    ))}
                  </div>
                  <p className="text-base font-bold text-brand-dark">
                    Trusted by 4,000+ teams
                  </p>
                </div>
              </div>
            </div>
          </Container>

          {/* Right: Floating cards — positioned to viewport right edge, outside Container */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full hidden md:block perspective-1000"
            style={t(layout.rightX, layout.rightY, layout.rightScale)}
          >
            {/* Card grid */}
            <div className="absolute inset-0 grid grid-rows-3 grid-cols-2 gap-4 p-4 lg:p-8">

              {/* Card 1: Shared to (Top Right) - Desktop Only */}
              <div
                className="row-start-1 col-start-2 place-self-center hidden lg:block z-20"
                style={t(layout.card1X, layout.card1Y, layout.card1Scale)}
              >
                <FloatingCard
                  className="w-[18rem] bg-[#FDFBF7] p-8 text-brand-dark"
                  rotate={-2}
                  yOffset={-10}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white">←</div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white" />
                    </div>
                  </div>
                  <h3
                    className="text-3xl font-serif font-bold mb-4 leading-none"
                    style={t(layout.card1TextX, layout.card1TextY, layout.card1TextScale)}
                  >Real-time<br />Collab</h3>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">+</button>
                    <button className="w-10 h-10 rounded-full bg-[#EAE8DD] flex items-center justify-center"><ImageIcon className="w-4 h-4 opacity-50" /></button>
                  </div>
                </FloatingCard>
              </div>

              {/* Card 2: Status (Center/Right) - Tablet & Desktop */}
              <div
                className="row-start-2 col-span-2 place-self-center z-30"
                style={t(layout.card2X, layout.card2Y, layout.card2Scale)}
              >
                <FloatingCard
                  className="p-0 border-none bg-transparent shadow-none"
                  rotate={0}
                >
                  <div
                    className="inline-block px-8 py-4 border-4 border-brand-dark rounded-[2rem_1rem_2rem_0.5rem] font-handwritten font-bold transform -rotate-1 hover:rotate-0 transition-transform cursor-cell bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={t(layout.card2TextX, layout.card2TextY, layout.card2TextScale)}
                  >
                    Syncing...
                  </div>
                </FloatingCard>
              </div>

              {/* Card 3: Dark Mode / Mobile (Bottom Left) - Tablet & Desktop */}
              <div
                className="row-start-3 col-start-1 place-self-center lg:place-self-start z-20"
                style={t(layout.card3X, layout.card3Y, layout.card3Scale)}
              >
                <FloatingCard
                  className="w-[358px] min-h-[200px] bg-[#0F0F0F] text-white py-10 px-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-none"
                  rotate={6}
                  delay={0.2}
                  xOffset={20}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      style={t(layout.card3TextX, layout.card3TextY, layout.card3TextScale)}
                    >
                      <h3 className="text-2xl font-serif mb-1 tracking-tight">My Notes</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">::</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="bg-brand-accent text-brand-dark p-5 rounded-[1rem] flex flex-col gap-3"
                      style={t(layout.card3Sub1X, layout.card3Sub1Y)}
                    >
                      <div style={t(layout.card3Sub1TextX, layout.card3Sub1TextY)}>
                        <div className="font-bold text-base leading-snug">Plan for<br />The Day</div>
                        <div className="flex items-center gap-1.5 text-xs font-bold mt-3"><div className="w-4 h-8 rounded-full bg-brand-dark/20 flex items-center justify-center text-[10px]">✓</div> Gym</div>
                      </div>
                    </div>
                    <div
                      className="bg-brand-yellow text-brand-dark p-5 rounded-[1rem] relative overflow-hidden"
                      style={t(layout.card3Sub2X, layout.card3Sub2Y)}
                    >
                      <div style={t(layout.card3Sub2TextX, layout.card3Sub2TextY)}>
                        <div className="font-bold text-base mb-2">Ideas</div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 bg-brand-dark rounded-tl-[1rem] flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/50" />
                      </div>
                    </div>
                  </div>
                </FloatingCard>
              </div>

            </div>
          </div>

        </div>
      </Section>

      {/* Hero Layout Controls (dev tool) */}
      <HeroControls
        values={layout}
        onChange={handleChange}
        onReset={() => setLayout(heroDefaults)}
        visible={showControls}
        onToggle={() => setShowControls(!showControls)}
      />
    </>
  );
};

export default Hero;
