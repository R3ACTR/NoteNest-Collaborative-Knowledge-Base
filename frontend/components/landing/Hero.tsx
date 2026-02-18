"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { Section, Container, FloatingCard } from "@/components/ui";
import { COLORS, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <Section
      spacing="large"
      fullWidth
      className="relative overflow-hidden"
      style={{ backgroundColor: COLORS.brand.beige }}
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-yellow/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-brand-accent/10 blur-[100px]" />
      </div>

      {/* Relative wrapper for fixed-height hero layout */}
      <div className="relative min-h-[480px] md:min-h-[560px] lg:h-[700px]">

        {/* Left column: inside Container for centered alignment */}
        <Container className="relative h-full z-10">
          <div className="flex items-center h-full gap-16">
            {/* Left: Text Content */}
            {/* leftX: 20px → pl-5 on desktop */}
            <div className="text-center lg:text-left w-full lg:w-1/2 lg:pl-5">
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
                style={{ color: COLORS.text.primary }}
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
                className="text-lg md:text-xl text-brand-dark/80 mb-10 mx-auto lg:mx-0 leading-relaxed font-medium text-justify max-w-[512px]"
              >
                NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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

              {/* Social proof — socialY: 20px → extra mt-5 on top of existing mt-16 = mt-[84px] */}
              <div className="mt-16 lg:mt-[84px] flex items-center justify-center lg:justify-start gap-4">
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
        <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block perspective-1000">
          {/* Card grid */}
          <div className="absolute inset-0 grid grid-rows-3 grid-cols-2 gap-4 p-4 lg:p-8">

            {/* Card 1: Real-time Collab (Top Right) - Desktop Only */}
            {/* card1Scale: 3 → scale(3) */}
            <div
              className="row-start-1 col-start-2 place-self-center hidden lg:block z-20 lg:scale-[3] origin-center"
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
                {/* card1TextX: 10px */}
                <h3
                  className="text-3xl font-serif font-bold mb-4 leading-none lg:translate-x-[10px]"
                >Real-time<br />Collab</h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">+</button>
                  <button className="w-10 h-10 rounded-full bg-[#EAE8DD] flex items-center justify-center"><ImageIcon className="w-4 h-4 opacity-50" /></button>
                </div>
              </FloatingCard>
            </div>

            {/* Card 2: Syncing (Center) - Tablet & Desktop */}
            {/* card2Scale: 2 → scale(2) */}
            <div
              className="row-start-2 col-span-2 place-self-center z-30 lg:scale-[2] origin-center"
            >
              <FloatingCard
                className="p-0 border-none bg-transparent shadow-none"
                rotate={0}
              >
                {/* card2TextY: -10px */}
                <div
                  className="inline-block px-8 py-4 border-4 border-brand-dark rounded-[2rem_1rem_2rem_0.5rem] font-handwritten font-bold transform -rotate-1 hover:rotate-0 transition-transform cursor-cell bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:-translate-y-[10px]"
                >
                  Syncing...
                </div>
              </FloatingCard>
            </div>

            {/* Card 3: My Notes (Bottom Left) - Tablet & Desktop */}
            {/* card3Scale: 2, width: 358px (changed from 256px) */}
            <div
              className="row-start-3 col-start-1 place-self-center lg:place-self-start z-20 lg:scale-[2] origin-center"
            >
              <FloatingCard
                className="w-[358px] min-h-[200px] bg-[#0F0F0F] text-white py-10 px-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-none"
                rotate={6}
                delay={0.2}
                xOffset={20}
              >
                <div className="flex justify-between items-start mb-6">
                  {/* card3TextX: 20, card3TextY: 20 */}
                  <div className="lg:translate-x-[20px] lg:translate-y-[20px]">
                    <h3 className="text-2xl font-serif mb-1 tracking-tight">My Notes</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">::</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Sub-card 1: Plan for The Day — card3Sub1Y: 50px, textX: 5px */}
                  <div
                    className="bg-brand-accent text-brand-dark p-5 rounded-[1rem] flex flex-col gap-3 lg:translate-y-[50px]"
                  >
                    <div className="lg:translate-x-[5px]">
                      <div className="font-bold text-base leading-snug">Plan for<br />The Day</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold mt-3"><div className="w-4 h-8 rounded-full bg-brand-dark/20 flex items-center justify-center text-[10px]">✓</div> Gym</div>
                    </div>
                  </div>
                  {/* Sub-card 2: Ideas — card3Sub2Y: 50px, textX: 5px */}
                  <div
                    className="bg-brand-yellow text-brand-dark p-5 rounded-[1rem] relative overflow-hidden lg:translate-y-[50px]"
                  >
                    <div className="lg:translate-x-[5px]">
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
  );
};

export default Hero;
