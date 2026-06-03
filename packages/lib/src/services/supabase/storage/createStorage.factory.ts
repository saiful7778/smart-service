import { StorageService } from "./Storage.service";
import type { IStorageService, StorageServiceConfigs } from "./types";

export function createStorage({
  supabaseClient,
  bucket,
  uploadExpirySeconds = 60,
  downloadExpirySeconds = 3600,
  bucketIsPublic = false,
}: StorageServiceConfigs): IStorageService {
  return new StorageService({
    supabaseClient,
    bucket,
    uploadExpirySeconds,
    downloadExpirySeconds,
    bucketIsPublic,
  });
}
