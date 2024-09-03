import B2 from 'backblaze-b2';

type BucketType = { bucketName: string; bucketId: string };

const { STORAGE_APP_KEY_ID, STORAGE_APP_KEY, BUCKET_SUFFIX } = process.env;

if (!STORAGE_APP_KEY_ID || !STORAGE_APP_KEY) {
  throw new Error('Missing environment variables for storage');
}

// Initialize the Backblaze B2 client
const b2 = new B2({
  applicationKeyId: STORAGE_APP_KEY_ID, // Your Backblaze Account ID (Application Key ID)
  applicationKey: STORAGE_APP_KEY, // Your Backblaze Application Key
});

export async function b2Authenticate() {
  try {
    const r = await b2.authorize(); // This authenticates your application with B2
    console.log('Authenticated successfully');
    return r.data.accountId;
  } catch (error) {
    console.error('Error authenticating with Backblaze B2:', error);
  }
}

async function listBuckets() {
  try {
    const response = await b2.listBuckets();
    return response.data.buckets.map((bucket: BucketType) => {
      return { bucketName: bucket.bucketName, bucketId: bucket.bucketId };
    });
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

export async function listObjectsInBucket(bucketId: string) {
  try {
    const response = await b2.listFileNames({
      bucketId,
      startFileName: '',
      maxFileCount: 1000,
      delimiter: '',
      prefix: '',
    });
    return response.data.files;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error listing objects:', error.response.data);
  }
}

export const getBucketDataByName = async (bucketName: string): Promise<BucketType> => {
  const bucketId = (await listBuckets()).find(
    (bucket: BucketType) => bucket.bucketName === bucketName
  );
  if (!bucketId) {
    throw new Error('bucket id not found for bucket name ' + bucketName);
  }
  return bucketId;
};

export const composeBucketUrl = (bucketName: string) => {
  return `${bucketName}-${BUCKET_SUFFIX}`;
};

export const uploadFile = async (
  bucketName: string,
  targetFileName: string,
  fileContent: string
) => {
  const { bucketId } = await getBucketDataByName(bucketName);
  const fileBuffer = Buffer.from(fileContent, 'base64');
  const uploadUrlResponse = await b2.getUploadUrl({ bucketId });
  const uploadUrl = uploadUrlResponse.data.uploadUrl;
  const uploadAuthToken = uploadUrlResponse.data.authorizationToken;
  const uploadResponse = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken,
    fileName: targetFileName,
    data: fileBuffer,
  });

  return uploadResponse.data.fileId;
};

const checkIfFileExists = async (bucketId: string, fileName: string) => {
  const listResponse = await b2.listFileNames({
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
};

export const deleteFile = async (bucketId: string, fileName: string) => {
  let i = 0;
  for (;;) {
    const fileResponse = await checkIfFileExists(bucketId, fileName);
    console.log('> checking if file exists', fileResponse?.fileName, fileResponse?.fileId);
    if (!fileResponse) {
      break;
    }

    console.log('> removing file iteration', ++i, fileResponse.fileName, fileName);

    await b2.deleteFileVersion({
      fileId: fileResponse.fileId,
      fileName: fileResponse.fileName,
    });
  }
  console.log('done removing file', fileName);
};
