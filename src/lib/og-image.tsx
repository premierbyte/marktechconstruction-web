import { ImageResponse } from "next/og";
import { getPublicSettings } from "@/features/settings";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export async function renderSiteOgImage(): Promise<ImageResponse> {
  const settings = await getPublicSettings();
  const name = settings?.company?.name || "Construction company";
  const tagline =
    settings?.company?.tagline ||
    settings?.company?.description ||
    "Building with clarity, care and craft.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f2f2a",
          color: "#ffffff",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            letterSpacing: 4,
            color: "#d8b48a",
          }}
        >
          <div style={{ width: 56, height: 4, background: "#d8b48a" }} />
          CONSTRUCTION &amp; ENGINEERING
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>{name}</div>
          <div style={{ fontSize: 30, lineHeight: 1.3, color: "rgba(255,255,255,0.8)", maxWidth: 920 }}>
            {tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
    },
  );
}