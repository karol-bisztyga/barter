const { execSync } = require('child_process');

const sleep = async (ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
};

const execCommand = async (command, retries = 1, retryTimeout = 1000, retryCounter = 1) => {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error executing command: ${command}\n${err}`);
    if (retryCounter <= retries) {
      console.log(`Retrying (attempt: ${retryCounter}/${retries}) in ${retryTimeout}ms...`);
      await sleep(retryTimeout);
      return await execCommand(command, retries, retryTimeout, retryCounter + 1);
    }
    throw err;
  }
};

module.exports = execCommand;
