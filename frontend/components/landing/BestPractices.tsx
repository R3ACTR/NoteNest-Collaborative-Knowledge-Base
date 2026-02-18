"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Type,
  List,
  Code,
  AlignLeft,
} from "lucide-react";
import { Section } from "@/components/ui";
import { cn } from "@/lib/utils";

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

const BadNote = ({ textClassName }: { textClassName?: string }) => (
  <div className="h-full bg-red-50/50 rounded-3xl border border-red-100 relative">
    <div className="absolute top-4 right-4 text-red-400">
      <XCircle className="w-8 h-8" />
    </div>
    <div className={cn("relative p-8", textClassName)}>
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

const GoodNote = ({ textClassName }: { textClassName?: string }) => (
  <div className="h-full bg-white rounded-3xl border border-green-100 shadow-sm relative">
    <div className="absolute top-4 right-4 text-green-500">
      <CheckCircle2 className="w-8 h-8" />
    </div>
    <div className={cn("relative p-8", textClassName)}>
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

const BestPractices = () => {
  const [activeView, setActiveView] = useState<'bad' | 'good'>('good');

  return (
    <Section
      spacing="large"
      background="bg-brand-beige"
      className="overflow-hidden mt-[27px] min-h-[650px]"
    >

      <div
        className="grid lg:grid-cols-2 items-center gap-16 lg:gap-[128px]"
      >
        {/* Left: Content & Principles — translate(50px, -40px) scale(1.12) */}
        <div className="md:transform-gpu lg:translate-x-[50px] lg:-translate-y-[40px] lg:scale-[1.12] origin-center">
          <div
            className="space-y-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm text-sm font-bold uppercase tracking-wider"
            >
              NoteNest Methodology
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-black text-brand-dark leading-tight"
            >
              Write notes that <br />
              <span className="text-brand-accent">actually get read.</span>
            </motion.h2>

            {/* Principles Grid — translateY(32px), gap 24px */}
            <div
              className="grid gap-6 lg:translate-y-[32px]"
            >
              {principles.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/50 transition-colors duration-300"
                  style={{ paddingLeft: `${i * 24 + 16}px` }}
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
        </div>

        {/* Right: Interactive Comparison — translate(76px, 16px) */}
        <div className="md:transform-gpu lg:translate-x-[76px] lg:translate-y-[16px]">
          <div
            className="relative"
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
                height: '600px',
                transformOrigin: 'center center'
              }}
            >
              {/* Background Decorative Element */}
              <div className="absolute inset-0 bg-brand-dark rounded-[3rem] rotate-3 opacity-10 scale-95 group-hover:rotate-6 transition-transform duration-500 will-change-transform" />

              <div className="relative h-full bg-white rounded-[2.5rem] shadow-2xl p-2 border-4 border-white overflow-hidden lg:translate-x-[6px] lg:-translate-y-[2px]">
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
                      ? <BadNote textClassName="" />
                      : <GoodNote textClassName="lg:translate-x-[20px] lg:translate-y-[20px]" />
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
      </div>
    </Section>
  );
};

export default BestPractices;
