"use client";

import { useState } from "react";
import Link from "next/link";
import ErrorState from "@/components/ErrorState";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate error for demonstration
      if (email === "error@example.com") {
        setErrors({ general: "Invalid email or password. Please try again." });
        setIsSubmitting(false);
        return;
      }
      
      // Success - redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({ general: "Something went wrong. Please try again later." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 25%, #faf5ff 50%, #ffffff 75%, #f0f9ff 100%)',
      padding: 'var(--space-md)'
    }}>
      <div 
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h2 
          className="text-2xl font-semibold mb-6"
          style={{
            color: 'var(--color-text-primary)',
            textAlign: 'center'
          }}
        >
          Login
        </h2>

        {errors.general && (
          <ErrorState
            message={errors.general}
            variant="error"
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              placeholder="you@example.com"
              className={`w-full border p-3 rounded-lg transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              style={{
                fontSize: 'var(--font-size-base)'
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <div id="email-error" className="field-error">
                <svg className="field-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label 
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              placeholder="Enter your password"
              className={`w-full border p-3 rounded-lg transition-all duration-200 ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              style={{
                fontSize: 'var(--font-size-base)'
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <div id="password-error" className="field-error">
                <svg className="field-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
            style={{
              fontSize: 'var(--font-size-base)',
              padding: 'var(--space-md)',
              minHeight: '44px'
            }}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p 
          className="mt-4 text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Don't have an account?{" "}
          <Link 
            href="/signup" 
            className="link-nav"
            style={{
              fontSize: 'var(--font-size-sm)',
              padding: '0',
              minHeight: 'auto',
              display: 'inline'
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
