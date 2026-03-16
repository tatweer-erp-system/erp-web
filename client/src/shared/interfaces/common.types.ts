/**
 * Common reusable types shared across all modules.
 */

import type { ReactNode } from "react";

/** Base entity with bilingual name fields */
export type BilingualEntity = {
  id: string;
  nameEn: string;
  nameAr: string;
};

/** Option shape for select dropdowns and autocompletes */
export type SelectOption<TValue = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

/** Column definition for AppTable and similar table components */
export type TableColumn<TRow = unknown> = {
  key: string;
  titleKey: string;
  dataIndex?: keyof TRow & string;
  sortable?: boolean;
  width?: number | string;
  align?: "start" | "center" | "end";
  render?: (value: unknown, record: TRow, index: number) => ReactNode;
};

/** Props shared by all modal components (AppModal pattern) */
export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children?: ReactNode;
};

/** Form mode discriminator */
export type FormMode = "create" | "edit" | "view";

/** Bilingual description fields (optional on most entities) */
export type BilingualDescription = {
  descriptionEn?: string | null;
  descriptionAr?: string | null;
};

/** Full bilingual entity with optional description */
export type BilingualEntityFull = BilingualEntity & BilingualDescription;

/** Generic record with timestamps from the API */
export type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

/** Optimistic-locking version field */
export type Versioned = {
  version: number;
};
