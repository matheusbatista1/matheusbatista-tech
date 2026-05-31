import { put as vercelPut, del as vercelDel } from "@vercel/blob";
import type { IBlobStorage, BlobPutOptions, BlobPutResult } from "@/domain/services/IBlobStorage";

const PLACEHOLDER_PREFIX = "https://placeholder.local/";

export class VercelBlobStorage implements IBlobStorage {
  private hasToken(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  }

  async put(
    pathname: string,
    body: Blob | ArrayBuffer | Buffer | ReadableStream,
    opts: BlobPutOptions = {},
  ): Promise<BlobPutResult> {
    if (!this.hasToken()) {
      console.warn(
        `[VercelBlobStorage] BLOB_READ_WRITE_TOKEN ausente — gerando placeholder URL para "${pathname}"`,
      );
      return {
        url: `${PLACEHOLDER_PREFIX}${pathname}`,
        pathname,
        contentType: opts.contentType ?? null,
      };
    }
    const result = await vercelPut(pathname, body as Blob | ArrayBuffer | Buffer | ReadableStream, {
      access: "public",
      contentType: opts.contentType,
      cacheControlMaxAge: opts.cacheControlMaxAge,
      addRandomSuffix: opts.addRandomSuffix ?? true,
    });
    return {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType ?? opts.contentType ?? null,
    };
  }

  async del(url: string): Promise<void> {
    if (url.startsWith(PLACEHOLDER_PREFIX)) return;
    if (!this.hasToken()) return;
    await vercelDel(url);
  }
}
