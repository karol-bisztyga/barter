const B2 = require('backblaze-b2');
const { generateImageAndFetch } = require('./imageMocker');
require('dotenv').config();

const { APP_KEY_ID, APP_KEY, BUCKET_SUFFIX, STORAGE_FILES_BASE_URL } = process.env;

// Initialize the Backblaze B2 client
const b2 = new B2({
  applicationKeyId: APP_KEY_ID, // Your Backblaze Account ID (Application Key ID)
  applicationKey: APP_KEY, // Your Backblaze Application Key
});

// Create a bucket
async function createBucket(bucketName) {
  throw new Error(
    'buckets should be created manually with the lifecycle option `Keep only the last version of the file`'
  );
  try {
    const response = await b2.createBucket({
      bucketName,
      bucketType: 'allPublic', // You can also use 'allPublic'
    });
    console.log(`Bucket created: ${response.data.bucketId}`);
    return response.data.bucketId;
  } catch (error) {
    console.error('Error creating bucket:', error.response.data);
  }
}

// List all buckets
async function listBuckets() {
  try {
    const response = await b2.listBuckets();
    return response.data.buckets.map((bucket) => {
      return { name: bucket.bucketName, id: bucket.bucketId };
    });
  } catch (error) {
    console.error('Error listing buckets:', error.response.data);
  }
}

async function uploadFile(bucketId, fileName, fileBuffer) {
  try {
    // Get upload URL and authorization token
    const uploadUrlResponse = await b2.getUploadUrl({ bucketId });
    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    // Upload the file
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken,
      fileName,
      data: fileBuffer,
    });

    return uploadResponse.data.fileId;
  } catch (error) {
    console.error('Error uploading file:', error.response.data);
  }
}

async function removeDuplicateFiles(bucketId, baseFileName) {
  try {
    // Step 1: Authorize with Backblaze B2
    await b2.authorize();

    // Step 2: List files in the bucket that match the baseFileName pattern
    const filesResponse = await b2.listFileNames({
      bucketId,
      prefix: baseFileName,
    });

    const files = filesResponse.data.files;

    // Regex to match file names with numbers in parentheses (e.g., "file.jpg", "file.jpg (2)")
    const regex = new RegExp(`^${baseFileName}( \\(\\d+\\))?$`);

    // Step 3: Filter and delete matching files
    for (const file of files) {
      if (regex.test(file.fileName)) {
        console.log(`Deleting file: ${file.fileName}`);
        await b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        });
        console.log(`Deleted: ${file.fileName}`);
      }
    }

    console.log('All duplicates removed successfully.');
  } catch (error) {
    console.error('Error removing files:', error);
  }
}

// List all objects in a bucket
async function listObjects(bucketId) {
  try {
    const response = await b2.listFileNames({ bucketId });
    return response.data.files;
  } catch (error) {
    console.error('Error listing objects:', error.response.data);
  }
}

// Delete a specific file in a bucket
async function deleteFile(bucketId, fileName) {
  try {
    // Get file ID for the file you want to delete
    const response = await b2.listFileNames({
      bucketId,
      maxFileCount: 1,
      prefix: fileName, // Using the filename as prefix to narrow down
    });

    if (response.data.files.length === 0) {
      console.log(`File ${fileName} not found in bucket ${bucketId}`);
      return;
    }

    const fileId = response.data.files[0].fileId;

    // Delete the file
    await b2.deleteFileVersion({
      fileId,
      fileName,
    });

    console.log(`File ${fileName} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting file:', error.response?.data || error.message);
  }
}

async function deleteAllFilesInBucket(bucketId) {
  let objectsInBucket = await listObjects(bucketId);
  let i = 0;
  while (objectsInBucket.length) {
    await deleteAllFilesInBucketDepthOne(bucketId);
    objectsInBucket = await listObjects(bucketId);
    console.log('deleting files iteration', ++i);
  }
  console.log('All files deleted successfully.');
}

// Delete all files in a bucket
async function deleteAllFilesInBucketDepthOne(bucketId) {
  try {
    let nextFileName = null;

    do {
      // List files in the bucket
      const listResponse = await b2.listFileNames({
        bucketId,
        startFileName: nextFileName,
      });

      const files = listResponse.data.files;

      // Delete each file
      for (const file of files) {
        await b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        });
        console.log(`Deleted file: ${file.fileName}`);
      }

      // Check if there are more files to delete
      nextFileName = listResponse.data.nextFileName;
    } while (nextFileName); // Continue if there's more files to delete
  } catch (error) {
    console.error('Error deleting files:', error.response?.data || error.message);
  }
}

// Delete a bucket
async function deleteBucket(accountId, bucketId) {
  try {
    console.log(`Bucket deleting: [${accountId}][${bucketId}]`);
    const response = await b2.deleteBucket({ accountId, bucketId });
    console.log(`Bucket deleted: ${bucketId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bucket:', error.response.data);
  }
}

const createBuckets = async (bucketNames) => {
  const existingBuckets = (await listBuckets()).map((bucket) => bucket.name);

  console.log('creating buckets... existing buckets:', existingBuckets);
  for (const bucketName of bucketNames) {
    console.log(`bucket ${bucketName}`);
    if (existingBuckets.includes(bucketName)) {
      console.log(`   already exists, skipping`);
      continue;
    }
    console.log(`   creating...`, bucketName);
    await createBucket(bucketName);
    console.log(`   created`);
  }
  console.log('done creating buckets');
};

const getBucketIdByName = async (bucketName) => {
  let bucketId = (await listBuckets()).find((bucket) => bucket.name === bucketName);
  if (!bucketId) {
    throw new Error('bucket id not found for bucket name', bucketName);
  }
  return bucketId.id;
};

const uploadRandomImageB2 = async (bucketName, targetFileName) => {
  const { response } = await generateImageAndFetch();
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  let bucketId = await getBucketIdByName(bucketName);
  await uploadFile(bucketId, targetFileName, imageBuffer);
  return `${STORAGE_FILES_BASE_URL}/${bucketName}/${targetFileName}`;
};

const deleteAllBuckets = async (accountId) => {
  const existingBuckets = await listBuckets();
  console.log('deleting all buckets', existingBuckets);
  for (let bucket of existingBuckets) {
    console.log(`bucket ${bucket.name}`);
    console.log(`   clearing bucket...`);
    await deleteAllFilesInBucket(bucket.id);
    console.log(`   cleared`);
    console.log(`   removing...`);
    await deleteBucket(accountId, bucket.id);
    console.log(`   removed`);
  }
};

const clearAllBuckets = async () => {
  const existingBuckets = await listBuckets();
  console.log('deleting all buckets', existingBuckets);
  for (let bucket of existingBuckets) {
    console.log(`bucket ${bucket.name}`);
    console.log(`   clearing bucket...`);
    await deleteAllFilesInBucket(bucket.id);
    console.log(`   cleared`);
  }
};

const clearBuckets = async (bucketsToClear) => {
  const existingBuckets = await listBuckets();
  for (let bucketName of bucketsToClear) {
    console.log(`bucket ${bucketName}`);
    const bucketData = existingBuckets.find((b) => b.name === bucketName);
    if (!bucketData) {
      console.log(`   not found, skipping`);
      continue;
    }
    console.log(`   clearing bucket...`, bucketData);
    await deleteAllFilesInBucket(bucketData.id);
    console.log(`   cleared`);
  }
};

// Authenticate with Backblaze B2
async function authenticate() {
  try {
    const r = await b2.authorize(); // This authenticates your application with B2
    console.log('Authenticated successfully');
    return r.data.accountId;
  } catch (error) {
    console.error('Error authenticating with Backblaze B2:', error);
  }
}

const composeBucketUrl = (bucketName) => {
  return `${bucketName}-${BUCKET_SUFFIX}`;
};

module.exports = {
  uploadRandomImageB2,
  authenticate,
  createBuckets,
  deleteAllBuckets,
  composeBucketUrl,
  uploadRandomImageB2,
  authenticate,
  clearAllBuckets,
  listBuckets,
  clearBuckets,
  getBucketIdByName,
  listObjects,
};
