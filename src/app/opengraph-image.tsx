import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366F1, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#FAFAFA", letterSpacing: -1 }}>
            Outreachly
          </span>
        </div>

        {/* Headline */}
        <p
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#FAFAFA",
            textAlign: "center",
            maxWidth: 800,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: -1.5,
          }}
        >
          Cold outreach that actually converts
        </p>

        {/* Sub */}
        <p
          style={{
            fontSize: 22,
            color: "#71717A",
            textAlign: "center",
            maxWidth: 600,
            marginTop: 20,
            lineHeight: 1.5,
          }}
        >
          AI-personalized emails for every lead. Auto follow-up sequences. Real-time analytics.
        </p>

        {/* CTA pill */}
        <div
          style={{
            marginTop: 36,
            padding: "14px 32px",
            background: "linear-gradient(135deg, #6366F1, #7C3AED)",
            borderRadius: 14,
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: -0.3,
          }}
        >
          Start free — no credit card required
        </div>
      </div>
    ),
    { ...size }
  );
}
