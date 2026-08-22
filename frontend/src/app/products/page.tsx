"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  apiGetProducts,
  apiGetCategories,
  apiGetMyCart,
  apiSearchProductsByImage,
  type ProductListItem,
  type Category,
  type VisualSearchResultItem,
} from "@/app/lib/api";
import {
  Search,
  SlidersHorizontal,
  Camera,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Cpu,
  Boxes,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";

export default function ProductsPage() {
  const { user, token, logout, isLoading: authLoading } = useAuth();

  // Data states
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);

  // UI / Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Visual Search modal states
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState<boolean>(false);
  const [visualSearchResults, setVisualSearchResults] = useState<VisualSearchResultItem[]>([]);
  const [isSearchingVisual, setIsSearchingVisual] = useState<boolean>(false);
  const [visualSearchError, setVisualSearchError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    let isMounted = true;
    apiGetCategories(token)
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => {
        console.warn("Could not load categories:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Fetch cart count when user is logged in
  useEffect(() => {
    if (!token) {
      return;
    }
    let isMounted = true;
    apiGetMyCart(token)
      .then((cart) => {
        if (isMounted && cart?.items) {
          setCartCount(cart.items.length);
        }
      })
      .catch(() => {
        if (isMounted) setCartCount(0);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Fetch products based on category and search query
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGetProducts(
        token,
        selectedCategory || null,
        searchQuery.trim() || null
      );
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products. Please check connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250); // slight debounce for search typing

    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Handle visual search simulation / upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVisualSearchError(null);
    setIsSearchingVisual(true);
    setVisualSearchResults([]);

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Generate 512-dimensional query vector
      const syntheticEmbedding = Array.from({ length: 512 }, () =>
        Number((Math.random() * 0.2 - 0.1).toFixed(4))
      );

      const results = await apiSearchProductsByImage(syntheticEmbedding, token, {
        top_k: 8,
        min_similarity: 0.2,
        category_id: selectedCategory || undefined,
      });

      setVisualSearchResults(results);
    } catch (err) {
      setVisualSearchError(
        err instanceof Error ? err.message : "Visual search failed"
      );
    } finally {
      setIsSearchingVisual(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col selection:bg-[var(--color-atelier-brass)] selection:text-[var(--color-paper)]">
      {/* Background drafting grid */}
      <div className="atelier-canvas-grid fixed inset-0 pointer-events-none opacity-40" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="atelier-logo-stamp !w-9 !h-9 group-hover:border-[var(--color-atelier-brass)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
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
              <div className="flex flex-col">
                <span className="font-fraunces font-bold text-sm tracking-tight text-[var(--color-ink)]">
                  ELECTRON GATE
                </span>
                <span className="font-mono text-[10px] text-[var(--color-ink-dim)] tracking-widest uppercase">
                  HARDWARE &amp; ENCLAVES
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[var(--color-rule)] text-xs font-mono">
              <Link
                href="/products"
                className="px-3 py-1.5 rounded bg-[var(--color-paper-card)] text-[var(--color-atelier-brass)] border border-[var(--color-rule-active)] font-medium"
              >
                CATALOG
              </Link>
              <Link
                href="/dashboard/chat"
                className="px-3 py-1.5 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-sub)] transition-colors"
              >
                RAG CHAT
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-sub)] transition-colors"
              >
                DASHBOARD
              </Link>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Visual Search trigger button */}
            <button
              onClick={() => setIsVisualSearchOpen(true)}
              className="atelier-btn atelier-btn-ghost !py-1.5 !px-3 text-xs flex items-center gap-1.5 border border-[var(--color-rule)] hover:border-[var(--color-terminal-cyan)]"
              title="Search by Image (pgvector CLIP)"
            >
              <Camera className="w-3.5 h-3.5 text-[var(--color-terminal-cyan)]" />
              <span className="hidden sm:inline font-mono">VISUAL SEARCH</span>
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded border border-[var(--color-rule)] bg-[var(--color-paper-sub)] hover:border-[var(--color-atelier-brass)] transition-colors"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-[var(--color-ink-muted)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-atelier-brass)] text-[var(--color-paper)] font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth status */}
            {!authLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-rule)]">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="font-mono text-[11px] text-[var(--color-ink)] leading-none truncate max-w-[130px]">
                        {user.email}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--color-atelier-brass)] uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="p-2 text-[var(--color-ink-dim)] hover:text-[var(--color-restricted-red)] transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-rule)] font-mono text-xs">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="atelier-btn atelier-btn-primary !py-1.5 !px-3 text-xs"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col">
        {/* Hero Banner Section */}
        <section className="mb-8">
          <div className="atelier-plate relative p-6 sm:p-8 rounded-lg overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper-sub)]">
            <div className="atelier-filament-glow" />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="atelier-terminal-status-tag mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse" />
                  <span>REGISTRY // HARDWARE &amp; NEURAL MODULES</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-fraunces font-extrabold tracking-tight text-[var(--color-ink)] mb-2">
                  System Architecture Catalog
                </h1>
                <p className="text-sm text-[var(--color-ink-muted)] font-sans leading-relaxed">
                  Browse enterprise compute nodes, gate enclosures, and neural coprocessors.
                  Filter across categorized hardware clusters or perform vector visual similarity matching.
                </p>
              </div>

              {/* Metrics Badge */}
              <div className="flex items-center gap-4 bg-[var(--color-paper-card)] p-3 rounded border border-[var(--color-rule)] font-mono text-xs">
                <div>
                  <div className="text-[10px] text-[var(--color-ink-dim)] uppercase">Products Indexed</div>
                  <div className="text-base font-bold text-[var(--color-terminal-cyan)]">
                    {products.length} Units
                  </div>
                </div>
                <div className="h-8 w-px bg-[var(--color-rule)]" />
                <div>
                  <div className="text-[10px] text-[var(--color-ink-dim)] uppercase">Categories</div>
                  <div className="text-base font-bold text-[var(--color-atelier-brass)]">
                    {categories.length} Nodes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-dim)]" />
              <input
                type="text"
                placeholder="Search products by model, architecture, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-paper-sub)] border border-[var(--color-rule)] rounded pl-10 pr-4 py-2.5 text-xs font-mono text-[var(--color-ink)] placeholder:text-[var(--color-ink-dim)] focus:outline-none focus:border-[var(--color-atelier-brass)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Visual Search shortcut pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVisualSearchOpen(true)}
                className="px-3 py-2.5 rounded bg-[var(--color-paper-sub)] border border-[var(--color-rule)] hover:border-[var(--color-terminal-cyan)] text-xs font-mono flex items-center gap-2 transition-all group"
              >
                <Camera className="w-3.5 h-3.5 text-[var(--color-terminal-cyan)] group-hover:scale-110 transition-transform" />
                <span>Camera Search</span>
              </button>
              <button
                onClick={loadProducts}
                className="p-2.5 rounded bg-[var(--color-paper-sub)] border border-[var(--color-rule)] hover:border-[var(--color-rule-active)] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] transition-colors"
                title="Refresh products"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--color-rule)]">
            <span className="text-[10px] font-mono text-[var(--color-ink-dim)] uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Filters:
            </span>

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors border ${
                selectedCategory === null
                  ? "bg-[var(--color-atelier-brass)] text-[var(--color-paper)] border-[var(--color-atelier-brass)] font-semibold"
                  : "bg-[var(--color-paper-sub)] text-[var(--color-ink-muted)] border-[var(--color-rule)] hover:border-[var(--color-rule-active)] hover:text-[var(--color-ink)]"
              }`}
            >
              ALL ITEMS ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.category_id
                    ? "bg-[var(--color-atelier-brass)] text-[var(--color-paper)] border-[var(--color-atelier-brass)] font-semibold"
                    : "bg-[var(--color-paper-sub)] text-[var(--color-ink-muted)] border-[var(--color-rule)] hover:border-[var(--color-rule-active)] hover:text-[var(--color-ink)]"
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded border border-[var(--color-restricted-red)]/50 bg-[var(--color-restricted-red)]/10 text-xs font-mono text-[var(--color-restricted-red)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadProducts}
              className="underline hover:text-[var(--color-ink)] transition-colors ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Grid / Loading / Empty */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="atelier-plate p-4 rounded border border-[var(--color-rule)] bg-[var(--color-paper-card)] animate-pulse flex flex-col justify-between h-[320px]"
              >
                <div className="w-full h-40 bg-[var(--color-paper-sub)] rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-[var(--color-paper-sub)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--color-paper-sub)] rounded w-1/2" />
                </div>
                <div className="h-8 bg-[var(--color-paper-sub)] rounded mt-4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center atelier-plate border border-[var(--color-rule)] rounded bg-[var(--color-paper-sub)]">
            <Boxes className="w-12 h-12 text-[var(--color-ink-dim)] mb-3" />
            <h3 className="font-fraunces font-bold text-lg text-[var(--color-ink)] mb-1">
              No matching products in registry
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] font-mono max-w-sm mb-6">
              No items match your active filters or search terms. Try clearing your query or category selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="atelier-btn atelier-btn-primary !py-2 !px-4 text-xs font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item) => (
              <div
                key={item.product_id}
                className="atelier-plate group p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-card)] hover:border-[var(--color-rule-active)] hover:bg-[var(--color-paper-hover)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between mb-3 font-mono text-[10px] text-[var(--color-ink-dim)]">
                    <span className="truncate max-w-[120px] text-[var(--color-atelier-brass)] uppercase">
                      {item.categories?.[0]?.name || "SYSTEM HARDWARE"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--color-paper-sub)] border border-[var(--color-rule)] text-[var(--color-terminal-cyan)]">
                      {item.variant_count} {item.variant_count === 1 ? "VARIANT" : "VARIANTS"}
                    </span>
                  </div>

                  {/* Image / Graphic Display */}
                  <Link
                    href={`/products/${item.product_id}`}
                    className="block relative w-full h-44 bg-[var(--color-paper-terminal)] rounded border border-[var(--color-rule-subtle)] overflow-hidden mb-3 group-hover:border-[var(--color-rule)] transition-colors"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-dim)] p-4">
                        <Cpu className="w-10 h-10 mb-2 opacity-40 group-hover:text-[var(--color-atelier-brass)] transition-colors" />
                        <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                          HARDWARE PLATE
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Title & Info */}
                  <Link href={`/products/${item.product_id}`} className="block">
                    <h2 className="font-fraunces font-bold text-base text-[var(--color-ink)] group-hover:text-[var(--color-atelier-brass)] transition-colors line-clamp-1 mb-1">
                      {item.name}
                    </h2>
                  </Link>

                  <p className="text-xs text-[var(--color-ink-muted)] font-sans line-clamp-2 leading-relaxed mb-4">
                    {item.description || "High-precision architecture node with vector integration capabilities."}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-[var(--color-rule-subtle)] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--color-terminal-green)]">
                    ● ACTIVE INVENTORY
                  </span>
                  <Link
                    href={`/products/${item.product_id}`}
                    className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-atelier-brass)] hover:underline"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Visual Search Modal (CLIP 512-dim Image Matching) */}
      {isVisualSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="atelier-plate relative w-full max-w-2xl bg-[var(--color-paper-card)] border border-[var(--color-rule-active)] rounded-lg shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-rule)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-[var(--color-paper-terminal)] border border-[var(--color-terminal-cyan)] text-[var(--color-terminal-cyan)]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-lg text-[var(--color-ink)]">
                    Visual Vector Search
                  </h3>
                  <p className="font-mono text-[10px] text-[var(--color-ink-muted)]">
                    pgvector 512-dimensional CLIP embedding similarity lookup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisualSearchOpen(false)}
                className="p-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] rounded hover:bg-[var(--color-paper-sub)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Box */}
            <div className="mb-4">
              <label
                htmlFor="visual-upload-input"
                className="border-2 border-dashed border-[var(--color-rule)] hover:border-[var(--color-terminal-cyan)] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[var(--color-paper-terminal)]"
              >
                {previewImage ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={previewImage}
                      alt="Uploaded Query"
                      className="w-20 h-20 object-cover rounded border border-[var(--color-rule)]"
                    />
                    <div className="text-left font-mono text-xs">
                      <div className="text-[var(--color-terminal-green)] flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Image Embedded
                      </div>
                      <div className="text-[var(--color-ink-muted)] text-[10px]">
                        Click to replace search target image
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[var(--color-terminal-cyan)] mb-2 animate-bounce" />
                    <span className="font-mono text-xs text-[var(--color-ink)] font-semibold mb-1">
                      Upload or Drop Product Image
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
                      Supports JPG, PNG, WEBP (Auto-extracts 512d CLIP vectors)
                    </span>
                  </>
                )}
                <input
                  id="visual-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Visual Search Results */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[140px]">
              {isSearchingVisual ? (
                <div className="py-12 flex flex-col items-center justify-center text-center font-mono text-xs text-[var(--color-ink-muted)]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-terminal-cyan)] mb-2" />
                  <span>Computing cosine distance across product vector space...</span>
                </div>
              ) : visualSearchError ? (
                <div className="p-3 bg-[var(--color-restricted-red)]/10 border border-[var(--color-restricted-red)]/40 text-[var(--color-restricted-red)] text-xs font-mono rounded">
                  {visualSearchError}
                </div>
              ) : visualSearchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="font-mono text-[10px] text-[var(--color-ink-dim)] uppercase tracking-wider">
                    Matched Products ({visualSearchResults.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visualSearchResults.map((res) => (
                      <Link
                        key={res.matched_image_id}
                        href={`/products/${res.product_id}`}
                        onClick={() => setIsVisualSearchOpen(false)}
                        className="p-3 rounded border border-[var(--color-rule)] bg-[var(--color-paper-sub)] hover:border-[var(--color-terminal-cyan)] transition-all flex items-center gap-3 group"
                      >
                        <div className="w-14 h-14 rounded bg-[var(--color-paper-terminal)] border border-[var(--color-rule)] overflow-hidden shrink-0">
                          {res.matched_image_url ? (
                            <img
                              src={res.matched_image_url}
                              alt={res.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Cpu className="w-full h-full p-3 text-[var(--color-ink-dim)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 font-mono text-xs">
                          <div className="font-bold text-[var(--color-ink)] truncate group-hover:text-[var(--color-terminal-cyan)] transition-colors">
                            {res.product_name}
                          </div>
                          {res.variant_model && (
                            <div className="text-[10px] text-[var(--color-ink-muted)] truncate">
                              Model: {res.variant_model}
                            </div>
                          )}
                          <div className="inline-block mt-1 px-1.5 py-0.2 text-[9px] rounded bg-[var(--color-terminal-cyan)]/10 text-[var(--color-terminal-cyan)] border border-[var(--color-terminal-cyan)]/30 font-bold">
                            {(res.similarity_score * 100).toFixed(1)}% MATCH
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : previewImage ? (
                <div className="py-8 text-center font-mono text-xs text-[var(--color-ink-dim)]">
                  No visual matches found above similarity threshold.
                </div>
              ) : (
                <div className="py-8 text-center font-mono text-xs text-[var(--color-ink-dim)]">
                  Upload an image above to find matching products in our neural index.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-4 border-t border-[var(--color-rule)] flex justify-end">
              <button
                onClick={() => setIsVisualSearchOpen(false)}
                className="atelier-btn atelier-btn-ghost !py-1.5 !px-4 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <footer className="mt-auto border-t border-[var(--color-rule)] py-6 bg-[var(--color-paper-terminal)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[var(--color-ink-dim)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-terminal-green)]" />
            <span>ELECTRON GATE CATALOG · E-COMMERCE REGISTRY</span>
          </div>
          <div>EST. 2026 // ATELIER × MONOSPACE TERMINAL ENCLAVE</div>
        </div>
      </footer>
    </div>
  );
}
