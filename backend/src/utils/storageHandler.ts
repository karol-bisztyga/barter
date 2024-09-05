import B2 from 'backblaze-b2';
import { Client } from 'minio';

export type BucketType = { bucketName: string; bucketId: string };

export interface StorageHandler {
  client: B2 | Client;

  listObjectsInBucket: (bucketId: string) => Promise<unknown>;
  getBucketDataByName: (bucketName: string) => Promise<BucketType>;
  composeBucketUrl: (bucketName: string) => Promise<string>;
  uploadFile: (bucketName: string, targetFileName: string, fileContent: string) => Promise<string>;
  deleteFile: (bucketId: string, fileName: string) => Promise<void>;
}
