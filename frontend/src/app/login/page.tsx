"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="atelier-auth-layout">
        <div className="atelier-terminal-status-tag">
          <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse" />
          <span>LOADING SESSION...</span>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="atelier-auth-layout">
      {/* Background drafting grid & filament */}
      <div className="atelier-canvas-grid" />
      <div className="atelier-filament-glow" />

      <div className="atelier-auth-plate">
        {/* Header */}
        <div className="atelier-auth-header">
          <Link href="/" className="inline-block">
            <div className="atelier-logo-stamp mx-auto !w-10 !h-10">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 4L4 12V28L20 36L36 28V12L20 4Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 4V36M4 12L36 28M36 12L4 28"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  opacity="0.75"
                />
              </svg>
            </div>
          </Link>
          <h1>Sign In</h1>
          <p>Access your knowledge base and vector search workspace</p>
          <div className="atelier-terminal-status-tag">
            <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)]" />
            <span>SECURE AUTHENTICATION // ONLINE</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="atelier-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="atelier-input-group">
            <label className="atelier-input-label" htmlFor="login-email">
              <span>Email Address</span>
              <span className="text-[10px] text-[var(--color-atelier-brass)]">[ REQUIRED ]</span>
            </label>
            <div className="atelier-input-wrapper">
              <svg
                className="atelier-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
              <input
                id="login-email"
                type="email"
                className="atelier-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="atelier-input-group">
            <label className="atelier-input-label" htmlFor="login-password">
              <span>Password</span>
              <span className="text-[10px] text-[var(--color-terminal-cyan)]">[ SECURE ]</span>
            </label>
            <div className="atelier-input-wrapper">
              <svg
                className="atelier-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="atelier-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="atelier-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="atelier-btn atelier-btn-primary w-full py-3 mt-3 text-xs"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <span>Sign In to Dashboard →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="atelier-auth-footer">
          <span>Don&apos;t have an account?</span>
          <Link href="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}


