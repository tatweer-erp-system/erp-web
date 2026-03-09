import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { pinService } from "@/services/pin.service";

interface PinLockContextType {
  isLocked: boolean;
  hasPin: boolean | null; // null = still loading from backend
  lock: () => void;
  unlock: (pin: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

export function PinLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  useEffect(() => {
    pinService
      .status()
      .then((r) => setHasPin(r.data?.hasPin ?? false))
      .catch(() => setHasPin(false));
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);

  const unlock = useCallback(async (pin: string) => {
    await pinService.verifyPin(pin); // throws ApiError on wrong PIN
    setIsLocked(false);
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    await pinService.setPin(pin);
    setHasPin(true);
  }, []);

  return (
    <PinLockContext.Provider value={{ isLocked, hasPin, lock, unlock, setupPin }}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const ctx = useContext(PinLockContext);
  if (!ctx) throw new Error("usePinLock must be used within PinLockProvider");
  return ctx;
}
