"use client";

import { motion } from "framer-motion";
import {
  Users,
  Search,
  Folder,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Section, FeatureCard } from "@/components/ui";
import { cn } from "@/lib/utils";

// ============================================================================
// Features Component — Production Layout (locked from 1440px tuning session)
// ============================================================================

const Features = () => {
  return (
    <Section
      spacing="large"
      background="bg-white"
      id="features"
      style={{ transform: 'translateY(-26px)' }}
    >
      {/* Section Header — left-aligned, headerX:34 headerY:20 scale:1.06 maxWidth:768 */}
      <div
        className="text-left mb-16 lg:mb-24 max-w-[768px]"
        style={{ transform: 'translate(34px, 20px) scale(1.06)', transformOrigin: 'top left' }}
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block py-1 px-3 rounded-full bg-brand-beige text-brand-dark text-sm font-bold tracking-wide uppercase mb-4"
        >
          Powerful Features
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6"
        >
          Everything you need to <br /> build knowledge.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 leading-relaxed"
        >
          NoteNest is built for speed and collaboration. Experience a new way of organizing your team's collective intelligence.
        </motion.p>
      </div>

      {/* Bento Grid — gridGap: 80px */}
      <div className="grid md:grid-cols-3 gap-[80px]">

        {/* Card 1: Real-time Collaboration — translate(38, 55) scale(1.12) */}
        <div
          className="md:transform-gpu"
          style={{ transform: 'translate(38px, 55px) scale(1.12)', transformOrigin: 'center center' }}
        >
          <FeatureCard
            title="Real-time Collaboration"
            description="Create, organize, and collaborate on documentation in real-time. See cursor movements and edits as they happen."
            icon={<Users className="w-8 h-8 text-blue-600" />}
            className="md:col-span-2 bg-brand-beige h-full"
            illustration={
              <div className="relative h-48 rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-white" />
                    <div className="w-6 h-6 rounded-full bg-green-100 border border-white" />
                  </div>
                  <div className="text-xs text-gray-400">3 users editing...</div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-2 bg-gray-100 rounded animate-pulse" />
                  <div className="w-full h-2 bg-gray-100 rounded animate-pulse delay-75" />
                  <div className="w-5/6 h-2 bg-gray-100 rounded animate-pulse delay-150" />
                </div>
                <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                  Typing...
                </div>
              </div>
            }
          />
        </div>

        {/* Card 2: Instant Search — translate(130, 55) scale(1.12) */}
        <div style={{ transform: 'translate(130px, 55px) scale(1.12)', transformOrigin: 'center center' }}>
          <FeatureCard
            title="Instant Search"
            description="Find anything in seconds with our powerful full-text search engine."
            icon={<Search className="w-8 h-8 text-orange-500" />}
            background="bg-orange-50/50"
            className="h-full"
          />
        </div>

        {/* Card 3: Smart Organization — translate(200, 55) scale(1.12) */}
        <div style={{ transform: 'translate(200px, 55px) scale(1.12)', transformOrigin: 'center center' }}>
          <FeatureCard
            title="Smart Organization"
            description="Nested folders, tags, and bi-directional linking for better structure."
            icon={<Folder className="w-8 h-8 text-yellow-500" />}
            background="bg-yellow-50/50"
            className="h-full"
          />
        </div>

        {/* Card 4: Rich Text Editor — translate(40, -8) scale(1.12) */}
        <div style={{ transform: 'translate(40px, -8px) scale(1.12)', transformOrigin: 'center center' }}>
          <FeatureCard
            title="Rich Text Editor"
            description="A distraction-free editor with markdown support and slash commands."
            icon={<FileText className="w-8 h-8 text-gray-700" />}
            background="bg-gray-50"
            className="h-full"
          />
        </div>

        {/* Card 5: Enterprise Security — translate(115, -8) scale(1.12) */}
        <div style={{ transform: 'translate(115px, -8px) scale(1.12)', transformOrigin: 'center center' }}>
          <FeatureCard
            title="Enterprise Security"
            description="Your data is secure with end-to-end encryption and granular permissions."
            icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
            className="md:col-span-1 bg-green-50/30 h-full"
          />
        </div>

        {/* Card 6: Lightning Fast — translate(200, -8) scale(1.12) */}
        <div style={{ transform: 'translate(200px, -8px) scale(1.12)', transformOrigin: 'center center' }}>
          <FeatureCard
            title="Lightning Fast"
            description="Built on modern tech stack for optimal performance."
            icon={<Zap className="w-8 h-8 text-purple-600" />}
            background="bg-purple-50/30"
            className="h-full"
          />
        </div>
      </div>
    </Section>
  );
};

export default Features;
