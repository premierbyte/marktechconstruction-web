import { OG_CONTENT_TYPE, OG_SIZE, renderSiteOgImage } from "@/lib/og-image";

export const alt = "Construction company profile";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderSiteOgImage();
}