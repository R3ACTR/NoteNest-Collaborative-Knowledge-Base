"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/contexts/UserRoleContext";
import { apiService } from "@/lib/api";

const iconClass = "shrink-0";
function UserIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className ?? iconClass} style={style} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
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

export default function SignupPage() {
  const { login } = useUserRole();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // 1. Register the user
      await apiService.register(email, password, name);
      
      // 2. Automatically log them in
      const loginResponse = await apiService.login(email, password);
      
      localStorage.setItem('token', loginResponse.token);
      login("editor"); // default role, could be pulled from user info or actual backend logic
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup failed:", error);
      setErrors({ general: error.message || "Something went wrong during signup." });
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
            Create an account
          </h2>
          <p className="text-base text-center mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Sign up to get started
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
              <label htmlFor="name" className="block text-base font-medium mb-2.5" style={{ color: "var(--color-text-primary)" }}>
                Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="name"
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                  placeholder="John Doe"
                  className="login-input w-full rounded-xl border pl-12 pr-5 py-3.5 text-base outline-none box-border transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-info)]"
                  style={{
                    borderColor: errors.name ? "var(--color-error)" : "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="flex items-center gap-2 mt-2 text-sm" style={{ color: "var(--color-error)" }}>
                  <AlertCircleIcon style={{ width: 16, height: 16 }} />
                  {errors.name}
                </p>
              )}
            </div>

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
                  className="login-input w-full rounded-xl border pl-12 pr-10 py-3.5 text-base outline-none box-border transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-info)]"
                  style={{
                    borderColor: errors.email ? "var(--color-error)" : "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {email.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setEmail(""); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="Clear email"
                  >
                    <span className="text-slate-400 text-sm font-bold leading-none">✕</span>
                  </button>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="flex items-center gap-2 mt-2 text-sm" style={{ color: "var(--color-error)" }}>
                  <AlertCircleIcon style={{ width: 16, height: 16 }} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-base font-medium mb-2.5" style={{ color: "var(--color-text-primary)" }}>
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                  placeholder="Create a password"
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

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-base font-medium mb-2.5" style={{ color: "var(--color-text-primary)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
                  placeholder="Confirm your password"
                  className="login-input w-full rounded-xl border pl-12 pr-5 py-3.5 text-base outline-none box-border transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-info)]"
                  style={{
                    borderColor: errors.confirmPassword ? "var(--color-error)" : "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                  }}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="flex items-center gap-2 mt-2 text-sm" style={{ color: "var(--color-error)" }}>
                  <AlertCircleIcon style={{ width: 16, height: 16 }} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-4 px-5 text-base font-medium border-0 flex items-center justify-center gap-2.5 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-info)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                color: "white",
              }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2Icon style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />Signing up...</>
              ) : (
                <>Sign up<ArrowRightIcon style={{ width: 20, height: 20 }} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-base" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:opacity-90 no-underline" style={{ color: "var(--color-info)" }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Theme-matched input fields: clear surface in light and dark */
        .login-input {
          border-width: 1px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        @media (prefers-color-scheme: light) {
          .login-input { background: var(--color-gray-50) !important; color: #1f2937 !important; }
          .login-input::placeholder { color: var(--color-gray-400); }
        }
        @media (prefers-color-scheme: dark) {
          .login-input { background: var(--color-gray-900) !important; color: #f9fafb !important; }
          .login-input::placeholder { color: var(--color-gray-500); }
        }
        /* Card: subtle elevation in dark so borders read clearly */
        @media (prefers-color-scheme: dark) {
          .login-card { box-shadow: 0 8px 40px -8px rgba(0,0,0,0.4), 0 2px 8px 0 rgba(0,0,0,0.2); }
        }
      `}</style>
    </div>
  );
}
