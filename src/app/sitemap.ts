import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/work",
    "/services",
    "/process",
    "/about",
    "/book",
    "/contact",
    "/privacy",
    "/reviews",
    "/statistics",
  ].map((path) => ({ url: `https://www.novuswebsites.com${path}` }));
}
