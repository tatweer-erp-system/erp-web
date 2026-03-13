import { useState, useEffect } from "react";
import { usePinLock } from "@/contexts/PinLockContext";

export type OverlayMode = "verify" | "setup" | "confirm";

export function usePinOverlayLogic() {
  const { isLocked, hasPin, unlock, setupPin } = usePinLock();
  const [mode, setMode] = useState<OverlayMode>("verify");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setPin("");
      setFirstPin("");
      setError("");
      setMode(hasPin === false ? "setup" : "verify");
    }
  }, [isLocked, hasPin]);

  async function handleComplete(value: string) {
    if (value.length < 4 || loading) return;

    if (mode === "verify") {
      setLoading(true);
      setError("");
      try {
        await unlock(value);
      } catch {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      } finally {
        setLoading(false);
      }
    } else if (mode === "setup") {
      setFirstPin(value);
      setPin("");
      setMode("confirm");
    } else if (mode === "confirm") {
      if (value !== firstPin) {
        setError("PINs do not match. Please try again.");
        setPin("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        await setupPin(firstPin);
        await unlock(firstPin);
      } catch {
        setError("Failed to set PIN. Please try again.");
        setPin("");
      } finally {
        setLoading(false);
      }
    }
  }

  const title =
    mode === "setup"
      ? "Set your PIN"
      : mode === "confirm"
        ? "Confirm your PIN"
        : "Session Locked";

  const subtitle =
    mode === "setup"
      ? "Create a 4-digit PIN to secure your session"
      : mode === "confirm"
        ? "Re-enter your PIN to confirm"
        : "Enter your PIN to continue";

  return {
    isLocked,
    mode,
    pin,
    setPin,
    error,
    setError,
    loading,
    handleComplete,
    title,
    subtitle,
  };
}
