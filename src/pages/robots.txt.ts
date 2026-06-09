import { categories, site } from "../data/site";

export function GET() {
  const sitemap = new URL("/sitemap.xml", site.baseUrl).toString();
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      ...categories.map((category) => `Allow: /catalogos/${category.slug}`),
      `Sitemap: ${sitemap}`,
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
