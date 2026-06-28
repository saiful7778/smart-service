import { SupabaseClient } from "@supabase/supabase-js";

import { BaseStorageService } from "./BaseStorage.service";
import type {
  IStorageService,
  SignedUploadUrl,
  StorageServiceConfigs,
  UploadedFile,
} from "./types";

export class StorageService
  extends BaseStorageService
  implements IStorageService
{
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly uploadExpiry: number;
  private readonly downloadExpiry: number;
  private readonly isPublicBucket: boolean;

  constructor(private readonly configs: StorageServiceConfigs) {
    super();

    this.supabase = configs.supabaseClient;
    this.bucket = configs.bucket;
    this.uploadExpiry = configs?.uploadExpirySeconds || 60;
    this.downloadExpiry = configs?.downloadExpirySeconds || 3600;
    this.isPublicBucket = configs?.bucketIsPublic || false;
  }

  async store(
    file: File | Blob,
    filename: string,
    path?: string | null | undefined
  ): Promise<UploadedFile> {
    const key = this.generateKey(filename);
    const storagePath = path ? `${path}/${key}` : key;

    const { error, data } = await this.supabase.storage
      .from(this.bucket)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const url = await this.getSignedDownloadUrl(key);

    return {
      ...data,
      key,
      url,
      filename,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
    };
  }

  async getSignedDownloadUrl(
    key: string,
    path?: string | null | undefined
  ): Promise<string> {
    const storagePath = path ? `${path}/${key}` : key;

    if (this.isPublicBucket) {
      const { data } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(storagePath);
      return data.publicUrl;
    } else {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(storagePath, this.downloadExpiry);

      if (error) {
        throw new Error(
          `Failed to create signed download URL: ${error.message}`
        );
      }
      return data.signedUrl;
    }
  }

  async getSignedUploadUrl(
    filename: string,
    path?: string | null | undefined
  ): Promise<SignedUploadUrl> {
    const key = this.generateKey(filename);
    const storagePath = path ? `${path}/${key}` : key;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return {
      ...data,
      key,
      expiresAt: new Date(Date.now() + this.uploadExpiry * 1000),
    };
  }

  async delete(key: string, path?: string | null | undefined): Promise<void> {
    const storagePath = path ? `${path}/${key}` : key;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([storagePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
