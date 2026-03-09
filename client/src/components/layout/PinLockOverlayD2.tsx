import { useEffect } from "react";
import { LockOutlined, UserOutlined, SafetyOutlined } from "@ant-design/icons";
import { Avatar, Spin, theme as antTheme, Typography, Divider } from "antd";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { usePinOverlayLogic } from "@/hooks/usePinOverlayLogic";

const { Text, Title } = Typography;

// ─── Design 2: Full-Screen Split Panel ───────────────────────────────────────
export function PinLockOverlayD2() {
  const { token } = antTheme.useToken();
  const { isLocked, pin, setPin, error, setError, loading, handleComplete, title, subtitle } =
    usePinOverlayLogic();

  useEffect(() => {
    if (pin.length === 4) handleComplete(pin);
  }, [pin]);

  if (!isLocked) return null;

  const leftGradient = `linear-gradient(150deg, ${token.colorPrimaryActive} 0%, ${token.colorPrimary} 55%, ${token.colorPrimaryHover} 100%)`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 880,
          height: 520,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Left Panel ─────────────────────────────────────────────────── */}
        <div
          style={{
            flex: "0 0 45%",
            background: leftGradient,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: "48px 44px",
          }}
        >
          {/* Decorative circles */}
          {[
            { size: 380, top: -140, right: -120, opacity: 0.12 },
            { size: 220, bottom: -60, left: -80, opacity: 0.1 },
            { size: 140, top: "38%", right: 30, opacity: 0.08 },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: c.size,
                height: c.size,
                borderRadius: "50%",
                background: "white",
                opacity: c.opacity,
                top: c.top,
                bottom: c.bottom,
                left: c.left,
                right: c.right,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Lock badge */}
          <div
            style={{
              position: "absolute",
              top: 44,
              left: 44,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <LockOutlined style={{ fontSize: 22, color: "#fff" }} />
          </div>

          {/* Bottom text */}
          <div>
            <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 700, lineHeight: 1.2 }}>
              Session<br />Locked
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, display: "block", marginTop: 12, lineHeight: 1.6 }}>
              Your session has been locked<br />for security purposes.
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 24 }}>
              <SafetyOutlined style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }} />
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                Tatweer ERP — Secured
              </Text>
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: token.colorBgContainer,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 52px",
            gap: 24,
          }}
        >
          {/* Avatar + greeting */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                fontWeight: 700,
                fontSize: 22,
                boxShadow: `0 6px 16px ${token.colorPrimary}40`,
              }}
            />
            <Text strong style={{ fontSize: 17, marginTop: 4 }}>Welcome back, John</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>admin@tatweer.io</Text>
          </div>

          <Divider style={{ margin: "4px 0" }} />

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Text strong style={{ fontSize: 16, display: "block", marginBottom: 4 }}>{title}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>
            </div>

            <Spin spinning={loading}>
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(v) => { setPin(v); setError(""); }}
              >
                <InputOTPGroup style={{ gap: 14 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      style={{
                        width: 58,
                        height: 58,
                        fontSize: 24,
                        borderRadius: 14,
                        border: `2px solid ${error ? token.colorError : token.colorBorder}`,
                        background: token.colorFillTertiary,
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
      </div>
    </div>
  );
}
