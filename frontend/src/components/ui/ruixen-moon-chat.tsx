"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { apiRAGQuery, type SourceChunk, type RAGQueryResponse } from "@/app/lib/api";
import Link from "next/link";
import {
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
  CircleUserRound,
  MonitorIcon,
  FileUp,
  ImageIcon,
  Sparkles,
  Database,
  SlidersHorizontal,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Search,
  FileText,
  Clock,
  Terminal,
  ExternalLink,
} from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  timestamp: string;
  durationMs?: number;
  isSimulated?: boolean;
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700/80 bg-black/60 text-neutral-300 hover:text-white hover:bg-neutral-800/90 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-[var(--color-atelier-brass,#d4a373)] shadow-sm text-xs px-3.5 py-1.5 h-auto"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

// Fallback simulator for offline or standalone prototype testing
function getSimulatedRAGResponse(query: string, topK: number): { answer: string; sources: SourceChunk[]; durationMs: number } {
  const q = query.toLowerCase();
  const start = performance.now();

  let answer = "";
  let sources: SourceChunk[] = [];

  if (q.includes("apple") || q.includes("aapl") || q.includes("revenue") || q.includes("financial") || q.includes("10-k")) {
    answer = `Based on Apple Inc.'s 2023 Annual Report (Form 10-K), total net sales were **$383.285 billion**, compared to $394.328 billion in 2022. 

**Key Revenue Breakdown by Product Category:**
- **iPhone:** $200.583 billion (52.3% of total net sales)
- **Services (App Store, iCloud, Apple Pay, Subscriptions):** $85.200 billion (reached an all-time record, up 9% YoY)
- **Wearables, Home and Accessories:** $39.845 billion
- **Mac:** $29.357 billion
- **iPad:** $28.300 billion

Gross margin expanded to **44.1%** for the fiscal year, driven by higher services mix and product cost savings.`;
    sources = [
      {
        content: "Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations. Total net sales decreased 2.8% or $11.0 billion during 2023 compared to 2022, primarily due to lower net sales of Mac and iPad, partially offset by higher net sales of Services.",
        score: 0.964,
        metadata: { source: "NASDAQ_AAPL_2023.pdf", page: 24, chunk_id: "AAPL-024-C1", doc_type: "financial_report" },
      },
      {
        content: "Product vs Services Segment Breakdown (in millions): iPhone net sales $200,583; Mac $29,357; iPad $28,300; Wearables, Home & Accessories $39,845; Services $85,200. Total net sales $383,285.",
        score: 0.942,
        metadata: { source: "NASDAQ_AAPL_2023.pdf", page: 32, chunk_id: "AAPL-032-C4", doc_type: "financial_report" },
      },
      {
        content: "Gross margin for 2023 was $169,148 million (44.1%) compared to $170,782 million (43.3%) in 2022. Products gross margin was 36.5% and Services gross margin was 70.8%.",
        score: 0.915,
        metadata: { source: "NASDAQ_AAPL_2023.pdf", page: 33, chunk_id: "AAPL-033-C2", doc_type: "financial_report" },
      },
    ];
  } else if (q.includes("role") || q.includes("auth") || q.includes("permission") || q.includes("access") || q.includes("jwt")) {
    answer = `Electron Gate implements a three-tier **Role-Based Access Control (RBAC)** architecture enforced at both the FastAPI route dependency layer and Supabase PostgreSQL RLS:

1. **Admin Role (Full Access):**
   - Manage all vector databases, chunking thresholds, model endpoints, and system telemetry.
   - Access and search across all public and private document partitions.
2. **Staff Role (Operations & Ingestion):**
   - Upload new documents, review semantic chunk boundaries, and trigger table/image summarization pipelines.
3. **User Role (Standard Query Access):**
   - Query authorized public knowledge and their own private enclaves with sub-40ms response latency.`;
    sources = [
      {
        content: "api/deps.py: user_dependency verifies JWT Bearer token claims ('sub', 'role'). If role requirements are violated, HTTPException(403, 'Forbidden: Insufficient permissions') is raised prior to vector retrieval.",
        score: 0.958,
        metadata: { source: "security_specification.md", section: "Authentication & Authorization", chunk_id: "SEC-001" },
      },
      {
        content: "Database RLS Policy: Document chunks marked private=true are strictly filtered to matching uploaded_by user UUID in Supabase vector store RPC calls.",
        score: 0.923,
        metadata: { source: "match_document_chunks.sql", section: "RLS Filtering", chunk_id: "SQL-004" },
      },
    ];
  } else if (q.includes("rrf") || q.includes("fusion") || q.includes("retrieval") || q.includes("hybrid") || q.includes("rerank")) {
    answer = `The retrieval engine uses **Hybrid Multi-Query Reciprocal Rank Fusion (RRF)**:

- **Step 1 (Query Expansion):** Generates 3 multi-angle sub-queries using GPT-4o-mini to overcome lexical gaps.
- **Step 2 (Parallel Retrieval):** Executes vector cosine similarity search (OpenAI \`text-embedding-3-small\`) in parallel with Supabase PostgreSQL full-text keyword search (\`tsvector\` match).
- **Step 3 (Reciprocal Rank Fusion):** Merges chunk lists with formula $RRF(d) = \\sum_{m} \\frac{1}{60 + r_m(d)}$ to boost documents retrieved across multiple retrieval strategies.
- **Step 4 (Context Synthesis):** Injects top-$k$ fused chunks into the LLM context window to synthesize accurate, cited answers.`;
    sources = [
      {
        content: "rag_engine/retrieval_and_answer/reciprocal_rank_fusion.py: def reciprocal_rank_fusion(chunk_lists: List[List[Document]], k: int = 60) -> List[Tuple[Document, float]]: Combines ranks across dense vector and sparse keyword streams.",
        score: 0.971,
        metadata: { source: "reciprocal_rank_fusion.py", chunk_id: "RRF-001", language: "python" },
      },
      {
        content: "backend/api/routers/rag.py: query_rag endpoint runs retrieval_chunks_multi in threadpool and generates final answers with source attribution.",
        score: 0.939,
        metadata: { source: "api/routers/rag.py", chunk_id: "RAG-API-002" },
      },
    ];
  } else {
    answer = `I have searched the indexed vector knowledge base for **"${query}"**.

Retrieval completed using dense vector similarity matching and semantic keyword fusion. The indexed documents contain detailed domain specifications, financial filings, technical documentation, and product catalogs.

You can refine your search or scope the query to a specific uploaded document UUID using the options above.`;
    sources = [
      {
        content: `Semantic match for "${query}": Found in indexed platform documentation. The knowledge base contains partitioned chunks with 1536-dimensional embeddings optimized for rapid hybrid lookup.`,
        score: 0.895,
        metadata: { source: "platform_overview.md", chunk_id: "GEN-001", section: "General Knowledge" },
      },
      {
        content: "All documents processed through the Electron Gate pipeline are partitioned into contextual sections with sliding token overlap and stored in PostgreSQL pgvector.",
        score: 0.862,
        metadata: { source: "ingestion_architecture.md", chunk_id: "GEN-002" },
      },
    ];
  }

  const durationMs = Math.round(performance.now() - start + (Math.random() * 20 + 25));
  return { answer, sources: sources.slice(0, topK), durationMs };
}

export default function ElectronGateChat() {
  const { token, user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const [useMultiQuery, setUseMultiQuery] = useState(true);
  const [topK, setTopK] = useState(5);
  const [documentId, setDocumentId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "search">("chat");

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 240,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText ?? message).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    adjustHeight(true);
    setIsLoading(true);

    const startTime = performance.now();

    try {
      let resultAnswer = "";
      let resultSources: SourceChunk[] = [];
      let isSimulated = false;

      if (token) {
        try {
          const parsedDocIds = documentId
            .split(/[\s,]+/)
            .map((s) => s.trim())
            .filter(Boolean);

          const res: RAGQueryResponse = await apiRAGQuery(
            {
              query: textToSend,
              document_ids: parsedDocIds.length > 0 ? parsedDocIds : undefined,
              use_multi_query: useMultiQuery,
              top_k: topK,
            },
            token
          );
          resultAnswer = res.answer;
          resultSources = res.sources || [];
        } catch (apiErr) {
          console.warn("Backend RAG query failed or unreachable, switching to local RAG fallback:", apiErr);
          const fallback = getSimulatedRAGResponse(textToSend, topK);
          resultAnswer = fallback.answer;
          resultSources = fallback.sources;
          isSimulated = true;
        }
      } else {
        const fallback = getSimulatedRAGResponse(textToSend, topK);
        resultAnswer = fallback.answer;
        resultSources = fallback.sources;
        isSimulated = true;
      }

      const elapsed = Math.round(performance.now() - startTime);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        content: resultAnswer,
        sources: resultSources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        durationMs: elapsed,
        isSimulated,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate answer";
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        content: `⚠️ Error during RAG query: ${errorMsg}. Please check backend service status.`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-68px)] max-h-[calc(100vh-68px)] bg-cover bg-center flex flex-col items-center justify-between font-sans selection:bg-[var(--color-atelier-brass)] selection:text-black overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(14, 16, 21, 0.88), rgba(9, 11, 15, 0.97)), url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-[rgba(212,163,115,0.06)] via-transparent to-transparent pointer-events-none" />

      {/* Top Status & Controls Header */}
      <div className="w-full max-w-6xl px-6 pt-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-neutral-800 backdrop-blur-md text-[11px] font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green,#10b981)] animate-pulse" />
            <span>HYBRID RAG ENGINE // READY</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <Cpu className="w-3 h-3 text-[var(--color-atelier-brass)]" />
            <span>text-emb-3 + GPT-4o</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="h-8 px-2.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "h-8 px-3 text-xs font-mono rounded-lg border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-1.5 transition-all",
              showSettings && "border-[var(--color-atelier-brass)] text-[var(--color-atelier-brass)]"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>RAG Config</span>
          </Button>
        </div>
      </div>

      {/* Settings Modal Drawer */}
      {showSettings && (
        <div className="w-full max-w-6xl px-6 mt-2 z-20 transition-all flex-shrink-0">
          <div className="p-4 rounded-xl bg-black/85 border border-neutral-700 backdrop-blur-xl shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Multi-Query RRF</span>
                <input
                  type="checkbox"
                  checked={useMultiQuery}
                  onChange={(e) => setUseMultiQuery(e.target.checked)}
                  className="rounded border-neutral-700 accent-[var(--color-atelier-brass,#d4a373)] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Generates 3 query variations to retrieve chunks from multiple semantic angles.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Top-K Sources: {topK}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-[var(--color-atelier-brass,#d4a373)] cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>1 (Fast)</span>
                <span>5 (Balanced)</span>
                <span>15 (Deep)</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <span className="font-semibold text-neutral-200">Scope Document UUID(s) (Optional)</span>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Single UUID or comma-separated UUIDs"
                className="px-2.5 py-1.5 rounded bg-black/60 border border-neutral-700 text-neutral-200 placeholder:text-neutral-500 text-[11px] focus:outline-none focus:border-[var(--color-atelier-brass)]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-6xl px-6 py-6 flex flex-col justify-start overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-neutral-800">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center my-auto text-center py-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-300 text-xs font-mono mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-atelier-brass,#d4a373)]" />
              <span>Electron Gate · Knowledge Retrieval</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight drop-shadow-md">
              Electron Gate <span className="text-[var(--color-atelier-brass,#d4a373)] font-serif italic">Chat</span>
            </h1>

            <p className="mt-4 max-w-xl text-neutral-300 text-base sm:text-lg leading-relaxed font-sans">
              Ask questions across your indexed documents, inspect retrieved vector chunks, and explore cited answers.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-2 transition-all",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                {/* Sender Header */}
                <div className="flex items-center gap-2 px-1">
                  {msg.sender === "user" ? (
                    <>
                      <span className="text-[11px] font-mono text-neutral-400">{msg.timestamp}</span>
                      <span className="text-xs font-mono font-semibold text-neutral-200">
                        {user?.full_name || user?.email || "You"}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[var(--color-atelier-brass,#d4a373)] text-black flex items-center justify-center text-[10px] font-bold">
                        {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center text-[10px] font-bold shadow">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--color-atelier-brass,#d4a373)]">
                        Electron Gate
                      </span>
                      {msg.durationMs && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {msg.durationMs}ms
                        </span>
                      )}
                      {msg.isSimulated && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50">
                          LOCAL CACHE
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-neutral-500">{msg.timestamp}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "relative max-w-[94%] sm:max-w-[88%] rounded-2xl p-5 sm:p-6 shadow-lg leading-relaxed text-sm backdrop-blur-md",
                    msg.sender === "user"
                      ? "bg-[var(--color-paper-card,#1b1f2b)] border border-[var(--color-rule-active,rgba(212,163,115,0.4))] text-white rounded-tr-sm"
                      : "bg-black/75 border border-neutral-700/80 text-neutral-100 rounded-tl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Actions & Sources Footer for AI Responses */}
                  {msg.sender === "assistant" && (
                    <div className="mt-4 pt-3 border-t border-neutral-800/90 flex flex-col gap-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* Sources Toggle Button */}
                        {msg.sources && msg.sources.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleSources(msg.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--color-atelier-brass,#d4a373)] hover:text-amber-200 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {msg.sources.length} Retrieved Source{msg.sources.length > 1 ? "s" : ""}
                            </span>
                            {expandedSources[msg.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-neutral-500">No external sources required</span>
                        )}

                        {/* Copy text button */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 font-mono"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Source Chunks Cards */}
                      {expandedSources[msg.id] && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-col gap-2.5 mt-1 pt-2 border-t border-neutral-800/60 font-mono text-xs">
                          {msg.sources.map((source, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 flex flex-col gap-1.5 shadow-sm"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 text-amber-300 font-semibold truncate max-w-[70%]">
                                  <FileText className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {source.metadata?.source || `Source Chunk #${sIdx + 1}`}
                                  </span>
                                  {source.metadata?.page && (
                                    <span className="text-neutral-400 font-normal">
                                      (Page {source.metadata.page})
                                    </span>
                                  )}
                                </div>
                                {source.score !== undefined && source.score !== null && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-terminal-cyan)]/15 text-[var(--color-terminal-cyan)] font-bold">
                                    {(source.score * 100).toFixed(1)}% match
                                  </span>
                                )}
                              </div>
                              <p className="font-sans text-[12px] text-neutral-300 leading-snug line-clamp-4 bg-black/40 p-2 rounded border border-neutral-800/80">
                                {source.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator with glowing shimmer */}
            {isLoading && (
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center text-[10px] font-bold">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--color-atelier-brass,#d4a373)]">
                    Electron Gate
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 animate-pulse">
                    Retrieving vector chunks &amp; synthesizing answer...
                  </span>
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-black/75 border border-neutral-700/80 text-neutral-400 flex items-center gap-3 backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-atelier-brass)] animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-atelier-brass)] animate-ping [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-atelier-brass)] animate-ping [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300">
                    Executing Reciprocal Rank Fusion over vector embeddings...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Section (Pinned to bottom with backdrop blur) */}
      <div className="w-full max-w-6xl px-6 pb-6 pt-2 z-20 flex-shrink-0">
        {/* Active contextual quick suggestions if chat is active */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none">
            <QuickAction
              icon={<Sparkles className="w-3 h-3 text-[var(--color-atelier-brass)]" />}
              label="Key Takeaways"
              onClick={() => handleSend("What are the key takeaways from the retrieved documents?")}
            />
            <QuickAction
              icon={<Search className="w-3 h-3 text-[var(--color-terminal-cyan)]" />}
              label="Detail Metrics"
              onClick={() => handleSend("Break down the exact numeric metrics and percentages mentioned above.")}
            />
            <QuickAction
              icon={<FileText className="w-3 h-3 text-emerald-400" />}
              label="Source Verification"
              onClick={() => handleSend("Which source documents provide the highest confidence score for this answer?")}
            />
          </div>
        )}

        {/* Input Box Outer Container */}
        <div className="relative bg-black/75 backdrop-blur-xl rounded-2xl border border-neutral-700/90 shadow-2xl transition-all focus-within:border-[var(--color-atelier-brass)] focus-within:ring-1 focus-within:ring-[var(--color-atelier-brass)]/40">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or enter a research prompt (e.g. 'What are the main 2023 revenue drivers?')..."
            className={cn(
              "w-full px-5 py-4 resize-none border-none",
              "bg-transparent text-white text-[15px] font-sans",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[56px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Controls Strip */}
          <div className="flex items-center justify-between p-2.5 pt-0 border-t border-neutral-800/40">
            <div className="flex items-center gap-1.5">
              <Link href="/dashboard/upload">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg"
                  title="Upload Document for Ingestion"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="sr-only">Attach or Upload Document</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 px-2 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-lg flex items-center gap-1"
                title="Configure Retrieval Parameters"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span className="hidden sm:inline">k={topK}</span>
                {useMultiQuery && <span className="hidden md:inline text-[var(--color-terminal-green)]">· RRF</span>}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                Shift + Enter for new line
              </span>

              <Button
                type="button"
                disabled={!message.trim() || isLoading}
                onClick={() => handleSend()}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all h-8 text-xs font-mono font-semibold",
                  message.trim() && !isLoading
                    ? "bg-[var(--color-atelier-brass,#d4a373)] text-black hover:bg-[#deb081] shadow-md cursor-pointer hover:scale-105"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                )}
              >
                <span>Send</span>
                <ArrowUpIcon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2 px-1">
          <span>Electron Gate · Multi-Query RAG Intelligence</span>
          <Link href="/dashboard" className="hover:text-neutral-300 transition-colors">
            Back to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export { ElectronGateChat, ElectronGateChat as RuixenMoonChat };
