import { useAppSettings } from "@/contexts/AppSettingsContext";
import { PinLockOverlayD1 } from "./PinLockOverlayD1";
import { PinLockOverlayD2 } from "./PinLockOverlayD2";
import { PinLockOverlayD3 } from "./PinLockOverlayD3";

export function PinLockOverlay() {
  const { pinStyle } = useAppSettings();
  if (pinStyle === 1) return <PinLockOverlayD1 />;
  if (pinStyle === 2) return <PinLockOverlayD2 />;
  return <PinLockOverlayD3 />;
}
