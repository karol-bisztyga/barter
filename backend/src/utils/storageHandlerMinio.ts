import { StorageHandler } from './storageHandler';
import { Client } from 'minio';

type BucketType = { bucketName: string; bucketId: string };

export class StorageHandlerMinio implements StorageHandler {
  client: Client;

  constructor() {
    const { MINIO_USER, MINIO_PASSWORD } = process.env;

    if (!MINIO_USER || !MINIO_PASSWORD) {
      throw new Error('Missing environment variables for storage');
    }

    this.client = new Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: MINIO_USER,
      secretKey: MINIO_PASSWORD,
    });
  }

  // this is dumb but I didn't see any ids in minio so we can go ahead and use bucket names I guess
  getBucketNameById(bucketId: string) {
    return bucketId;
  }

  async listObjectsInBucket(bucketId: string) {
    const bucketName = this.getBucketNameById(bucketId);
    const stream = this.client.listObjects(bucketName, '', true);
    const objects: string[] = [];
    await (async () => {
      return new Promise((resolve, reject) => {
        stream.on('data', (data) => {
          data.name && objects.push(data.name);
        });
        stream.on('error', reject);
        stream.on('end', resolve);
      });
    })();
    return objects;
  }

  async listBuckets() {
    const response = await this.client.listBuckets();
    return response.map((bucket: { name: string }) => {
      return { bucketName: bucket.name, bucketId: bucket.name };
    });
  }

  async getBucketDataByName(bucketName: string) {
    const buckets = ((await this.listBuckets()) || []).find(
      (bucket: BucketType) => bucket.bucketName === bucketName
    );
    if (!buckets) {
      throw new Error('bucket id not found for bucket name ' + bucketName);
    }
    return buckets;
  }

  async composeBucketUrl(bucketName: string) {
    const { BUCKET_SUFFIX } = process.env;
    const suffix = BUCKET_SUFFIX ? `-${BUCKET_SUFFIX}` : '';
    return `${bucketName}${suffix}`;
  }

  async uploadFile(bucketName: string, targetFileName: string, fileContent: string) {
    const fileBuffer = Buffer.from(fileContent, 'base64');
    await this.client.putObject(bucketName, targetFileName, fileBuffer);
    return '';
  }

  async deleteFile(bucketId: string, fileName: string) {
    const bucketName = await this.getBucketNameById(bucketId);
    await this.client.removeObject(bucketName, fileName);
  }
}
