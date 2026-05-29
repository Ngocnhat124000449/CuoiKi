// Resolve a product image (Commons → placeholder fallback) and push it to Cloudinary.
// Self-contained Cloudinary config so it works under ts-node regardless of import order
// (the shared src/lib/cloudinary.ts configures at import time, before dotenv runs).

import { v2 as cloudinary } from "cloudinary";
import { searchCommonsImages, pickBestCommons, wikimediaFetch } from "./commons";

function ensureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Placeholder URL (always works, no API key) showing the product name.
function placeholderUrl(name: string): string {
  return `https://placehold.co/800x800/e9eef5/1f2937/png?text=${encodeURIComponent(name)}`;
}

// Query variants so finicky Commons search still finds exact models. We intentionally do NOT
// drop the brand token (dropping it caused matches like "George VI" for "Xperia 1 VI").
function queryVariants(primary: string, extra: string[] = []): string[] {
  const variants = [primary, ...extra];
  const noHyphen = primary.replace(/-/g, " ");
  if (noHyphen !== primary) variants.push(noHyphen);
  return [...new Set(variants.filter(Boolean))];
}

async function toDataUri(res: Response): Promise<string> {
  const mime = res.headers.get("content-type") ?? "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function uploadDataUri(dataUri: string, slug: string) {
  ensureCloudinary();
  return cloudinary.uploader.upload(dataUri, {
    folder: "phoneshop/products",
    public_id: slug,
    overwrite: true,
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
}

// Find the best matching Commons photo across query variants (skip = try a later photo).
async function findCommons(query: string, extraQueries: string[] | undefined, skip: number) {
  for (const q of queryVariants(query, extraQueries)) {
    const picked = pickBestCommons(query, await searchCommonsImages(q), skip);
    if (picked) return { url: picked.url, title: picked.title };
  }
  return null;
}

export type UploadedImage = {
  source: "commons" | "placeholder";
  secureUrl: string;
  width: number;
  height: number;
  title?: string;
};

// Resolve + upload a product image. Always returns an image: a matching Commons photo when
// one is found and downloads cleanly, otherwise a name-labelled placeholder.
export async function uploadProductImage(
  name: string,
  query: string,
  slug: string,
  opts: { skip?: number; extraQueries?: string[] } = {},
): Promise<UploadedImage> {
  const skip = opts.skip ?? 0;

  const commons = await findCommons(query, opts.extraQueries, skip);
  if (commons) {
    try {
      const res = await wikimediaFetch(commons.url);
      if (res.ok) {
        const up = await uploadDataUri(await toDataUri(res), slug);
        return { source: "commons", secureUrl: up.secure_url, width: up.width, height: up.height, title: commons.title };
      }
    } catch {
      // fall through to placeholder
    }
  }

  const res = await fetch(placeholderUrl(name));
  const up = await uploadDataUri(await toDataUri(res), slug);
  return { source: "placeholder", secureUrl: up.secure_url, width: up.width, height: up.height };
}
