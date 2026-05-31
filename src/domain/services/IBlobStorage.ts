export interface BlobPutOptions {
  contentType?: string;
  cacheControlMaxAge?: number;
  addRandomSuffix?: boolean;
}

export interface BlobPutResult {
  url: string;
  pathname: string;
  contentType: string | null;
}

export interface IBlobStorage {
  put(
    pathname: string,
    body: Blob | ArrayBuffer | Buffer | ReadableStream,
    opts?: BlobPutOptions,
  ): Promise<BlobPutResult>;
  del(url: string): Promise<void>;
}
