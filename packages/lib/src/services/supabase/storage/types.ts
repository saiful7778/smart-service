import type { SupabaseClient } from "@supabase/supabase-js";

export interface UploadedFile {
  id: string;
  path: string;
  fullPath: string;
  key: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface SignedUploadUrl {
  signedUrl: string;
  token: string;
  path: string;
  key: string;
  expiresAt: Date;
}

export interface IStorageService {
  /** Store a file server-side (used in local/dev) */
  store(
    file: File | Blob,
    filename: string,
    path?: string | null | undefined
  ): Promise<UploadedFile>;

  /** Generate a signed URL for client-side direct upload */
  getSignedUploadUrl(
    filename: string,
    path?: string | null | undefined
  ): Promise<SignedUploadUrl>;
  /** Get a signed download URL for an existing file */
  getSignedDownloadUrl(
    key: string,
    path?: string | null | undefined
  ): Promise<string>;

  /** Delete a file by key */
  delete(key: string, path?: string | null | undefined): Promise<void>;
}

export interface StorageServiceConfigs {
  supabaseClient: SupabaseClient;
  bucket: string;
  uploadExpirySeconds?: number;
  downloadExpirySeconds?: number;
  bucketIsPublic?: boolean;
}
