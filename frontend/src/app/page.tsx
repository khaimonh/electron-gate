"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="nav-logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
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
            <span>Electron Gate</span>
          </div>
          <div className="nav-actions">
            {isLoading ? null : user ? (
              <Link href="/dashboard" className="landing-btn landing-btn-primary">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="landing-btn landing-btn-primary">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-decoration">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Enterprise-Grade Security
          </div>
          <h1 className="hero-title">
            Manage Everything
            <br />
            <span className="hero-gradient-text">In One Place</span>
          </h1>
          <p className="hero-subtitle">
            Electron Gate provides a unified management dashboard for your
            e-commerce operations. Products, orders, inventory, and team — all
            secured with role-based access control.
          </p>
          <div className="hero-buttons">
            {isLoading ? null : user ? (
              <Link
                href="/dashboard"
                className="landing-btn landing-btn-hero"
              >
                Go to Dashboard
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="landing-btn landing-btn-hero"
                >
                  Get Started
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a href="#features" className="landing-btn landing-btn-outline">
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="features-title">Built for Modern Teams</h2>
          <p className="features-subtitle">
            Everything you need to run your e-commerce operation efficiently
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Role-Based Access</h3>
              <p>
                Admin, Staff, and User roles with granular permissions. Every
                team member sees exactly what they need.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73L12 2 4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L12 22l8-4.27A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>Inventory Management</h3>
              <p>
                Track stock levels across locations, manage variants, and get
                low-stock alerts in real-time.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>
                Comprehensive insights into sales, orders, and customer
                behavior. Make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="nav-logo">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
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
            <span>Electron Gate</span>
          </div>
          <p>© 2026 Electron Gate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
