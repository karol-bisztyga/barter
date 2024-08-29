import B2 from 'backblaze-b2';

type BucketType = { bucketName: string; bucketId: string };

const { APP_KEY_ID, APP_KEY, BUCKET_SUFFIX } = process.env;

if (!APP_KEY_ID || !APP_KEY) {
  throw new Error('Missing environment variables');
}

// Initialize the Backblaze B2 client
const b2 = new B2({
  applicationKeyId: APP_KEY_ID, // Your Backblaze Account ID (Application Key ID)
  applicationKey: APP_KEY, // Your Backblaze Application Key
});

async function authenticate() {
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

const getBucketDataByName = async (bucketName: string): Promise<BucketType> => {
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
  await authenticate();
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
