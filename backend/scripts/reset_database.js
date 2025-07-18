require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const execCommand = require('./executeCommand');

const { POSTGRESQL_CONTAINER_NAME, DB_USER, DB_NAME, SQL_FILE, DB_PASSWORD } = process.env;

const sqlFilePath = path.resolve(__dirname, SQL_FILE || '../database.sql');

// Check if Docker container is running
const checkContainerRunning = () => {
  try {
    const result = execSync(
      `docker ps --filter "name=${POSTGRESQL_CONTAINER_NAME}" --filter "status=running" --format "{{.Names}}"`
    )
      .toString()
      .trim();
    return result === POSTGRESQL_CONTAINER_NAME;
  } catch {
    return false;
  }
};

const args = process.argv.slice(2);
const option = args[0];

if (!checkContainerRunning() || option === '--force') {
  if (option === '--force') {
    console.log('Forcing reset...');
  } else {
    console.log(
      `Docker container ${POSTGRESQL_CONTAINER_NAME} is not running. Trying to run it...`
    );
  }
  // start the container
  execSync('npm run docker:reset').toString().trim();
} else {
  console.log(`Docker container ${POSTGRESQL_CONTAINER_NAME} is already running.`);
}
(async () => {
  // Step 1: Copy database.sql into the Docker container
  console.log(`Copying ${sqlFilePath} into the Docker container...`);

  const commands = [
    `docker cp ${sqlFilePath} ${POSTGRESQL_CONTAINER_NAME}:/database.sql`,
    `docker exec -it ${POSTGRESQL_CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c 'DROP DATABASE IF EXISTS ${DB_NAME};'`,
    `docker exec -it ${POSTGRESQL_CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c 'CREATE DATABASE ${DB_NAME};'`,
    `docker exec -it ${POSTGRESQL_CONTAINER_NAME} /bin/bash -c "export PGPASSWORD=${DB_PASSWORD}; psql -v DB_NAME=${DB_NAME} -U ${DB_USER} -d ${DB_NAME} -f /database.sql"`,
  ];

  for (const command of commands) {
    const out = await execCommand(command, 3);
    console.log(`>>> COMMAND EXECUTED [${command}]: ${out}`);
  }

  console.log('Database has been reset.');
})();
