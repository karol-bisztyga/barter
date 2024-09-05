import B2 from 'backblaze-b2';
import { BucketType, StorageHandler } from './storageHandler';

export class StorageHandlerBackBlaze implements StorageHandler {
  client: B2;
  accountId: string = '';

  constructor() {
    const { STORAGE_APP_KEY_ID, STORAGE_APP_KEY } = process.env;

    if (!STORAGE_APP_KEY_ID || !STORAGE_APP_KEY) {
      throw new Error('Missing environment variables for storage');
    }
    this.client = new B2({
      applicationKeyId: STORAGE_APP_KEY_ID,
      applicationKey: STORAGE_APP_KEY,
    });
  }

  async authenticate() {
    const r = await this.client.authorize();
    console.log('Authenticated successfully');
    this.accountId = r.data.accountId;
  }

  async listObjectsInBucket(bucketId: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    const response = await this.client.listFileNames({
      bucketId,
      startFileName: '',
      maxFileCount: 1000,
      delimiter: '',
      prefix: '',
    });
    return response.data.files;
  }

  async listBuckets() {
    if (!this.accountId) {
      await this.authenticate();
    }
    const response = await this.client.listBuckets();
    return response.data.buckets.map((bucket: BucketType) => {
      return { bucketName: bucket.bucketName, bucketId: bucket.bucketId };
    });
  }

  async getBucketDataByName(bucketName: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    const bucketId = (await this.listBuckets()).find(
      (bucket: BucketType) => bucket.bucketName === bucketName
    );
    if (!bucketId) {
      throw new Error('bucket id not found for bucket name ' + bucketName);
    }
    return bucketId;
  }

  async composeBucketUrl(bucketName: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    const { BUCKET_SUFFIX } = process.env;
    const suffix = BUCKET_SUFFIX ? `-${BUCKET_SUFFIX}` : '';
    return `${bucketName}${suffix}`;
  }

  async uploadFile(bucketName: string, targetFileName: string, fileContent: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    const { bucketId } = await this.getBucketDataByName(bucketName);
    const fileBuffer = Buffer.from(fileContent, 'base64');
    const uploadUrlResponse = await this.client.getUploadUrl({ bucketId });
    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;
    const uploadResponse = await this.client.uploadFile({
      uploadUrl,
      uploadAuthToken,
      fileName: targetFileName,
      data: fileBuffer,
    });

    return uploadResponse.data.fileId;
  }

  private async checkIfFileExists(bucketId: string, fileName: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    const listResponse = await this.client.listFileNames({
      bucketId,
      startFileName: fileName,
      maxFileCount: 1,
      delimiter: '',
      prefix: '',
    });
    if (listResponse.data.files.length && listResponse.data.files[0].fileName === fileName) {
      return listResponse.data.files[0];
    }
    return null;
  }

  async deleteFile(bucketId: string, fileName: string) {
    if (!this.accountId) {
      await this.authenticate();
    }
    let i = 0;
    for (;;) {
      const fileResponse = await this.checkIfFileExists(bucketId, fileName);
      console.log('> checking if file exists', fileResponse?.fileName, fileResponse?.fileId);
      if (!fileResponse) {
        break;
      }

      console.log('> removing file iteration', ++i, fileResponse.fileName, fileName);

      await this.client.deleteFileVersion({
        fileId: fileResponse.fileId,
        fileName: fileResponse.fileName,
      });
    }
    console.log('done removing file', fileName);
  }
}
