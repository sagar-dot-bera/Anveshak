// TypeScript interfaces mirroring all Spring Boot backend DTOs.
// Keep this file in sync with the Java records in com.anveshak.DTOs.

// ── Auth ────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface GoogleLoginRequest {
  token_id: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResendVerificationTokenRequest {
  email: string;
}

// ── User ────────────────────────────────────────────────────
export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserIdentityResponse {
  id: string;
  provider: string;
  providerUserId: string;
  createdAt: string;
}

export interface UserSessionResponse {
  id: string;
  deviceName: string;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

// ── Research Papers ─────────────────────────────────────────
export interface ResearchPaperResponse {
  id: string;
  title: string;
  abstractText: string;
  authors: string[];
  keywords: string[];
  publicationYear: number;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewPaperRequest {
  title: string;
  abstractText: string;
  authors: string[];
  publicationYear: number;
  keywords: string[];
}

export interface UpdatePaperRequest {
  title?: string;
  abstractText?: string;
  authors?: string[];
  publicationYear?: number;
  keywords?: string[];
}

// ── Collections ─────────────────────────────────────────────
export interface ResearchCollectionResponse {
  id: string;
  name: string;
  createdAt: string;
  papers: ResearchPaperResponse[];
}

export interface NewCollectionRequest {
  name: string;
}

export interface UpdateCollectionRequest {
  name: string;
}

// ── Chat ────────────────────────────────────────────────────
export interface ChatSessionResponse {
  sessionId: string;
}

export interface NewChatSessionRequest {
  paperId: string;
}

export interface ChatMessageRequest {
  message: string;
  sessionId: string;
  role: string;
}

export interface ChatMessageResponse {
  message: string;
  sessionId: string;
  role: string;
}

// ── Citations ───────────────────────────────────────────────
export interface CitationResponse {
  id: string;
  citingPaperId: string;
  citingPaperTitle: string;
  citedPaperId: string;
  citedPaperTitle: string;
  createdAt: string;
}

export interface NewCitationRequest {
  citedPaperId: string;
}

// ── Paper Comparison ────────────────────────────────────────
export interface PaperComparison {
  title: string;
  objective: string;
  methodology: string;
  dataset: string;
  results: string;
  strengths: string;
  weaknesses: string;
  futureWork: string;
}

export interface PaperComparisonRequest {
  paperIdStrings: string[];
}

export interface PaperComparisonResponse {
  papers: PaperComparison[];
}

// ── Paper Summary / Literature Review ───────────────────────
export interface InnerPaperSummaryDTO {
  objective: string;
  methodology: string;
  dataset: string;
  keyFindings: string;
  limitations: string;
  futureWork: string;
}

export interface PaperSummaryResponse {
  summaries: InnerPaperSummaryDTO[];
}

export interface LiteratureReviewRequest {
  paperIdStrings: string[];
}

export interface LiteratureReviewResponse {
  literatureReviews: InnerPaperSummaryDTO[];
}

// ── Error ───────────────────────────────────────────────────
export interface ErrorResponse {
  status: number;
  error: string;
  msg: string;
  timestamp: string;
}
