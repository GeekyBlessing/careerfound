import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// A generated favicon so the browser tab always has a real icon instead of
// the default globe. Mirrors the compass mark used in the nav/app-shell
// logo (bg-accent, white glyph) rather than shipping a separate binary
// asset that could drift from the brand color.
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
          <path d="M15.5 8.5L13 13L8.5 15.5L11 11L15.5 8.5Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
