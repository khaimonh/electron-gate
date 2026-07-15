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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 4L4 12V28L20 36L36 28V12L20 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M20 4V36M4 12L36 28M36 12L4 28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              </svg>
            </div>
            <span className="logo-text">Electron Gate</span>
          </div>
          <h1 className="branding-title">
            Welcome back to
            <br />
            <span className="branding-highlight">Electron Gate</span>
          </h1>
          <p className="branding-subtitle">
            Secure access to your management dashboard. Sign in to continue
            managing products, orders, and inventory.
          </p>
          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Role-based access control</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Real-time inventory tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Secure JWT authentication</span>
            </div>
          </div>
        </div>
        <div className="branding-decoration">
          <div className="deco-circle deco-circle-1" />
          <div className="deco-circle deco-circle-2" />
          <div className="deco-circle deco-circle-3" />
        </div>
      </div>

      {/* Right login form panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="login-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="login-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
