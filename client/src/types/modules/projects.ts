/**
 * Projects module types.
 */

// ─── Project Member ───────────────────────────────────────────────────────────

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  userNameEn?: string | null;
  userNameAr?: string | null;
  userEmail?: string | null;
  createdAt?: string;
  /** Nested user object returned by some API endpoints */
  user?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
};
