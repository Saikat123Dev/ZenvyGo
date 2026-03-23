import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-data";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at top left, rgba(34,211,238,0.24), transparent 34%), radial-gradient(circle at top right, rgba(168,85,247,0.22), transparent 30%), linear-gradient(180deg, #02050c 0%, #04070d 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(circle at center, black 20%, transparent 82%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "84px",
                height: "84px",
                borderRadius: "28px",
                background:
                  "linear-gradient(135deg, #3b82f6 0%, #22d3ee 52%, #e879f9 100%)",
                fontSize: "38px",
                fontWeight: 700,
              }}
            >
              Z
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 700 }}>
                {siteConfig.name}
              </div>
              <div style={{ fontSize: 20, color: "#9fb2cb" }}>
                {siteConfig.tagline}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: "920px",
            }}
          >
            <div style={{ fontSize: 68, lineHeight: 1.02, fontWeight: 700 }}>
              Privacy-first vehicle contact for real-world parking and safety issues.
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.45, color: "#cad7ec" }}>
              Verified owner onboarding, QR-tagged vehicles, structured contact requests,
              alert history, and emergency-ready vehicle profiles.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            {[
              "Verified owners",
              "Vehicle QR tags",
              "Public request logging",
              "Alerts and emergency profiles",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "14px 20px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 20,
                  color: "#e2ebf8",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
