import { catalogProducts, categories, site } from "../data/site";

export function GET() {
  const routes = [
    "/",
    "/catalogos",
    ...categories.map((category) => `/catalogos/${category.slug}`),
    ...catalogProducts.map((product) => product.href),
    "/galeria",
    "/videos",
    "/eventos",
    "/nosotros",
    "/contacto",
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => `  <url><loc>${new URL(route, site.baseUrl).toString()}</loc></url>`)
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
