const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteBucketCommand,
  PutBucketPolicyCommand,
  CreateBucketCommand,
  PutObjectCommand,
  ListBucketsCommand,
  ListObjectsCommand,
} = require('@aws-sdk/client-s3');

const { generateImageAndFetch } = require('./imageMocker');

// Configuring the S3 client to connect to MinIO
const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'barter',
    secretAccessKey: 'minio_barter',
  },
  forcePathStyle: true, // Required for MinIO
});

const createBucket = async (bucketName) => {
  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);

    // Step 2: Set the bucket policy to make it public
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    const putBucketPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy),
    });

    await s3Client.send(putBucketPolicyCommand);
  } catch (err) {
    console.error('Error creating bucket:', err);
  }
};

const listBuckets = async () => {
  try {
    // Creating the command
    const command = new ListBucketsCommand({});

    // Sending the command and getting the response
    const response = await s3Client.send(command);

    // Logging the list of buckets
    return response.Buckets;
  } catch (err) {
    console.error('Error listing buckets:', err);
  }
};

const uploadFile = async (bucketName, fileName, fileContent, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType,
    });
    return await s3Client.send(command);
  } catch (err) {
    console.error('Error uploading file:', err);
  }
};

const listObjects = async (bucketName) => {
  try {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    return await s3Client.send(command);
  } catch (err) {
    console.error('Error listing objects:', err);
  }
};

const createBuckets = async (bucketNames) => {
  const existingBuckets = (await listBuckets()).map((bucket) => bucket.Name);

  console.log('creating buckets...');
  for (const bucketName of bucketNames) {
    console.log(`bucket ${bucketName}`);
    if (existingBuckets.includes(bucketName)) {
      console.log(`   already exists, skipping`);
      continue;
    }
    console.log(`   creating...`);
    await createBucket(bucketName);
    console.log(`   created`);
  }
  console.log('done creating buckets');
};

const uploadRandomImage = async (bucketName, targetFileName) => {
  const { response } = await generateImageAndFetch();
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  await uploadFile(bucketName, targetFileName, imageBuffer, response.headers.get('content-type'));

  const endpoint = await s3Client.config.endpoint();
  const imageUrl = `${endpoint.protocol}//${endpoint.hostname}:${endpoint.port}/${bucketName}/${targetFileName}`;
  console.log(`Image uploaded successfully. Image URL: ${imageUrl}`);
  return imageUrl;
};

const deleteBucket = async (bucketName) => {
  try {
    // Step 1: List all objects in the bucket
    const objectsInBucket = await listObjects(bucketName);

    if (objectsInBucket.Contents && objectsInBucket.Contents.length > 0) {
      // Step 2: If there are objects, delete them
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: objectsInBucket.Contents.map((item) => ({ Key: item.Key })),
        },
      };

      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await s3Client.send(deleteCommand);
    }

    // Step 3: Delete the bucket
    const deleteBucketCommand = new DeleteBucketCommand({ Bucket: bucketName });
    await s3Client.send(deleteBucketCommand);
  } catch (err) {
    console.error('Error deleting bucket:', err);
  }
};

const deleteAllBuckets = async () => {
  const existingBuckets = (await listBuckets()).map((bucket) => bucket.Name);
  for (let bucket of existingBuckets) {
    console.log(`bucket ${bucket}`);
    console.log(`   removing...`);
    await deleteBucket(bucket);
    console.log(`   removed...`);
  }
};

(async () => {
  const args = process.argv.slice(2);
  const option = args[0];

  const bucketNames = ['profile-pictures', 'items-images'];

  switch (option) {
    case '--reset':
      console.log('storage reset...');
      await deleteAllBuckets();
      await createBuckets(bucketNames);
      break;
    case '--clean':
      console.log('storage clean...');
      await deleteAllBuckets();
      break;
    case '--setup':
      // setup storage
      console.log('storage setup...');
      await createBuckets(bucketNames);
      break;
  }
})();

module.exports = { uploadRandomImage };
