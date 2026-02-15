"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import BestPractices from "@/components/landing/BestPractices";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { useUserRole } from "@/contexts/UserRoleContext";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated } = useUserRole();

  return (
    <main className="min-h-screen bg-gray-50 pt-8 md:pt-16">
      {/* Header */}
      <header className="bg-white shadow-sm animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">NoteNest</h1>
            </div>
            <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
              {!isAuthenticated ? (
                <>
                  <Link href="#features" className="link-nav">Features</Link>
                  <Link href="#pricing" className="link-nav">Pricing</Link>
                  <Link href="/login" className="link-nav">Login</Link>
                  <Link href="/login" className="btn-primary">Get Started</Link>
                </>
              ) : (
                <>
                  <button className="btn-icon" aria-label="Notifications">🔔</button>
                  <Link href="/profile" className="link-nav">Profile</Link>
                  <button className="link-nav">Logout</button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-24 md:py-32 animate-fade-in-up" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="hero-heading" className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Welcome to NoteNest
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Collaborative knowledge base for teams. Capture, organize, and share knowledge seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/dashboard" className="btn-primary">
              Create Your First Note
            </Link>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 animate-fade-in-up" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">Features</h3>
            <p className="text-xl text-gray-600">Everything you need to collaborate effectively</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-white p-6 rounded-lg shadow-sm hover-lift card-enter" role="article">
              <div className="text-4xl mb-4" aria-hidden="true">📝</div>
              <h4 className="text-xl font-semibold mb-2">Collaborative Notes</h4>
              <p className="text-gray-600">Write and edit notes together in real time.</p>
            </article>
            <article className="bg-white p-6 rounded-lg shadow-sm hover-lift card-enter delay-1000" role="article">
              <div className="text-4xl mb-4" aria-hidden="true">📂</div>
              <h4 className="text-xl font-semibold mb-2">Organized Spaces</h4>
              <p className="text-gray-600">Group notes by projects, teams, or topics.</p>
            </article>
            <article className="bg-white p-6 rounded-lg shadow-sm hover-lift card-enter delay-1000" role="article">
              <div className="text-4xl mb-4" aria-hidden="true">🔍</div>
              <h4 className="text-xl font-semibold mb-2">Powerful Search</h4>
              <p className="text-gray-600">Find information quickly across all notes.</p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-blue-600 text-white animate-fade-in-up" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-8">Ready to Get Started?</h3>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">Join teams worldwide using NoteNest</p>
          <Link href="/login" className="btn-secondary">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-1">
              <h4 className="text-xl font-semibold mb-6">NoteNest</h4>
              <p className="text-gray-400 leading-relaxed">Collaborative knowledge base for teams</p>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-lg">Product</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-lg">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-lg">Support</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-sm">&copy; 2024 NoteNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    <main className="min-h-screen bg-[#F3F0E6] selection:bg-[#FF6B6B]/20">
      <Navbar />
      <Hero />
      <Features />
      <SocialProof />
      <BestPractices />
      <FAQ />
      <Footer />
      
      {/* 
        Legacy sections commented out to focus on the new Design Request.
        These will need to be redesigned to match the new Beige/Black aesthetic.
      */}
      
      {/* <section id="features" className="py-20 bg-gray-50">...</section> */}
      {/* <section className="py-20 bg-blue-600 text-gray-200"">...</section> */}
      {/* <footer className="bg-gray-900 text-gray-200" py-12">...</footer> */}
    </main>
  );
}
