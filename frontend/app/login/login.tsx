"use client";

import { useState } from "react";
import Link from "next/link";

const iconClass = "shrink-0";
function MailIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width={20} height={16} x={2} y={4} rx={2} />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function AlertCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx={12} cy={12} r={10} />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
function ArrowRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
function Loader2Icon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === "error@example.com") {
        setErrors({ general: "Invalid email or password. Please try again." });
        setIsSubmitting(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setErrors({ general: "Something went wrong. Please try again later." });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 sm:p-10"
      style={{
        background: "var(--color-background)",
        backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 30%, transparent 70%, rgba(139, 92, 246, 0.08) 100%)",
      }}
    >
      <div className="w-full max-w-[480px]">
        {/* Back to Home */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-medium transition-colors hover:opacity-90"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="no-underline">
            <h1
              className="font-bold text-3xl sm:text-4xl m-0 transition-colors tracking-tight"
              style={{
                background: "linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NoteNest
            </h1>
            <p className="text-base mt-2" style={{ color: "var(--color-text-secondary)" }}>
              Collaborative Knowledge Base for Teams
            </p>
          </Link>
        </div>

        {/* Card */}
        <div
          className="login-card rounded-2xl border p-8 sm:p-10"
          style={{
            background: "var(--color-background)",
            borderColor: "var(--color-border-light)",
            boxShadow: "0 8px 40px -8px rgba(0,0,0,0.12), 0 2px 8px 0 rgba(0,0,0,0.06)",
          }}
        >
          <h2 className="text-2xl font-semibold text-center m-0 mb-2" style={{ color: "var(--color-text-primary)" }}>
            Welcome back
          </h2>
          <p className="text-base text-center mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Sign in to your account to continue
          </p>

          {errors.general && (
            <div
              className="flex items-center gap-3 rounded-xl border p-4 text-base mb-6"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "var(--color-error)",
                color: "var(--color-error)",
              }}
            >
              <AlertCircleIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-base font-medium mb-2.5" style={{ color: "var(--color-text-primary)" }}>
                Email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  placeholder="you@example.com"
                  className="login-input w-full rounded-xl border pl-12 pr-5 py-3.5 text-base outline-none box-border transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-info)]"
                  style={{
                    borderColor: errors.email ? "var(--color-error)" : "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="flex items-center gap-2 mt-2 text-sm" style={{ color: "var(--color-error)" }}>
                  <AlertCircleIcon style={{ width: 16, height: 16 }} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="password" className="text-base font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium hover:opacity-90" style={{ color: "var(--color-info)" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                  placeholder="Enter your password"
                  className="login-input w-full rounded-xl border pl-12 pr-5 py-3.5 text-base outline-none box-border transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-info)]"
                  style={{
                    borderColor: errors.password ? "var(--color-error)" : "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && (
                <p id="password-error" className="flex items-center gap-2 mt-2 text-sm" style={{ color: "var(--color-error)" }}>
                  <AlertCircleIcon style={{ width: 16, height: 16 }} />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-4 px-5 text-base font-medium border-0 flex items-center justify-center gap-2.5 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-info)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, var(--color-info) 0%, #8b5cf6 100%)",
                color: "white",
              }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2Icon style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />Signing in...</>
              ) : (
                <>Sign in<ArrowRightIcon style={{ width: 20, height: 20 }} /></>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "var(--color-border-light)" }} /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text-muted)" }}>or continue with</span></div>
          </div>

          <button
            type="button"
            className="login-google-btn w-full rounded-xl border-2 py-4 px-5 text-base font-medium flex items-center justify-center gap-2.5 transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-info)]"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-base" style={{ color: "var(--color-text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium hover:opacity-90 no-underline" style={{ color: "var(--color-info)" }}>Sign up</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Theme-matched input fields: clear surface in light and dark */
        .login-input {
          border-width: 1px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        @media (prefers-color-scheme: light) {
          .login-input { background: var(--color-gray-50) !important; }
          .login-input::placeholder { color: var(--color-gray-400); }
        }
        @media (prefers-color-scheme: dark) {
          .login-input { background: var(--color-gray-900) !important; }
          .login-input::placeholder { color: var(--color-gray-500); }
        }
        /* Card and Google button: subtle elevation in dark so borders read clearly */
        @media (prefers-color-scheme: dark) {
          .login-card { box-shadow: 0 8px 40px -8px rgba(0,0,0,0.4), 0 2px 8px 0 rgba(0,0,0,0.2); }
          .login-google-btn:hover { background: var(--color-gray-800) !important; border-color: var(--color-border-medium); }
        }
        @media (prefers-color-scheme: light) {
          .login-google-btn:hover { background: var(--color-gray-50) !important; }
        }
      `}</style>
    </div>
  );
}
