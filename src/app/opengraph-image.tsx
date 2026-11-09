import { ImageResponse } from "next/og";
import { profile } from "@/content/site";

export const alt = `${profile.name}: ${profile.roles.join(", ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "#0a0d14",
          color: "#e7e9f0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#8d94a8" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#7c9cff" }} />
          Portfolio
        </div>
        <div style={{ fontSize: 132, lineHeight: 1, marginTop: 24, letterSpacing: -3 }}>{profile.name}</div>
        <div style={{ fontSize: 40, marginTop: 28, color: "#7c9cff" }}>{profile.roles.join(" / ")}</div>
      </div>
    ),
    size,
  );
}
