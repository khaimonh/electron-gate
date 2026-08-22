const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  uploaded_by?: string | null;
  file_name: string;
  file_type?: string | null;
  file_path: string;
  total_page: number;
  total_chunk: number;
  private: boolean;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${BACKEND_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Login failed");
  }

  return res.json();
}

export async function apiGetMe(token: string): Promise<UserInfo> {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }

  return res.json();
}

export async function apiUploadDocument(
  file: File,
  isPrivate: boolean = false,
  token: string,
  onProgress?: (progress: number) => void
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = new URL(`${BACKEND_URL}/ingestion/upload`);
  if (isPrivate) {
    url.searchParams.append("is_private", "true");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url.toString());
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Map transmission to 0-85%, remaining 15% is vector embedding generation
        const percentComplete = Math.min(Math.round((event.loaded / event.total) * 85), 85);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve(res);
        } catch {
          resolve({
            document_id: "simulated-" + Date.now(),
            file_name: file.name,
            file_path: "storage/" + file.name,
            total_page: 1,
            total_chunk: 1,
            private: isPrivate,
          });
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText);
          if (err.detail) {
            errorMsg = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
          }
        } catch {}
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload. Check backend connection."));
    };

    xhr.send(formData);
  });
}

export async function apiGetDocuments(
  token: string
): Promise<DocumentUploadResponse[]> {
  const res = await fetch(`${BACKEND_URL}/ingestion/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch documents: ${res.status}`);
  }

  return res.json();
}

export async function apiGetDocumentById(
  documentId: string,
  token: string
): Promise<DocumentUploadResponse> {
  const res = await fetch(`${BACKEND_URL}/ingestion/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch document ${documentId}: ${res.status}`);
  }

  return res.json();
}

export async function apiDeleteDocument(
  documentId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/ingestion/documents/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to delete document: ${res.status}`);
  }
}

export interface SourceChunk {
  content: string;
  score?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface RAGQueryRequest {
  query: string;
  document_id?: string | null;
  document_ids?: string[] | null;
  use_multi_query?: boolean;
  top_k?: number;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  sources: SourceChunk[];
}

export interface RAGSearchRequest {
  query: string;
  document_id?: string | null;
  document_ids?: string[] | null;
  top_k?: number;
}

export interface RAGSearchResponse {
  query: string;
  total_results: number;
  results: SourceChunk[];
}

export async function apiRAGQuery(
  request: RAGQueryRequest,
  token: string
): Promise<RAGQueryResponse> {
  const res = await fetch(`${BACKEND_URL}/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `RAG query failed with status ${res.status}`);
  }

  return res.json();
}

export async function apiRAGSearch(
  request: RAGSearchRequest,
  token: string
): Promise<RAGSearchResponse> {
  const res = await fetch(`${BACKEND_URL}/rag/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `RAG search failed with status ${res.status}`);
  }

  return res.json();
}

// ── E-Commerce & Product Browsing ─────────────────────────────────────────────

export interface CategoryBrief {
  category_id: string;
  name: string;
}

export interface Category {
  category_id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
}

export interface ProductListItem {
  product_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  categories: CategoryBrief[];
  variant_count: number;
}

export interface VariantBrief {
  variant_id: string;
  model?: string | null;
  color?: string | null;
  storage?: string | null;
  price: number | string;
  status: string;
  image_url?: string | null;
}

export interface SpecBrief {
  spec_product_id: string;
  spec_name: string;
  spec_value: string;
}

export interface ProductRead {
  product_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  categories: CategoryBrief[];
  variants: VariantBrief[];
  specs: SpecBrief[];
}

export interface VisualSearchResultItem {
  product_id: string;
  product_name: string;
  product_description?: string | null;
  matched_image_id: string;
  matched_image_url: string;
  variant_id?: string | null;
  variant_model?: string | null;
  variant_color?: string | null;
  variant_price?: number | null;
  similarity_score: number;
}

export interface ProductImageRead {
  image_id: string;
  product_id: string;
  variant_id?: string | null;
  image_url: string;
  is_primary: boolean;
  created_at?: string | null;
}

export interface CartItemBrief {
  variant_id: string;
  quantity: number;
  unit_price: number | string;
  is_selected: boolean;
  product_name?: string | null;
  variant_model?: string | null;
  variant_color?: string | null;
  variant_storage?: string | null;
  variant_image_url?: string | null;
}

export interface CartRead {
  cart_id: string;
  user_id: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  items: CartItemBrief[];
}

export async function apiGetProducts(
  token?: string | null,
  categoryId?: string | null,
  search?: string | null
): Promise<ProductListItem[]> {
  const url = new URL(`${BACKEND_URL}/products`);
  if (categoryId) url.searchParams.append("category_id", categoryId);
  if (search) url.searchParams.append("search", search);

  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function apiGetCategories(token?: string | null): Promise<Category[]> {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/categories`, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}

export async function apiGetProductById(
  productId: string,
  token?: string | null
): Promise<ProductRead> {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/products/${productId}`, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch product: ${res.status}`);
  }
  return res.json();
}

export async function apiSearchProductsByImage(
  embedding: number[],
  token?: string | null,
  options?: { top_k?: number; min_similarity?: number; category_id?: string }
): Promise<VisualSearchResultItem[]> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/products/search-by-image`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      embedding,
      top_k: options?.top_k ?? 10,
      min_similarity: options?.min_similarity ?? 0.5,
      category_id: options?.category_id ?? null,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Visual search failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGetMyCart(token: string): Promise<CartRead> {
  const res = await fetch(`${BACKEND_URL}/carts/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch cart: ${res.status}`);
  }
  return res.json();
}

export interface ProductCreatePayload {
  name: string;
  description?: string | null;
  image_url?: string | null;
  category_ids?: string[];
}

export async function apiCreateProduct(
  payload: ProductCreatePayload,
  token: string
): Promise<ProductRead> {
  const res = await fetch(`${BACKEND_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to create product: ${res.status}`);
  }

  return res.json();
}

export interface ImageUploadResponse {
  image_url: string;
  file_name: string;
}

export async function apiUploadProductImage(
  file: File,
  token: string
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}/products/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to upload image: ${res.status}`);
  }

  return res.json();
}

export async function apiGetProductImages(
  productId: string,
  token?: string | null
): Promise<ProductImageRead[]> {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/products/${productId}/images`, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch product images: ${res.status}`);
  }
  return res.json();
}

export async function apiAddToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
  token: string
): Promise<CartItemBrief> {
  const res = await fetch(`${BACKEND_URL}/carts/${cartId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      variant_id: variantId,
      quantity,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to add item to cart: ${res.status}`);
  }

  return res.json();
}
