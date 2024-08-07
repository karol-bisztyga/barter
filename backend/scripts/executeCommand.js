const { execSync } = require('child_process');

const execCommand = (command, retries = 0, retryTimeout = 1000) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error executing command: ${command}\n${err}`);
    if (retries) {
      console.log(`Retrying in ${retryTimeout}ms...`);
      setTimeout(() => {
        execCommand(command, retries - 1, retryTimeout);
      }, retryTimeout);
      return;
    }
    throw err;
  }
};

module.exports = execCommand;
