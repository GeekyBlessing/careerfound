import { ImageResponse } from "next/og";
import { BRAND_MARK_VIEWBOX, MARK_CONNECTOR, MARK_DIAMOND_FOUNDATION, MARK_DIAMOND_PROGRESS } from "@/lib/brand-mark";

// iOS home-screen icon. iOS applies its own corner rounding, so this fills
// edge-to-edge with the brand tile rather than pre-rounding the corners.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5D6F34",
        }}
      >
        <svg width="112" height="112" viewBox={BRAND_MARK_VIEWBOX}>
          <line
            x1={MARK_CONNECTOR.x1}
            y1={MARK_CONNECTOR.y1}
            x2={MARK_CONNECTOR.x2}
            y2={MARK_CONNECTOR.y2}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={2.25}
            strokeLinecap="round"
          />
          <polygon points={MARK_DIAMOND_FOUNDATION} fill="white" />
          <polygon points={MARK_DIAMOND_PROGRESS} fill="rgba(255,255,255,0.72)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
