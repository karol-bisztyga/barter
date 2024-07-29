require("dotenv").config();
const { execSync } = require("child_process");
const path = require("path");

const containerName = process.env.DOCKER_CONTAINER_NAME;
const dbUser = process.env.DB_USER;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const sqlFilePath = path.resolve(
  __dirname,
  process.env.SQL_FILE || "../database.sql"
);

// Function to execute shell commands
const execCommand = (command, retries = 0, retryTimeout = 1000) => {
  try {
    execSync(command, { stdio: "inherit" });
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

// Check if Docker container is running
const checkContainerRunning = () => {
  try {
    const result = execSync(
      `docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Names}}"`
    )
      .toString()
      .trim();
    return result === containerName;
  } catch {
    return false;
  }
};

if (!checkContainerRunning()) {
  console.log(
    `Docker container ${containerName} is not running. Trying to run it...`
  );
  // start the container
  const _createdContainerId = execSync(
    `docker run --name ${containerName} -e POSTGRES_PASSWORD=${dbPassword} -e POSTGRES_USER=${dbUser} -e POSTGRES_DB=${dbName} -p ${dbPort}:${dbPort} -d postgres`
  )
    .toString()
    .trim();
} else {
  console.log(`Docker container ${containerName} is already running.`);
}

// Step 1: Copy database.sql into the Docker container
console.log(`Copying ${sqlFilePath} into the Docker container...`);
execCommand(`docker cp ${sqlFilePath} ${containerName}:/database.sql`);

// Step 2: Execute the database.sql script inside the container
execCommand(
  `docker exec -it ${containerName} psql -U ${dbUser} -d ${dbName} -f /database.sql`,
  3
);

console.log("Database has been reset.");
