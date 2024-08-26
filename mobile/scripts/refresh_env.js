const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Function to read the .env file, prefix variables, and write to a new file
function copyEnvWithPrefix(inputFilePath, outputFilePath, prefix) {
  // Read the .env file
  const envConfig = dotenv.parse(fs.readFileSync(inputFilePath));

  // Create a new object with prefixed variables
  const prefixedEnvConfig = {};
  for (const key in envConfig) {
    if (envConfig.hasOwnProperty(key)) {
      let val = envConfig[key];
      // append 'http://' to localhost as a hot fix (no time for this)
      // if (val === 'localhost') {
      //   val = 'http://localhost';
      // }
      prefixedEnvConfig[`${prefix}${key}`] = val;
    }
  }

  // Convert the prefixed object to a string suitable for writing to a file
  const newEnvContent = Object.entries(prefixedEnvConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write the new content to the output file
  fs.writeFileSync(outputFilePath, newEnvContent);
  console.log(`Prefixed .env file created at ${outputFilePath}`);
}

(() => {
  const args = process.argv.slice(2);
  const option = args[0];

  let inputFilePath;

  switch (option) {
    case 'staging':
      inputFilePath = path.resolve(__dirname, '../../.env_staging');
      break;
    case 'prod':
      inputFilePath = path.resolve(__dirname, '../../.env_prod');
      break;
    default:
      console.error('Invalid option', option);
      break;
  }
  const outputFilePath = path.resolve(__dirname, '../.env');
  const prefix = 'EXPO_PUBLIC_';

  copyEnvWithPrefix(inputFilePath, outputFilePath, prefix);
})();
