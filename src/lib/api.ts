
// ============================================================
//  LiTvision API Helper
//  Base URL: http://litvision-api.runasp.net/api
//  Swagger:  http://litvision-api.runasp.net/swagger
//
//  Auth: Authorization: Bearer {token}
//  Token stored in localStorage key "livision_token"
// ============================================================

export const BASE_URL = "https://litvision-api.runasp.net/api";

// --------------- Token Helpers ---------------
export function getToken(): string | null {
  return localStorage.getItem("livision_token");
}

export function setToken(token: string): void {
  localStorage.setItem("livision_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("livision_token");
}

// --------------- Base Fetch ---------------
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData?.message ||
        errorData?.title ||
        errorData?.errors?.[Object.keys(errorData?.errors ?? {})[0]]?.[0] ||
        errorMessage;
    } catch {
      // response body not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) return undefined as unknown as T;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

// ============================================================
//  Auth  — /api/auth/register  /api/auth/login
// ============================================================

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  register: (body: RegisterRequest) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ============================================================
//  Books  — /api/books
// ============================================================

export interface ApiBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  language: string;
  isbn: string;
  rating?: number;
  coverImageUrl?: string;
  coverUrl?: string; // fallback
  hasPdf?: boolean;
  pdfUrl?: string; // fallback
  createdAt?: string;
  publishedDate?: string; // fallback
  reviews?: ApiReview[];
}

export interface ApiReview {
  id: string;
  userId?: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt?: string;
}

export interface SaveBookResponse {
  saved: boolean;
  message: string;
}

export interface BooksListResponse {
  total?: number;
  page?: number;
  pageSize?: number;
  books?: ApiBook[];
  items?: ApiBook[]; // fallback
  data?: ApiBook[];  // fallback
  totalCount?: number; // fallback
}

export const booksApi = {
  /**
   * GET /api/books?category=&search=&page=1&pageSize=20
   */
  getBooks: (params?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all")
      query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    query.set("page", String(params?.page ?? 1));
    query.set("pageSize", String(params?.pageSize ?? 50));
    const qs = query.toString();
    return apiFetch<BooksListResponse | ApiBook[]>(`/books?${qs}`);
  },

  /**
   * GET /api/books/{id}
   */
  getBook: (id: string) => apiFetch<ApiBook>(`/books/${id}`),

  /**
   * POST /api/books  (multipart/form-data)
   * Fields: Title, Author, Description, Category, Pages, Language, Isbn, CoverImage, PdfFile
   */
  uploadBook: (formData: FormData) =>
    apiFetch<ApiBook>("/books", {
      method: "POST",
      body: formData,
    }),

  /**
   * DELETE /api/books/{id}
   */
  deleteBook: (id: string) =>
    apiFetch<void>(`/books/${id}`, { method: "DELETE" }),

  /**
   * POST /api/books/{id}/save  — saves/unsaves book to user's library (toggles)
   */
  saveBook: (id: string) =>
    apiFetch<SaveBookResponse>(`/books/${id}/save`, { method: "POST" }),

  /**
   * POST /api/books/{id}/reviews
   * Body: { comment: string, rating: number }
   */
  addReview: (id: string, body: { comment: string; rating: number }) =>
    apiFetch<ApiReview>(`/books/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /**
   * PUT /api/books/{id}/reviews/{reviewId}
   * Body: { comment: string, rating: number }
   */
  editReview: (id: string, reviewId: string, body: { comment: string; rating: number }) =>
    apiFetch<ApiReview>(`/books/${id}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /**
   * DELETE /api/books/{id}/reviews/{reviewId}
   */
  deleteReview: (id: string, reviewId: string) =>
    apiFetch<{ message: string }>(`/books/${id}/reviews/${reviewId}`, {
      method: "DELETE",
    }),

  /**
   * GET /api/books/{id}/download-pdf  — returns PDF binary
   */
  downloadPdf: (id: string) =>
    `${BASE_URL}/books/${id}/download-pdf`, // Return URL for direct link
};

// ============================================================
//  Profile  — /api/profile
// ============================================================

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  interests?: string[];
  avatarUrl?: string;
  reviewCount?: number;
}

export const profileApi = {
  /**
   * GET /api/profile  — requires auth token
   */
  getProfile: () => apiFetch<UserProfile>("/profile"),

  /**
   * PUT /api/profile/interests
   * Body: { interests: string[] }
   */
  updateInterests: (interests: string[]) =>
    apiFetch<{ message?: string }>("/profile/interests", {
      method: "PUT",
      body: JSON.stringify({ interests }),
    }),

  /**
   * GET /api/profile/saved-books  — user's library
   */
  getSavedBooks: () => apiFetch<ApiBook[]>("/profile/saved-books"),
};

// ============================================================
//  TTS  — /api/tts
// ============================================================

export interface TtsResponse {
  audioId: string;
  audioFileUrl: string;
  voiceType: string;
  status: string;
  createdAt: string;
}

export const ttsApi = {
  /**
   * GET /api/tts/{bookId}?voiceType=default
   * Returns: text or audioUrl for the book
   */
  getTtsText: (bookId: string, voiceType = "default") =>
    apiFetch<TtsResponse>(`/tts/${bookId}?voiceType=${voiceType}`),

  /**
   * POST /api/tts
   * Body: { bookId, voiceType?, voiceUrl? }
   * Use voiceUrl when user has uploaded a custom voice file
   */
  generateTts: (body: {
    bookId: string;
    voiceType?: string;
    voiceUrl?: string;
  }) =>
    apiFetch<TtsResponse>("/tts", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /**
   * POST /api/tts/upload-voice
   * Body: FormData containing "file"
   */
  uploadVoice: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ voiceUrl: string }>("/tts/upload-voice", {
      method: "POST",
      body: formData,
    });
  },
};

// ============================================================
//  Video  — /api/video
// ============================================================

export interface VideoScene {
  id: number;
  text: string;
  imageUrl?: string;
  sceneId?: string;
}

export interface SceneItem {
  sceneId: string;
  sceneExcerpt: string;
  prompt: string;
}

export interface PreviewResponse {
  previewId: string;
  sceneCount: number;
  scenes: SceneItem[];
}

export interface VideoResponse {
  id?: string;
  bookId?: string;
  videoUrl?: string;
  scenes?: VideoScene[];
  status?: string;
  createdAt?: string;
}

export const videoApi = {
  /**
   * POST /api/video/preview
   * Body: { bookId: uuid, sceneWindow?: number }
   */
  previewVideo: (bookId: string, sceneWindow = 3) =>
    apiFetch<PreviewResponse>("/video/preview", {
      method: "POST",
      body: JSON.stringify({ bookId, sceneWindow }),
    }),

  /**
   * POST /api/video/generate
   * Body: { bookId: uuid, maxScenes?: number, previewId?: string, sceneIds?: string[] }
   */
  generateVideo: (
    bookId: string,
    maxScenes?: number,
    previewId?: string,
    sceneIds?: string[]
  ) =>
    apiFetch<VideoResponse>("/video/generate", {
      method: "POST",
      body: JSON.stringify({ bookId, maxScenes, previewId, sceneIds }),
    }),

  /**
   * GET /api/video/{id}  — get a specific generated video by its ID
   */
  getVideo: (id: string) => apiFetch<VideoResponse>(`/video/${id}`),

  /**
   * GET /api/video/my-videos  — all videos generated by current user
   */
  getMyVideos: () => apiFetch<VideoResponse[]>("/video/my-videos"),
};

// ============================================================
//  Summary  — /api/summary
// ============================================================

export interface SummaryResponse {
  summaryId: string;
  finalSummary: string;
  chapterSummariesUrl?: string;
  bigSummaryUrl?: string;
  metaUrl?: string;
  numChapters: number;
  createdAt: string;
}

export const summaryApi = {
  getSummary: (bookId: string) =>
    apiFetch<SummaryResponse>("/summary", {
      method: "POST",
      body: JSON.stringify({ bookId }),
    }),
};

// ============================================================
//  Recommendations  — /api/recommendations
// ============================================================

export interface RecommendationsResponse {
  books: ApiBook[];
}

export const recommendationsApi = {
  getRecommendations: () =>
    apiFetch<RecommendationsResponse>("/recommendations"),
};

// ============================================================
//  Helpers: Convert ApiBook → local Book shape
// ============================================================

import type { Book } from "./books";

export function apiBookToLocal(apiBook: ApiBook): Book {
  let coverUrl = apiBook.coverImageUrl || apiBook.coverUrl;
  if (coverUrl && coverUrl.startsWith("http://")) {
    coverUrl = coverUrl.replace("http://", "https://");
  }

  return {
    id: apiBook.id,
    title: apiBook.title,
    author: apiBook.author,
    cover:
      coverUrl ||
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    description: apiBook.description || "",
    category: apiBook.category || "General",
    pages: apiBook.pages || 0,
    language: apiBook.language || "English",
    isbn: apiBook.isbn || "",
    rating: apiBook.rating ?? 4.5,
    reviews: (apiBook.reviews || []).map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      comment: r.comment,
      rating: r.rating,
    })),
  };
}

/**
 * Safely extract books array from any API response shape
 */
export function extractBooks(
  result: BooksListResponse | ApiBook[]
): ApiBook[] {
  if (Array.isArray(result)) return result;
  return result.books ?? result.items ?? result.data ?? [];
}
