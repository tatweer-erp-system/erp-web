/**
 * Named constants for magic numbers used across the application.
 * Never inline these values -- always import from here.
 */

// ── Pagination ────────────────────────────────────────────────────────────────

/** Default rows per page in tables */
export const DEFAULT_PAGE_SIZE = 25;

/** Available page-size options for table pagination */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ── React Query cache ─────────────────────────────────────────────────────────

/** Standard stale time for frequently-changing data (5 min) */
export const STALE_TIME = 5 * 60 * 1000;

/** Extended stale time for rarely-changing data like settings (30 min) */
export const STALE_TIME_STATIC = 30 * 60 * 1000;

/** Max retry count for failed queries */
export const QUERY_RETRY_COUNT = 1;

// ── UI timings ────────────────────────────────────────────────────────────────

/** Default debounce delay for search inputs (ms) */
export const DEBOUNCE_MS = 300;

/** Toast auto-close duration (ms) */
export const TOAST_DURATION_MS = 4000;

/** Modal animation duration (ms) */
export const MODAL_ANIMATION_MS = 200;

// ── File upload ───────────────────────────────────────────────────────────────

/** Maximum file upload size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum avatar image size in bytes (2 MB) */
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/** Maximum number of files per upload batch */
export const MAX_UPLOAD_BATCH = 10;

// ── Layout ────────────────────────────────────────────────────────────────────

/** Sidebar collapsed width in pixels */
export const SIDEBAR_COLLAPSED_WIDTH = 80;

/** Sidebar expanded width in pixels */
export const SIDEBAR_EXPANDED_WIDTH = 256;

/** Header height in pixels */
export const HEADER_HEIGHT = 64;

/** Minimum touch target size in pixels (accessibility) */
export const MIN_TOUCH_TARGET = 44;

// ── Breakpoints ───────────────────────────────────────────────────────────────

/** Mobile breakpoint (px) */
export const BREAKPOINT_XS = 360;

/** Small phone breakpoint (px) */
export const BREAKPOINT_SM = 576;

/** Tablet breakpoint (px) */
export const BREAKPOINT_MD = 768;

/** Small laptop breakpoint (px) */
export const BREAKPOINT_LG = 992;

/** Desktop breakpoint (px) */
export const BREAKPOINT_XL = 1200;

/** Wide monitor breakpoint (px) */
export const BREAKPOINT_2XL = 1600;

// ── Business rules ────────────────────────────────────────────────────────────

/** Session cookie lifetime (1 year in ms) */
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/** Maximum table rows before virtualization is required */
export const VIRTUALIZE_THRESHOLD = 50;

/** Refetch interval for real-time data like notifications (30s) */
export const REALTIME_POLL_MS = 30 * 1000;
