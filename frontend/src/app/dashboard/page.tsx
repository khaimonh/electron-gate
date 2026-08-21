"use client";

import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

function AdminPanel() {
  return (
    <div className="atelier-panel">
      <div className="atelier-panel-header">
        <div className="atelier-panel-title-group">
          <div className="atelier-panel-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <div>
            <h2>Administrator Overview</h2>
            <p>Manage vector databases, embedding models, and platform settings</p>
          </div>
        </div>
        <div className="atelier-terminal-status-tag">
          <span className="w-2 h-2 rounded-full bg-[var(--color-restricted-red)]" />
          <span>ROLE: ADMIN (FULL ACCESS)</span>
        </div>
      </div>

      <div className="atelier-stats-grid">
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Total Vectors</span>
            <span className="text-[var(--color-atelier-brass)]">[ 01 ]</span>
          </div>
          <div className="atelier-stat-val">842,910</div>
          <div className="atelier-stat-sub">
            <span>↑ +12.4k this week</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Vector Databases</span>
            <span className="text-[var(--color-atelier-brass)]">[ 02 ]</span>
          </div>
          <div className="atelier-stat-val">12 Active</div>
          <div className="atelier-stat-sub">
            <span>Synced across 3 clusters</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Context Window</span>
            <span className="text-[var(--color-atelier-brass)]">[ 03 ]</span>
          </div>
          <div className="atelier-stat-val">128K</div>
          <div className="atelier-stat-sub">
            <span>text-embedding-3-large</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Avg Search Time</span>
            <span className="text-[var(--color-atelier-brass)]">[ 04 ]</span>
          </div>
          <div className="atelier-stat-val text-[var(--color-terminal-cyan)]">38.4ms</div>
          <div className="atelier-stat-sub">
            <span>Within sub-50ms target</span>
          </div>
        </div>
      </div>

      <div className="font-mono text-xs text-[var(--color-ink-dim)] uppercase tracking-wider font-semibold">
        Administrator Actions
      </div>
      <div className="atelier-actions-grid">
        <Link href="/dashboard/upload" className="atelier-action-btn">
          <UploadCloud className="w-4 h-4 text-[var(--color-atelier-brass)]" />
          <span>Upload Documents</span>
        </Link>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73L12 2 4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L12 22l8-4.27A2 2 0 0021 16z" /></svg>
          <span>Sync Embeddings</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
          <span>Re-rank Settings</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
          <span>Activity Logs</span>
        </button>
      </div>
    </div>
  );
}

function StaffPanel() {
  return (
    <div className="atelier-panel">
      <div className="atelier-panel-header">
        <div className="atelier-panel-title-group">
          <div className="atelier-panel-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h2>Document Ingestion &amp; Management</h2>
            <p>Upload documents, manage text chunking, and review search accuracy</p>
          </div>
        </div>
        <div className="atelier-terminal-status-tag">
          <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)]" />
          <span>ROLE: STAFF (OPERATIONS)</span>
        </div>
      </div>

      <div className="atelier-stats-grid">
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Queued Docs</span>
            <span className="text-[var(--color-atelier-brass)]">[ 01 ]</span>
          </div>
          <div className="atelier-stat-val">24</div>
          <div className="atelier-stat-sub">
            <span>4 PDFs processing</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Processed Chunks</span>
            <span className="text-[var(--color-atelier-brass)]">[ 02 ]</span>
          </div>
          <div className="atelier-stat-val">4,812</div>
          <div className="atelier-stat-sub">
            <span>512 tokens / chunk</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Search Alignment</span>
            <span className="text-[var(--color-atelier-brass)]">[ 03 ]</span>
          </div>
          <div className="atelier-stat-val text-[var(--color-terminal-green)]">0.012</div>
          <div className="atelier-stat-sub">
            <span>High semantic match</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Top-3 Accuracy</span>
            <span className="text-[var(--color-atelier-brass)]">[ 04 ]</span>
          </div>
          <div className="atelier-stat-val text-[var(--color-atelier-brass)]">98.4%</div>
          <div className="atelier-stat-sub">
            <span>bge-reranker score</span>
          </div>
        </div>
      </div>

      <div className="font-mono text-xs text-[var(--color-ink-dim)] uppercase tracking-wider font-semibold">
        Document Operations
      </div>
      <div className="atelier-actions-grid">
        <Link href="/dashboard/upload" className="atelier-action-btn">
          <UploadCloud className="w-4 h-4 text-[var(--color-atelier-brass)]" />
          <span>Upload Documents</span>
        </Link>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
          <span>Review Chunks</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <span>Test Re-ranking</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          <span>Sync Knowledge Base</span>
        </button>
      </div>
    </div>
  );
}

function UserPanel() {
  return (
    <div className="atelier-panel">
      <div className="atelier-panel-header">
        <div className="atelier-panel-title-group">
          <div className="atelier-panel-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h2>Search &amp; Query Workspace</h2>
            <p>Search across documents, explore answers, and save key sources</p>
          </div>
        </div>
        <div className="atelier-terminal-status-tag">
          <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-cyan)]" />
          <span>ROLE: USER (STANDARD ACCESS)</span>
        </div>
      </div>

      <div className="atelier-stats-grid">
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Total Searches</span>
            <span className="text-[var(--color-atelier-brass)]">[ 01 ]</span>
          </div>
          <div className="atelier-stat-val">34</div>
          <div className="atelier-stat-sub">
            <span>All searches completed</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Saved Chunks</span>
            <span className="text-[var(--color-atelier-brass)]">[ 02 ]</span>
          </div>
          <div className="atelier-stat-val">8 Items</div>
          <div className="atelier-stat-sub">
            <span>Saved for quick review</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Average Search Time</span>
            <span className="text-[var(--color-atelier-brass)]">[ 03 ]</span>
          </div>
          <div className="atelier-stat-val text-[var(--color-terminal-green)]">18.2ms</div>
          <div className="atelier-stat-sub">
            <span>Fast hybrid lookup</span>
          </div>
        </div>
        <div className="atelier-stat-card">
          <div className="atelier-stat-header">
            <span>Cache Hit Rate</span>
            <span className="text-[var(--color-atelier-brass)]">[ 04 ]</span>
          </div>
          <div className="atelier-stat-val text-[var(--color-atelier-brass)]">92.6%</div>
          <div className="atelier-stat-sub">
            <span>Cached search results</span>
          </div>
        </div>
      </div>

      <div className="font-mono text-xs text-[var(--color-ink-dim)] uppercase tracking-wider font-semibold">
        Search &amp; Knowledge Actions
      </div>
      <div className="atelier-actions-grid">
        <Link href="/dashboard/upload" className="atelier-action-btn">
          <UploadCloud className="w-4 h-4 text-[var(--color-atelier-brass)]" />
          <span>Upload Document</span>
        </Link>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          <span>New Search</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span>Search History</span>
        </button>
        <button className="atelier-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          <span>Saved Sources</span>
        </button>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const roleLower = (user.role || "user").toLowerCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="atelier-dashboard">
      {/* Background drafting grid & filament */}
      <div className="atelier-canvas-grid" />
      <div className="atelier-filament-glow" />

      {/* Top Apparatus Bar */}
      <header className="atelier-dash-nav">
        <Link href="/" className="atelier-logo">
          <div className="atelier-logo-stamp !w-7 !h-7">
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
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
          <span>Electron Gate · Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/upload"
            className="atelier-btn atelier-btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Link>

          <div className="atelier-user-badge">
            <div className="atelier-avatar">
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--color-ink)]">{user.full_name || user.email}</span>
              <span className={`atelier-role-tag ${roleLower}`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="atelier-btn atelier-btn-secondary !py-1.5 !px-3 text-xs"
            id="logout-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Intelligence Enclave Workspace */}
      <main className="atelier-dash-main relative z-10">
        <div className="atelier-welcome-banner">
          <div>
            <h1>
              Welcome,{" "}
              <span className="text-[var(--color-atelier-brass)]">
                {user.full_name || user.email.split("@")[0]}
              </span>
            </h1>
            <p>
              Signed in with <strong className="text-[var(--color-ink)] uppercase font-mono">{user.role}</strong> permissions.
            </p>
          </div>
          <div className="atelier-terminal-status-tag">
            <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse" />
            <span>SESSION ACTIVE // AVERAGE SEARCH &lt; 40MS</span>
          </div>
        </div>

        {roleLower === "admin" && <AdminPanel />}
        {roleLower === "staff" && <StaffPanel />}
        {roleLower === "user" && <UserPanel />}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
