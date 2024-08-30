const {
  getBucketIdByName,
  listBuckets,
  listObjects,
  authenticate,
} = require('./backblaze_functions');

(async () => {
  const accountId = await authenticate();

  const args = process.argv.slice(2);
  const option = args[0];

  switch (option) {
    case '--list-objects':
      const existingBuketNames = (await listBuckets()).map((bucket) => bucket.name);
      console.log('existing buckets', existingBuketNames);
      for (let bucketName of existingBuketNames) {
        console.log(`bucket ${bucketName}`);
        const bucketId = await getBucketIdByName(bucketName);
        const objects = await listObjects(bucketId);
        console.log(
          bucketName,
          objects.length,
          objects.map((obj) => obj.fileName)
        );
      }
      break;
    default:
      console.error(`invalid command ${option}`);
      break;
  }
})();
