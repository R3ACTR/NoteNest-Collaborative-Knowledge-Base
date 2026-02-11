"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import { useUserRole } from "@/contexts/UserRoleContext";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated } = useUserRole();

  return (
    <main className="min-h-screen bg-[#F3F0E6] selection:bg-[#FF6B6B]/20">
      <Navbar />
      <Hero />
      <Features />
      
      {/* 
        Legacy sections commented out to focus on the new Design Request.
        These will need to be redesigned to match the new Beige/Black aesthetic.
      */}
      
      {/* <section id="features" className="py-20 bg-gray-50">...</section> */}
      {/* <section className="py-20 bg-blue-600 text-white">...</section> */}
      {/* <footer className="bg-gray-900 text-white py-12">...</footer> */}
    </main>
  );
}
