import { useEffect } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Spin, theme as antTheme, Typography } from "antd";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { usePinOverlayLogic } from "@/hooks/usePinOverlayLogic";

const { Text } = Typography;

// ─── Design 1: Minimal Frosted-Glass Card ────────────────────────────────────
export function PinLockOverlayD1() {
  const { token } = antTheme.useToken();
  const { isLocked, pin, setPin, error, setError, loading, handleComplete, title, subtitle } =
    usePinOverlayLogic();

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) handleComplete(pin);
  }, [pin]);

  if (!isLocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 20,
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          width: 380,
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Lock icon ring */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${token.colorPrimary}18`,
            border: `2px solid ${token.colorPrimary}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockOutlined style={{ fontSize: 26, color: token.colorPrimary }} />
        </div>

        {/* Avatar + user */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Avatar
            size={52}
            icon={<UserOutlined />}
            style={{
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: `0 4px 12px ${token.colorPrimary}50`,
            }}
          />
          <Text strong style={{ fontSize: 15, marginTop: 4 }}>John Doe</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>admin@tatweer.io</Text>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <Text strong style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{title}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>
        </div>

        {/* PIN slots */}
        <Spin spinning={loading}>
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(v) => { setPin(v); setError(""); }}
          >
            <InputOTPGroup style={{ gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={error ? "border-red-500" : ""}
                  style={{
                    width: 56,
                    height: 56,
                    fontSize: 22,
                    borderRadius: 12,
                    border: `2px solid ${error ? token.colorError : token.colorBorder}`,
                    background: token.colorFillSecondary,
                  }}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Spin>

        {error && (
          <Text type="danger" style={{ fontSize: 12, textAlign: "center" }}>
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
