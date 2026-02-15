import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import BestPractices from "@/components/landing/BestPractices";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "NoteNest - Collaborative Knowledge Base for Teams",
  description: "NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F0E6]">
      <Navbar />
      <Hero />
      <Features />
      <SocialProof />
      <BestPractices />
      <FAQ />
      <Footer />
    </main>
  );
}
