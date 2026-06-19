import path from "path";

/**
 * Dynamically resolves file and directory paths.
 * If running on Vercel, paths under the "data" directory are redirected to the writable /tmp directory.
 * Locally, it resolves paths relative to the current working directory.
 */
export function resolveDataPath(relativePath: string): string {
  if (process.env.VERCEL === "1") {
    // Strip leading "data/" or "data" if present to avoid nested structures in /tmp
    const cleanRelative = relativePath.replace(/^data\/?/, "");
    return path.join("/tmp", cleanRelative);
  }
  return path.resolve(process.cwd(), relativePath);
}
