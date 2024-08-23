require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const execCommand = require('./executeCommand');

const { POSTGRESQL_CONTAINER_NAME, DB_USER, DB_NAME, SQL_FILE } = process.env;

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

if (!checkContainerRunning()) {
  console.log(`Docker container ${POSTGRESQL_CONTAINER_NAME} is not running. Trying to run it...`);
  // start the container
  const _createdContainerId = execSync(`docker-compose -f scripts/docker-compose.yml up -d`)
    .toString()
    .trim();
} else {
  console.log(`Docker container ${POSTGRESQL_CONTAINER_NAME} is already running.`);
}

// Step 1: Copy database.sql into the Docker container
console.log(`Copying ${sqlFilePath} into the Docker container...`);
execCommand(`docker cp ${sqlFilePath} ${POSTGRESQL_CONTAINER_NAME}:/database.sql`);

// Step 2: Execute the database.sql script inside the container
execCommand(
  `docker exec -it ${POSTGRESQL_CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -f /database.sql`,
  3
);

console.log('Database has been reset.');
