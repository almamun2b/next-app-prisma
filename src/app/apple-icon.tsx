import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f6b6f",
      }}
    >
      <svg width="110" height="110" viewBox="0 0 32 32">
        <path
          d="M11 8v16M11 16l9-8M14.5 13l6 11"
          stroke="#f7fbfb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>,
    size,
  );
}
