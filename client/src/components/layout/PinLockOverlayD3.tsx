import { useState, useEffect, useCallback } from "react";
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { Avatar, Spin, Typography } from "antd";
import { usePinOverlayLogic } from "@/hooks/usePinOverlayLogic";

const { Text } = Typography;

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

// ─── Design 3: Phone / Device Lock Screen ────────────────────────────────────
export function PinLockOverlayD3() {
  const { isLocked, pin, setPin, error, setError, loading, handleComplete, title, subtitle } =
    usePinOverlayLogic();

  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) handleComplete(pin);
  }, [pin]);

  // Keyboard input
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key >= "0" && e.key <= "9") {
        setPin((p) => (p.length < 4 ? p + e.key : p));
        setError("");
      } else if (e.key === "Backspace") {
        setPin((p) => p.slice(0, -1));
        setError("");
      }
    },
    [loading, setPin, setError]
  );

  useEffect(() => {
    if (!isLocked) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isLocked, handleKey]);

  if (!isLocked) return null;

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function pressKey(key: string) {
    if (loading) return;
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
    } else if (key !== "") {
      setPin((p) => (p.length < 4 ? p + key : p));
      setError("");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #0a0f1e 0%, #111827 50%, #0d1117 100%)",
        padding: "52px 24px 48px",
        overflow: "hidden",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top: Clock ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 200,
            color: "#fff",
            letterSpacing: -2,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hours}
          <span style={{ opacity: 0.6, animation: "blink 1s step-end infinite" }}>:</span>
          {minutes}
        </div>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, display: "block" }}>
          {dateStr}
        </Text>
      </div>

      {/* ── Middle: Avatar + PIN dots ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Avatar
          size={72}
          icon={<UserOutlined />}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            fontWeight: 700,
            fontSize: 26,
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}
        />

        <div>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: 600, display: "block", textAlign: "center" }}>
            John Doe
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, display: "block", textAlign: "center", marginTop: 2 }}>
            {title}
          </Text>
        </div>

        {/* 4 dots */}
        <Spin spinning={loading} indicator={<span />}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: i < pin.length ? "#fff" : "transparent",
                  border: `2px solid ${
                    error
                      ? "rgba(239,68,68,0.8)"
                      : i < pin.length
                      ? "#fff"
                      : "rgba(255,255,255,0.35)"
                  }`,
                  transition: "background 0.15s, border-color 0.15s",
                  boxShadow: i < pin.length ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                }}
              />
            ))}
          </div>
        </Spin>

        {error && (
          <Text style={{ color: "rgba(239,68,68,0.9)", fontSize: 12, textAlign: "center" }}>
            {error}
          </Text>
        )}

        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{subtitle}</Text>
      </div>

      {/* ── Bottom: Numeric keypad ────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          width: "100%",
          maxWidth: 280,
        }}
      >
        {KEYPAD.map((key, idx) => {
          const isEmpty = key === "";
          const isBackspace = key === "⌫";

          return (
            <button
              key={idx}
              onClick={() => pressKey(key)}
              disabled={isEmpty || loading}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                border: "none",
                background: isEmpty
                  ? "transparent"
                  : isBackspace
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: isBackspace ? 18 : 24,
                fontWeight: isBackspace ? 400 : 300,
                cursor: isEmpty ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s, transform 0.1s",
                backdropFilter: isEmpty ? "none" : "blur(4px)",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isEmpty)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    isBackspace ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                if (!isEmpty)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    isBackspace ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)";
              }}
              onMouseDown={(e) => {
                if (!isEmpty) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)";
              }}
              onMouseUp={(e) => {
                if (!isEmpty) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              {isBackspace ? <DeleteOutlined /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
