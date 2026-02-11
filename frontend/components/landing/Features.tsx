"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  Shield, 
  Search, 
  Layout, 
  Server,
  Smartphone,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  Folder,
  File,
  Hash
} from "lucide-react";

// Mock Components for Visuals
const MockEditor = () => (
  <div className="w-full h-full bg-[#FAFAFA] rounded-xl border border-black/5 p-4 flex gap-4 overflow-hidden relative">
    <div className="w-1/2 space-y-3">
      <div className="h-4 w-3/4 bg-black/10 rounded-full" />
      <div className="h-3 w-full bg-black/5 rounded-full" />
      <div className="h-3 w-5/6 bg-black/5 rounded-full" />
      <div className="h-3 w-4/5 bg-black/5 rounded-full" />
    </div>
    <div className="w-px bg-black/5 h-full" />
    <div className="w-1/2 space-y-3 opacity-60">
      <div className="h-4 w-3/4 bg-black/10 rounded-full" />
      <div className="h-3 w-full bg-black/5 rounded-full" />
      <div className="h-3 w-5/6 bg-black/5 rounded-full" />
    </div>
    {/* Floating Tag */}
    <motion.div 
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="absolute bottom-4 right-4 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded-md font-mono"
    >
      Markdown
    </motion.div>
  </div>
);

const AvatarStack = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex -space-x-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div 
          key={i}
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center text-xs font-bold text-[#1A1A1A]"
          style={{ backgroundColor: ['#FFD93D', '#FF6B6B', '#EAE8DD', '#B2EBF2'][i-1] }}
        >
          {['JD', 'AS', 'MK', '+'][i-1]}
        </motion.div>
      ))}
    </div>
  </div>
);

const BadgeUI = () => (
  <div className="flex flex-col gap-2 justify-center h-full px-4">
    {['Admin', 'Editor', 'Viewer'].map((role, i) => (
      <motion.div 
        key={role}
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="flex items-center justify-between bg-white border border-black/5 p-2 rounded-lg shadow-sm"
      >
        <span className="text-sm font-medium">{role}</span>
        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'}`} />
      </motion.div>
    ))}
  </div>
);

const SearchBarAnim = () => (
  <div className="flex items-center justify-center h-full px-6">
    <div className="w-full bg-white rounded-xl shadow-lg border border-black/5 p-3 flex items-center gap-3">
      <Search className="w-5 h-5 text-[#1A1A1A]/40" />
      <div className="h-4 w-1 bg-[#1A1A1A] animate-pulse" />
      <span className="text-sm text-[#1A1A1A]/40">Search knowledge base...</span>
    </div>
  </div>
);

const FolderTree = () => (
  <div className="h-full bg-white rounded-xl border border-black/5 p-4 flex flex-col gap-3 relative overflow-hidden">
    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
      <Folder className="w-4 h-4 text-[#FFD93D] fill-current" />
      <span>Engineering</span>
    </div>
    <div className="pl-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/70">
        <ChevronRight className="w-3 h-3" />
        <Folder className="w-3 h-3" />
        <span>Backend</span>
      </div>
      <div className="pl-5 flex flex-col gap-2 border-l border-black/5">
        <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/60 px-2 py-1 bg-gray-50 rounded">
          <File className="w-3 h-3" />
          <span>API Docs</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/60 px-2">
          <File className="w-3 h-3" />
          <span>Schema</span>
        </div>
      </div>
    </div>
  </div>
);

const ServerGraph = () => (
  <div className="flex items-end justify-center gap-1 h-3/4 px-6 pb-4">
    {[40, 70, 50, 90, 60, 80].map((h, i) => (
      <motion.div 
        key={i}
        initial={{ height: 0 }}
        whileInView={{ height: `${h}%` }}
        transition={{ delay: i * 0.1, type: "spring" }}
        className="w-full bg-[#1A1A1A] rounded-t-sm opacity-20 hover:opacity-100 transition-opacity"
      />
    ))}
  </div>
);

const features = [
  {
    title: "Rich Note Editor",
    description: "Structured documentation with Markdown support.",
    className: "md:col-span-2 md:row-span-2",
    visual: <MockEditor />,
    icon: FileText
  },
  {
    title: "Team Workspaces",
    description: "Collaborative spaces for your team.",
    className: "md:col-span-1 md:row-span-1",
    visual: <AvatarStack />,
    icon: Users
  },
  {
    title: "Role-Based Access",
    description: "Fine-grained permissions.",
    className: "md:col-span-1 md:row-span-1",
    visual: <BadgeUI />,
    icon: Shield
  },
  {
    title: "Fast Search",
    description: "Find notes quickly with powerful navigation.",
    className: "md:col-span-1 md:row-span-1",
    visual: <SearchBarAnim />,
    icon: Search
  },
  {
    title: "Organization",
    description: "Folders and tags to keep notes organized.",
    className: "md:col-span-1 md:row-span-2",
    visual: <FolderTree />,
    icon: Layout
  },
  {
    title: "Scalable Backend",
    description: "Built for performance and growth.",
    className: "md:col-span-1 md:row-span-1",
    visual: <ServerGraph />,
    icon: Server
  },
];

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.05, duration: 0.5 }}
    whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
    className={`group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-black/5 shadow-sm transition-all duration-300 ${feature.className}`}
  >
    {/* Content */}
    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#1A1A1A] mb-2 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors duration-300">
          <feature.icon className="w-5 h-5" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRightIcon className="w-5 h-5 text-[#1A1A1A]" />
        </div>
      </div>
      
      <h3 className="text-xl font-serif font-bold text-[#1A1A1A] mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-[#1A1A1A]/60 font-medium mb-6">
        {feature.description}
      </p>

      {/* Visual Container */}
      <div className="flex-1 w-full relative min-h-[120px] rounded-xl bg-[#F9F9F9] border border-black/5 overflow-hidden group-hover:border-black/10 transition-colors">
        {feature.visual}
      </div>
    </div>
  </motion.div>
);

const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

const Features = () => {
  return (
    <section id="features" className="py-32 bg-[#F3F0E6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm text-sm font-bold uppercase tracking-wider mb-6"
          >
            Capabilities
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-black text-[#1A1A1A] mb-6"
          >
            Everything you need to <br />
            <span className="italic relative inline-block">
              build knowledge.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF6B6B] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
              </svg>
            </span>
          </motion.h2>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(280px,auto)] gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Roadmap / Coming Soon */}
        <div className="mt-20 border-t border-black/5 pt-10">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="font-serif font-bold text-lg text-[#1A1A1A]">Coming Soon on Roadmap</p>
              <div className="flex flex-wrap justify-center gap-3">
                 {[
                   { icon: Search, text: "Full-text Search" },
                   { icon: Sparkles, text: "AI Summaries" },
                   { icon: Smartphone, text: "Mobile App" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm text-sm font-medium text-[#1A1A1A]/70">
                      <item.icon className="w-4 h-4" />
                      {item.text}
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
