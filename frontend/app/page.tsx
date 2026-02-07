"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    
    // Handle scroll to show/hide scroll to top button and progress
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setShowScrollTop(scrollTop > 300);
      setScrollProgress(scrollPercent);
      setIsScrolled(scrollTop > 10);
    };
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string, buttonId?: string) => {
    const element = document.getElementById(id);
    if (element) {
      const loadingId = buttonId || `scroll-${id}`;
      setLoadingButtons(prev => new Set(prev).add(loadingId));
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
      // Clear loading after scroll animation (approximately 800ms)
      setTimeout(() => {
        setLoadingButtons(prev => {
          const next = new Set(prev);
          next.delete(loadingId);
          return next;
        });
      }, 800);
    }
  };

  const scrollToTop = () => {
    setLoadingButtons(prev => new Set(prev).add('scroll-top'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setLoadingButtons(prev => {
        const next = new Set(prev);
        next.delete('scroll-top');
        return next;
      });
    }, 800);
  };

  const handleNavigation = (url: string, buttonId: string) => {
    setLoadingButtons(prev => new Set(prev).add(buttonId));
    // Simulate navigation delay (in real app, this would be actual navigation)
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  };

  const isLoading = (buttonId: string) => loadingButtons.has(buttonId);

  return (
    <main 
      className="min-h-screen text-gray-900 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 25%, #faf5ff 50%, #ffffff 75%, #f0f9ff 100%)'
      }}
    >
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#hero" 
        className="skip-to-main"
        onFocus={(e) => {
          e.currentTarget.style.top = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        Skip to main content
      </a>
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 transition-opacity duration-300"
        style={{
          opacity: scrollProgress > 0 ? 1 : 0,
          background: 'linear-gradient(90deg, var(--color-info) 0%, #8b5cf6 100%)',
          transform: `scaleX(${scrollProgress / 100})`,
          transformOrigin: 'left',
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      {/* Enhanced background gradient theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{ 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)'
          }}
        ></div>
      </div>

      {/* Header */}
      <header 
        className="sticky top-0 z-50 transition-all duration-300 border-b"
        style={{ 
          background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          boxShadow: isScrolled 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto w-full"
          style={{ 
            paddingLeft: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingRight: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingTop: 'clamp(var(--space-md), 3vw, var(--space-lg))',
            paddingBottom: 'clamp(var(--space-md), 3vw, var(--space-lg))'
          }}
        >
          <div className="flex items-center justify-between w-full" style={{ alignItems: 'center', width: '100%', gap: 0 }}>
            {/* Logo Section - Left */}
            <Link 
              href="/"
              className="group flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ 
                minWidth: 'fit-content',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <div className="flex flex-col items-start justify-center" style={{ lineHeight: '1.2' }}>
                <h1 
                  className="font-bold tracking-tight transition-all duration-300"
                  style={{ 
                    fontSize: 'clamp(var(--font-size-xl), 4vw, var(--font-size-3xl))',
                    fontWeight: 'var(--font-weight-bold)',
                    background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 50%, var(--color-info) 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s ease infinite',
                    lineHeight: '1.2',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    padding: 0,
                    display: 'block'
                  }}
                >
                  NoteNest
                </h1>
                <p 
                  className="font-medium transition-all duration-200 group-hover:opacity-80 hidden sm:block"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontSize: 'clamp(var(--font-size-xs), 2vw, var(--font-size-sm))',
                    fontWeight: 'var(--font-weight-medium)',
                    marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)',
                    lineHeight: '1.4',
                    margin: 0,
                    padding: 0,
                    display: 'block',
                    whiteSpace: 'nowrap'
                  }}
                >
            Collaborative Knowledge Base for Teams
          </p>
              </div>
            </Link>
            
            {/* Navigation Section - Right */}
            <div className="flex items-center" style={{ gap: 'clamp(var(--space-md), 2vw, var(--space-lg))', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
              <nav 
                className="hidden md:flex items-center"
                style={{ 
                  gap: 'clamp(var(--space-lg), 3vw, var(--space-xl))',
                  alignItems: 'center',
                  height: '100%',
                  flexShrink: 0
                }}
              >
              <button
                onClick={() => scrollToSection('features', 'scroll-features-nav')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('features', 'scroll-features-nav');
                  }
                }}
                disabled={isLoading('scroll-features-nav')}
                aria-busy={isLoading('scroll-features-nav')}
                className={`btn-nav relative group flex items-center justify-center text-underline ${isLoading('scroll-features-nav') ? 'loading' : ''}`}
                style={{ 
                  fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                  whiteSpace: 'nowrap',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Navigate to Features section"
              >
                Features
                <span 
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-4/5 rounded-full"
                  style={{ borderRadius: '2px' }}
                ></span>
              </button>
              <Link 
                href="/login" 
                className="link-nav relative group flex items-center justify-center text-underline"
                style={{ 
                  fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                  whiteSpace: 'nowrap',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Sign In
                <span 
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-4/5 rounded-full"
                  style={{ borderRadius: '2px' }}
                ></span>
              </Link>
              <Link 
                href="/login" 
                className="link-primary button-ripple button-glow magnetic-button group flex items-center justify-center"
                style={{ 
                  fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                  minWidth: '120px',
                  minHeight: '44px',
                  height: '44px'
                }}
              >
                <span className="relative z-10 whitespace-nowrap">Get Started</span>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
                <div 
                  className="absolute inset-0 button-shimmer opacity-0 group-hover:opacity-100"
                ></div>
              </Link>
              </nav>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-icon md:hidden flex-shrink-0 flex items-center justify-center"
                style={{ 
                  height: '44px',
                  width: '44px',
                  flex: '0 0 auto'
                }}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
              <svg 
                className="w-6 h-6 transition-transform duration-300" 
                style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              </button>
            </div>
            
            {/* Mobile Menu */}
            <nav 
              className={`md:hidden border-t transition-all duration-300 overflow-hidden ${
                mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
              style={{ 
                borderColor: 'var(--color-border-light)',
                marginTop: mobileMenuOpen ? 'var(--space-md)' : '0',
                paddingTop: mobileMenuOpen ? 'var(--space-md)' : '0',
                paddingBottom: mobileMenuOpen ? 'var(--space-md)' : '0',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                width: '100%'
              }}
            >
              <div 
                className="flex flex-col"
                style={{ gap: 'clamp(var(--space-sm), 2vw, var(--space-md))' }}
              >
                <button
                  onClick={() => scrollToSection('features', 'scroll-features-mobile')}
                  disabled={isLoading('scroll-features-mobile')}
                  aria-busy={isLoading('scroll-features-mobile')}
                  className={`btn-nav text-left px-4 py-3 ${isLoading('scroll-features-mobile') ? 'loading' : ''}`}
                  style={{ 
                    fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: isLoading('scroll-features-mobile') ? 'wait' : 'pointer'
                  }}
                >
                  Features
                </button>
                <Link 
                  href="/login"
                  className="link-nav px-4 py-3"
                  style={{ 
                    fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/login"
                  className="link-primary text-center"
                  style={{ 
                    fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))',
                    padding: 'clamp(0.75rem, 3vw, 0.875rem) clamp(1rem, 4vw, 1.25rem)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 'var(--space-xs)'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="hero"
        className="relative"
        style={{ 
          paddingTop: 'clamp(var(--space-lg), 4vw, var(--space-xl))',
          paddingBottom: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))'
        }}
      >
        <div 
          className="mx-auto w-full"
          style={{ 
            maxWidth: '1280px',
            paddingLeft: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingRight: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingTop: 'clamp(var(--space-md), 3vw, var(--space-xl))'
          }}
        >
        <div 
          className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <h2 
            className="leading-tight"
            style={{ 
              fontSize: 'clamp(var(--font-size-4xl), 8vw, var(--font-size-5xl))',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: '1.1',
              marginBottom: 'clamp(var(--space-xl), 4vw, var(--space-2xl))',
              maxWidth: '900px',
              width: '100%',
              letterSpacing: '-0.03em',
              textAlign: 'center'
            }}
          >
            <span 
              style={{
                color: 'var(--color-gray-900)',
                display: 'block'
              }}
            >
              Capture, Organize &{" "}
            </span>
            <span 
              className="block"
              style={{
                color: '#8b5cf6',
                marginTop: 'clamp(var(--space-sm), 2vw, var(--space-md))',
                background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 50%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Share Knowledge
          </span>
        </h2>

          <p 
            className="leading-relaxed"
            style={{ 
              color: '#374151',
              fontSize: 'clamp(var(--font-size-lg), 2.5vw, var(--font-size-xl))',
              lineHeight: '1.7',
              maxWidth: '768px',
              width: '100%',
              marginBottom: 'clamp(var(--space-2xl), 5vw, var(--space-3xl))',
              fontWeight: 'var(--font-weight-medium)',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
          NoteNest helps teams document ideas, decisions, and learnings
            in a shared, searchable space. Build your team's collective intelligence.
          </p>

          <div 
            className="flex flex-col sm:flex-row items-center justify-center"
            style={{ 
              gap: 'clamp(var(--space-md), 3vw, var(--space-lg))',
              width: '100%',
              maxWidth: '600px'
            }}
          >
        <button
          onClick={() => handleNavigation('/login', 'create-note')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigation('/login', 'create-note');
            }
          }}
          disabled={isLoading('create-note')}
          aria-busy={isLoading('create-note')}
          className={`btn-primary button-ripple button-glow magnetic-button group flex items-center justify-center gap-2 ${isLoading('create-note') ? 'loading' : ''}`}
          style={{ 
            fontSize: 'clamp(var(--font-size-base), 2vw, var(--font-size-lg))',
            padding: 'clamp(0.875rem, 2.5vw, 1rem) clamp(1.75rem, 5vw, 2rem)',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
            opacity: isLoading('create-note') ? 0.75 : 1,
            minHeight: '48px',
            minWidth: 'clamp(200px, 40vw, 240px)',
            width: '100%',
            maxWidth: '280px',
            cursor: isLoading('create-note') ? 'wait' : 'pointer'
          }}
          aria-label={isLoading('create-note') ? 'Loading...' : 'Create your first note'}
        >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                <span className="whitespace-nowrap">Create Your First Note</span>
                <span className="text-xs sm:text-sm font-normal" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>(Coming Soon)</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
             <button 
               onClick={() => scrollToSection('features')}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   scrollToSection('features');
                 }
               }}
               disabled={isLoading('scroll-features')}
               aria-busy={isLoading('scroll-features')}
               className={`group relative rounded-xl font-semibold transition-all duration-300 focus:outline-none overflow-hidden flex items-center justify-center gap-2 button-ripple hover-lift magnetic-button ${isLoading('scroll-features') ? 'loading' : ''}`}
               aria-label={isLoading('scroll-features') ? 'Loading...' : 'Learn more about features'}
              onFocus={(e) => {
                e.currentTarget.style.background = 'var(--color-info)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.color = 'var(--color-info)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)';
              }}
              style={{ 
                border: '2px solid var(--color-info)',
                color: 'var(--color-info)',
                fontSize: 'clamp(var(--font-size-base), 2vw, var(--font-size-lg))',
                fontWeight: 'var(--font-weight-semibold)',
                padding: 'clamp(0.875rem, 2.5vw, 1rem) clamp(1.75rem, 5vw, 2rem)',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                minHeight: '48px',
                minWidth: 'clamp(200px, 40vw, 240px)',
                width: '100%',
                maxWidth: '280px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-info)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-info)';
                e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.color = 'var(--color-info)';
                e.currentTarget.style.borderColor = 'var(--color-info)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(59, 130, 246, 0.2)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)';
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Learn More
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5 icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
          </div>
          
          {/* Stats or Trust Indicators */}
          <div 
            className="flex flex-wrap items-center justify-center"
            style={{ 
              gap: 'clamp(var(--space-lg), 4vw, var(--space-xl))',
              marginTop: 'clamp(3rem, 8vw, 5rem)',
              width: '100%',
              maxWidth: '600px'
            }}
          >
            <div 
              className="flex items-center gap-2.5 sm:gap-3 rounded-lg transition-all duration-200 cursor-default"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                padding: 'clamp(0.625rem, 2.5vw, 0.875rem) clamp(1rem, 4vw, 1.5rem)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                minHeight: '40px'
              }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm flex-shrink-0"
                style={{
                  boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.1)'
                }}
              ></div>
              <span 
                className="text-sm font-semibold whitespace-nowrap"
                style={{ 
                  color: '#1f2937',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'clamp(var(--font-size-xs), 2vw, var(--font-size-sm))'
                }}
              >
                Trusted by teams worldwide
              </span>
            </div>
            <div 
              className="flex items-center gap-2.5 sm:gap-3 rounded-lg transition-all duration-200 cursor-default"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                padding: 'clamp(0.625rem, 2.5vw, 0.875rem) clamp(1rem, 4vw, 1.5rem)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                minHeight: '40px'
              }}
            >
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                style={{ color: 'var(--color-info)' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span 
                className="text-sm font-semibold whitespace-nowrap"
                style={{ 
                  color: '#1f2937',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'clamp(var(--font-size-xs), 2vw, var(--font-size-sm))'
                }}
              >
                Enterprise-grade security
              </span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        className="relative scroll-mt-20 overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 25%, rgba(240, 249, 255, 0.92) 50%, rgba(250, 245, 255, 0.95) 75%, rgba(255, 255, 255, 0.98) 100%)',
          paddingTop: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))',
          paddingBottom: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))',
          borderTop: '1px solid var(--color-border-light)',
          borderBottom: '1px solid var(--color-border-light)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
            }}
          ></div>
        </div>

        <div 
          className="mx-auto relative z-10 w-full"
          style={{ 
            maxWidth: '1280px',
            paddingLeft: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingRight: 'clamp(var(--space-md), 4vw, var(--space-xl))'
          }}
        >
          <div 
            className={`transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ 
              marginBottom: 'var(--space-3xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div 
              style={{ 
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginBottom: 'var(--space-xl)'
              }}
            >
              <h3 
                className="rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontSize: 'clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl))',
                  fontWeight: 'var(--font-weight-bold)',
                  paddingTop: 'var(--space-lg)',
                  paddingBottom: 'var(--space-lg)',
                  paddingLeft: 'clamp(var(--space-lg), 5vw, var(--space-2xl))',
                  paddingRight: 'clamp(var(--space-lg), 5vw, var(--space-2xl))',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  display: 'inline-block',
                  width: 'auto',
                  maxWidth: '100%',
                  textAlign: 'center',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(59, 130, 246, 0.5), 0 6px 10px -2px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)';
                }}
              >
                <span className="relative z-10 inline-block">What NoteNest Enables</span>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                ></div>
          </h3>
            </div>
            <p 
              className="font-medium"
              style={{ 
                color: '#4b5563',
                fontSize: 'clamp(var(--font-size-lg), 2vw, var(--font-size-xl))',
                maxWidth: '720px',
                lineHeight: '1.7',
                marginTop: 0,
                fontWeight: 'var(--font-weight-medium)',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Everything you need to build and share knowledge with your team
            </p>
          </div>

          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
            style={{ gap: 'clamp(var(--space-lg), 4vw, var(--space-2xl))' }}
          >
            <Feature
              icon="📝"
              title="Collaborative Notes"
              text="Write and edit notes together in real time. See changes as they happen and never lose context."
              delay="300"
              mounted={mounted}
            />
            <Feature
              icon="📂"
              title="Organized Spaces"
              text="Group notes by projects, teams, or topics. Keep everything organized and easy to find."
              delay="400"
              mounted={mounted}
            />
            <Feature
              icon="🔍"
              title="Powerful Search"
              text="Quickly find information when you need it. Search across all your notes instantly."
              delay="500"
              mounted={mounted}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        id="benefits"
        className="relative overflow-hidden"
        style={{ 
          paddingTop: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))',
          paddingBottom: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))',
          background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(250, 245, 255, 0.8) 50%, rgba(255, 255, 255, 0.9) 75%, rgba(240, 249, 255, 0.7) 100%)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ 
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
            }}
          ></div>
        </div>

        <div 
          className="mx-auto relative z-10 w-full"
          style={{ 
            maxWidth: '1280px',
            paddingLeft: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingRight: 'clamp(var(--space-md), 4vw, var(--space-xl))'
          }}
        >
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center"
            style={{ gap: 'clamp(var(--space-xl), 5vw, var(--space-3xl))' }}
          >
            <div className={`w-full max-w-lg text-center lg:text-left transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="inline-block mb-6">
                <span 
                  className="inline-flex items-center text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                    color: 'var(--color-info)',
                    fontSize: 'var(--font-size-xs)',
                    letterSpacing: '0.12em',
                    border: '1.5px solid rgba(59, 130, 246, 0.25)',
                    boxShadow: '0 2px 8px -2px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.18) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                    e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
                    e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Built for Everyone
                </span>
              </div>
              <h3 
                className="mb-6"
                style={{ 
                  fontSize: 'clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl))',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: '1.15',
                  letterSpacing: '-0.025em',
                  marginBottom: 'var(--space-xl)'
                }}
              >
                <span style={{ color: '#1f2937' }}>
                  Built for{" "}
                </span>
                <span 
                  className="inline-block"
                  style={{ 
                    color: '#8b5cf6',
                    background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 50%, var(--color-info) 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                >
                  Modern Teams
                </span>
              </h3>
              <p 
                className="leading-relaxed mb-8"
                style={{ 
                  color: '#374151',
                  fontSize: 'clamp(var(--font-size-lg), 2vw, var(--font-size-xl))',
                  lineHeight: '1.75',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--space-2xl)',
                  letterSpacing: '-0.01em'
                }}
              >
                NoteNest combines the best of documentation tools with real-time collaboration. 
                Whether you're a startup or an <strong style={{ color: '#1f2937' }}>enterprise</strong>, we've got you covered.
              </p>
              <ul 
                style={{ gap: 'var(--space-lg)' }} 
                className="flex flex-col"
              >
                <li 
                  className="group flex items-start transition-all duration-300 hover:translate-x-2"
                  style={{ gap: 'var(--space-lg)' }}
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                      border: '2px solid var(--color-success)'
                    }}
                  >
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✓
                    </span>
                  </div>
                  <span 
                    className="text-lg font-semibold pt-1.5 transition-colors duration-300 group-hover:text-gray-900"
                    style={{ 
                      color: '#1f2937',
                      lineHeight: '1.6',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Real-time collaboration with live cursors
                  </span>
                </li>
                <li 
                  className="group flex items-start transition-all duration-300 hover:translate-x-2"
                  style={{ gap: 'var(--space-lg)' }}
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                      border: '2px solid var(--color-success)'
                    }}
                  >
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✓
                    </span>
                  </div>
                  <span 
                    className="text-lg font-semibold pt-1.5 transition-colors duration-300 group-hover:text-gray-900"
                    style={{ 
                      color: '#1f2937',
                      lineHeight: '1.6',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Rich text editing with markdown support
                  </span>
                </li>
                <li 
                  className="group flex items-start transition-all duration-300 hover:translate-x-2"
                  style={{ gap: 'var(--space-lg)' }}
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                      border: '2px solid var(--color-success)'
                    }}
                  >
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✓
                    </span>
                  </div>
                  <span 
                    className="text-lg font-semibold pt-1.5 transition-colors duration-300 group-hover:text-gray-900"
                    style={{ 
                      color: '#1f2937',
                      lineHeight: '1.6',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Version history and change tracking
                  </span>
                </li>
              </ul>
            </div>
            <div className={`relative w-full max-w-lg mx-auto lg:mx-0 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}`}>
              <div 
                className="rounded-2xl relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: 'clamp(var(--space-lg), 4vw, var(--space-2xl))',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.03)'
                }}
              >
                {/* Stats Grid */}
                <div 
                  className="grid grid-cols-2"
                  style={{ gap: 'clamp(var(--space-md), 3vw, var(--space-xl))' }}
                >
                  <StatCard
                    number="10K+"
                    label="Active Teams"
                    icon="👥"
                    delay="0"
                    mounted={mounted}
                  />
                  <StatCard
                    number="50K+"
                    label="Notes Created"
                    icon="📝"
                    delay="100"
                    mounted={mounted}
                  />
                  <StatCard
                    number="99.9%"
                    label="Uptime"
                    icon="⚡"
                    delay="200"
                    mounted={mounted}
                  />
                  <StatCard
                    number="24/7"
                    label="Support"
                    icon="💬"
                    delay="300"
                    mounted={mounted}
                  />
                </div>
                
                {/* Additional Info */}
                <div 
                  className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center"
                  style={{ 
                    borderColor: 'rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <p 
                    className="text-xs sm:text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Trusted by teams at
                  </p>
                  <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6b7280' }}>TechCorp</div>
                    <div className="w-1 h-1 rounded-full hidden sm:block" style={{ background: '#9ca3af' }}></div>
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6b7280' }}>StartupXYZ</div>
                    <div className="w-1 h-1 rounded-full hidden sm:block" style={{ background: '#9ca3af' }}></div>
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6b7280' }}>DevTeam</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta"
        className="relative overflow-hidden"
          style={{ 
            paddingTop: 'clamp(3rem, 8vw, 6rem)',
            paddingBottom: 'clamp(3rem, 8vw, 6rem)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.03) 25%, rgba(139, 92, 246, 0.04) 50%, rgba(99, 102, 241, 0.03) 75%, rgba(59, 130, 246, 0.04) 100%)',
            borderTop: '1px solid var(--color-border-light)',
            borderBottom: '1px solid var(--color-border-light)',
            position: 'relative'
          }}
      >
        {/* Decorative background elements */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)'
          }}
        />
        
        <div 
          className="mx-auto w-full relative z-10"
          style={{ 
            maxWidth: '1280px',
            paddingLeft: 'var(--space-xl)',
            paddingRight: 'var(--space-xl)',
            paddingTop: 'var(--space-lg)',
            paddingBottom: 'var(--space-lg)'
          }}
        >
          <div 
            className={`flex flex-col items-center justify-center text-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ width: '100%' }}
          >
            <h3 
              className="mb-6"
              style={{ 
                color: '#0f172a',
                fontSize: 'clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl))',
                fontWeight: '800',
                lineHeight: '1.15',
                letterSpacing: '-0.025em',
                marginBottom: 'var(--space-xl)',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                width: '100%',
                textAlign: 'center'
              }}
            >
              Ready to Get Started?
            </h3>
            <p 
              className="mb-10"
              style={{ 
                color: '#4b5563',
                fontSize: 'clamp(var(--font-size-lg), 2.5vw, var(--font-size-xl))',
                maxWidth: '720px',
                lineHeight: '1.75',
                fontWeight: 'var(--font-weight-medium)',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: 'var(--space-3xl)',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Join teams worldwide who are already using NoteNest to build their collective intelligence.
            </p>
            <div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4"
              style={{ 
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '100%'
              }}
            >
              <Link 
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/login', 'get-started-cta');
                }}
                aria-busy={isLoading('get-started-cta')}
                className={`link-primary button-ripple button-glow magnetic-button group text-center flex items-center justify-center w-full sm:w-auto ${isLoading('get-started-cta') ? 'loading' : ''}`}
                style={{ 
                  fontSize: 'clamp(var(--font-size-base), 2vw, var(--font-size-lg))',
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
                  minWidth: 'clamp(180px, 30vw, 220px)',
                  minHeight: '44px',
                  flex: '1 1 auto',
                  cursor: isLoading('get-started-cta') ? 'wait' : 'pointer',
                  opacity: isLoading('get-started-cta') ? 0.75 : 1
                }}
              >
                <span className="relative z-10">Get Started for Free</span>
                <div className="absolute inset-0 button-shimmer opacity-0 group-hover:opacity-100"></div>
              </Link>
              <button
                onClick={() => scrollToSection('features', 'scroll-features-cta')}
                disabled={isLoading('scroll-features-cta')}
                aria-busy={isLoading('scroll-features-cta')}
                className={`btn-secondary button-ripple magnetic-button text-center flex items-center justify-center w-full sm:w-auto ${isLoading('scroll-features-cta') ? 'loading' : ''}`}
                style={{ 
                  fontSize: 'clamp(var(--font-size-base), 2vw, var(--font-size-lg))',
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  minWidth: 'clamp(180px, 30vw, 220px)',
                  minHeight: '44px',
                  flex: '1 1 auto',
                  cursor: isLoading('scroll-features-cta') ? 'wait' : 'pointer',
                  opacity: isLoading('scroll-features-cta') ? 0.75 : 1
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer 
        id="footer"
        className="relative border-t"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-gray-900) 0%, #1a1a2e 100%)',
          borderColor: 'var(--color-gray-700)',
          color: 'var(--color-gray-300)',
          marginTop: 'var(--space-3xl)',
          borderTopWidth: '2px'
        }}
      >
        <div 
          className="mx-auto w-full"
          style={{ 
            maxWidth: '1280px',
            paddingLeft: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingRight: 'clamp(var(--space-md), 4vw, var(--space-xl))',
            paddingTop: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))',
            paddingBottom: 'clamp(var(--space-2xl), 6vw, var(--space-3xl))'
          }}
        >
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ 
              gap: 'clamp(var(--space-lg), 4vw, var(--space-xl))',
              marginBottom: 'clamp(var(--space-xl), 4vw, var(--space-2xl))'
            }}
          >
            <div>
              <h4 
                className="font-bold"
                style={{ 
                  color: 'var(--color-gray-50)', 
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: 'var(--space-md)'
                }}
              >
                NoteNest
              </h4>
              <p 
                className="text-sm"
                style={{ 
                  color: 'var(--color-gray-400)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}
              >
                Collaborative knowledge base for modern teams
              </p>
            </div>
            <div>
              <h5 
                className="font-semibold"
                style={{ 
                  color: 'var(--color-gray-50)',
                  marginBottom: 'var(--space-md)'
                }}
              >
                Product
              </h5>
              <ul 
                className="text-sm flex flex-col"
                style={{ 
                  color: 'var(--color-gray-400)',
                  gap: 'var(--space-sm)'
                }}
              >
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Features</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Pricing</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h5 
                className="font-semibold"
                style={{ 
                  color: 'var(--color-gray-50)',
                  marginBottom: 'var(--space-md)'
                }}
              >
                Company
              </h5>
              <ul 
                className="text-sm flex flex-col"
                style={{ 
                  color: 'var(--color-gray-400)',
                  gap: 'var(--space-sm)'
                }}
              >
                <li><Link href="#" className="hover:opacity-70 transition-opacity">About</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Blog</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h5 
                className="font-semibold"
                style={{ 
                  color: 'var(--color-gray-50)',
                  marginBottom: 'var(--space-md)'
                }}
              >
                Resources
              </h5>
              <ul 
                className="text-sm flex flex-col"
                style={{ 
                  color: 'var(--color-gray-400)',
                  gap: 'var(--space-sm)'
                }}
              >
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Documentation</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Support</Link></li>
                <li><Link href="#" className="hover:opacity-70 transition-opacity">Community</Link></li>
              </ul>
            </div>
          </div>
          <div 
            className="border-t flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ 
              borderColor: 'var(--color-gray-700)',
              paddingTop: 'clamp(var(--space-lg), 4vw, var(--space-xl))'
            }}
          >
            <div className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
              <span className="font-bold" style={{ color: 'var(--color-gray-50)' }}>NoteNest</span> • Open Source Quest Project
            </div>
            <div className="text-xs" style={{ color: 'var(--color-gray-500)' }}>
              Built with Next.js and Tailwind CSS
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
         <button
           onClick={scrollToTop}
           disabled={isLoading('scroll-top')}
           aria-busy={isLoading('scroll-top')}
           className={`fixed rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 group button-ripple button-glow cta-pulse ${isLoading('scroll-top') ? 'loading' : ''}`}
          style={{
            background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 100%)',
            color: 'white',
            padding: 'clamp(0.75rem, 2vw, 1rem)',
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            bottom: 'clamp(1rem, 4vw, 2rem)',
            right: 'clamp(1rem, 4vw, 2rem)',
            zIndex: 9999,
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Scroll to top"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(59, 130, 246, 0.6), 0 6px 10px -2px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.9) translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(59, 130, 246, 0.4), 0 2px 4px -1px rgba(59, 130, 246, 0.3)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(59, 130, 246, 0.6), 0 6px 10px -2px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.4)';
          }}
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-y-1 icon-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </main>
  );
}

function Feature({ 
  icon, 
  title, 
  text, 
  delay, 
  mounted 
}: { 
  icon: string; 
  title: string; 
  text: string; 
  delay: string;
  mounted: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`group relative rounded-2xl transition-all duration-300 overflow-hidden card-enter ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        background: isHovered 
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isHovered ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: isHovered 
          ? '0 4px 12px -4px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        padding: 'clamp(var(--space-lg), 4vw, var(--space-2xl))',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={title}
    >
      {/* Enhanced gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(59, 130, 246, 0.05) 100%)',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>
      
      {/* Shine effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(-100%)';
        }}
      ></div>
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>

      <div className="relative z-10">
        {/* Icon container with enhanced styling */}
        <div 
          className="relative inline-block mb-6"
        >
          <div 
            className="transform transition-all duration-500 rounded-2xl p-4"
            style={{ 
              fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
              transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
              background: isHovered 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                : 'transparent',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: 'clamp(0.75rem, 2vw, 1rem)'
            }}
          >
            {icon}
    </div>
        </div>
        
        <h4 
          className="font-bold transition-all duration-300 mb-4"
          style={{ 
            color: isHovered 
              ? '#2563eb' 
              : '#111827',
            fontSize: 'clamp(var(--font-size-xl), 3vw, var(--font-size-2xl))',
            fontWeight: 'var(--font-weight-bold)',
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
            lineHeight: '1.3',
            letterSpacing: '-0.015em',
            marginBottom: 'var(--space-lg)'
          }}
        >
          {title}
        </h4>
        <div className="relative">
          <p 
            className="leading-relaxed transition-colors duration-300"
            style={{ 
              color: isHovered ? '#374151' : '#4b5563',
              fontSize: 'clamp(var(--font-size-base), 1.5vw, var(--font-size-lg))',
              lineHeight: '1.7',
              letterSpacing: '-0.01em',
              paddingRight: '2rem',
              marginBottom: 0
            }}
          >
            {text}
          </p>
          
          {/* Decorative arrow on hover - positioned at end of text */}
          <div 
            className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 inline-flex items-center icon-bounce"
            style={{ 
              color: 'var(--color-info)',
              transform: 'translateX(-4px)',
              marginLeft: '0.5rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({ 
  number, 
  label, 
  icon, 
  delay, 
  mounted 
}: { 
  number: string; 
  label: string; 
  icon: string;
  delay: string;
  mounted: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative text-center transition-all duration-300 overflow-hidden card-enter ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ 
          transitionDelay: `${delay}ms`,
          padding: 'clamp(var(--space-md), 3vw, var(--space-lg))',
          background: isHovered
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--space-md)',
          border: `1px solid ${isHovered ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          boxShadow: isHovered
          ? '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
          transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default'
        }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${number} ${label}`}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(59, 130, 246, 0.05) 100%)',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-md"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      ></div>
      
      <div className="relative z-10">
        <div 
          className="text-4xl mb-2 transition-transform duration-300 icon-bounce"
          style={{
            transform: isHovered ? 'scale(1.2) rotate(8deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-block'
          }}
        >
          {icon}
        </div>
        <div 
          className="font-bold mb-1 transition-all duration-300"
          style={{ 
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            background: 'linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transform: isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1) translateY(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-block'
          }}
        >
          {number}
        </div>
        <div 
          className="text-sm font-medium transition-all duration-300"
          style={{ 
            color: isHovered ? 'var(--color-info)' : 'var(--color-text-secondary)',
            transform: isHovered ? 'translateY(-1px) scale(1.05)' : 'translateY(0) scale(1)',
            fontWeight: isHovered ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

