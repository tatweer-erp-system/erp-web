import { useBreakpoint } from "@/hooks/ui/useBreakpoint";

type ModalWidth = string | number;

const BREAKPOINT_WIDTHS: Record<string, ModalWidth> = {
  xs: "100%",
  sm: "100%",
  md: 600,
  lg: 720,
  xl: 800,
  "2xl": 800,
};

/**
 * Returns a responsive modal width based on the current viewport breakpoint.
 *
 * - `xs` / `sm`: fullscreen (`'100%'`)
 * - `md`: 600px
 * - `lg`: 720px
 * - `xl` / `2xl`: 800px (or `maxWidth` if smaller)
 *
 * @param maxWidth - Optional upper bound for the modal width.
 */
export function useModalWidth(maxWidth?: number): ModalWidth {
  const { breakpoint } = useBreakpoint();
  const width = BREAKPOINT_WIDTHS[breakpoint] ?? 600;

  if (typeof width === "string") return width;
  if (maxWidth !== undefined && maxWidth < width) return maxWidth;

  return width;
}
