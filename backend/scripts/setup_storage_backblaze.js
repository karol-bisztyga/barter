const {
  composeBucketUrl,
  deleteAllBuckets,
  createBuckets,
  listBuckets,
  clearBuckets,
  authenticate,
} = require('./backblaze_functions');

(async () => {
  const accountId = await authenticate();

  const args = process.argv.slice(2);
  const option = args[0];

  // they must be globally unique LoL
  const bucketNames = [composeBucketUrl(`profile-pictures`), composeBucketUrl(`items-images`)];

  const existingBuketNames = (await listBuckets()).map((bucket) => bucket.bucketName);

  switch (option) {
    case '--reset':
      console.log('storage reset...');
      if (bucketNames.every((item) => existingBuketNames.includes(item))) {
        console.log('all buckets with provided names already exist, clearing them...');
        clearBuckets(bucketNames);
      } else {
        await deleteAllBuckets(accountId);
        await createBuckets(bucketNames);
      }
      break;
    case '--clean':
      console.log('storage clean...');
      if (bucketNames.every((item) => existingBuketNames.includes(item))) {
        console.log('all buckets with provided names already exist, clearing them...');
        clearBuckets(bucketNames);
      } else {
        await deleteAllBuckets();
      }
      break;
    case '--setup':
      // setup storage
      console.log('storage setup...');
      await createBuckets(bucketNames);
      break;
    default:
      console.error(`invalid command ${option}`);
      break;
  }
})();
