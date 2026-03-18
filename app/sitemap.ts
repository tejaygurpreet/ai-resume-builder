import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://optimacv.io",
      lastModified: new Date(),
    },
    {
      url: "https://optimacv.io/pricing",
      lastModified: new Date(),
    },
    {
      url: "https://optimacv.io/templates",
      lastModified: new Date(),
    },
  ];
}
