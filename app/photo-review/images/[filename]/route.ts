import { lstat, readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, join, relative } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ filename: string }>;
}

function missingImage(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  if (process.env.NODE_ENV !== "development") return missingImage();
  const { filename } = await params;
  if (!/^[a-f0-9]{12}-(320|800|1600)\.webp$/.test(filename)) return missingImage();

  const derivativesPath = join(process.cwd(), ".photo-intake", "derivatives");
  try {
    if ((await lstat(derivativesPath)).isSymbolicLink()) return missingImage();
    const derivativesRoot = await realpath(derivativesPath);
    const imagePath = await realpath(join(derivativesRoot, filename));
    const withinRoot = relative(derivativesRoot, imagePath);
    if (!withinRoot || withinRoot.startsWith("..") || isAbsolute(withinRoot)) return missingImage();

    const imageStat = await stat(imagePath);
    if (!imageStat.isFile() || imageStat.size > 12 * 1024 * 1024) return missingImage();
    const bytes = await readFile(imagePath);
    if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
      return missingImage();
    }

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return missingImage();
  }
}
