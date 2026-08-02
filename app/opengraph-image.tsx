import { ImageResponse } from "next/og";

export const alt = "Grantclient — find grants, apply faster, get funded";
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
          alignItems: "center",
          background: "linear-gradient(135deg, #f5fbf8 0%, #ffffff 55%, #edf7f2 100%)",
          color: "#17352a",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, marginBottom: 34 }}>
          Grantclient
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 750,
            letterSpacing: "-2px",
            lineHeight: 1.08,
            maxWidth: 980,
          }}
        >
          Find grants. Apply faster. Get funded.
        </div>
        <div
          style={{
            color: "#4b685e",
            display: "flex",
            fontSize: 28,
            lineHeight: 1.4,
            marginTop: 30,
            maxWidth: 850,
          }}
        >
          AI-powered grant discovery and application tools for nonprofits.
        </div>
      </div>
    ),
    size,
  );
}
