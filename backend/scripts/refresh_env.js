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
      // lol this again only works when there is no 'http' wtf xD
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

// Define input and output file paths
const inputFilePath = path.resolve(__dirname, '../../.env');
const outputFilePath = path.resolve(__dirname, '../.env');

// Run the function to create the new prefixed .env file
copyEnvWithPrefix(inputFilePath, outputFilePath, '');
