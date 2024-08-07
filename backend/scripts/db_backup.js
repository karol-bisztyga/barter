require('dotenv').config();
const path = require('path');
const execCommand = require('./executeCommand');

const { DOCKER_CONTAINER_NAME, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT, SQL_FILE } = process.env;

const dumpFilePath = path.resolve(__dirname, './database_dump.sql');
const removeTablesPath = path.resolve(__dirname, './database_remove_tables.sql');

const command = process.argv.slice(2)[0];

switch (command) {
  case 'store':
    console.log('storing database dump in', dumpFilePath);
    execCommand(
      `docker exec -it ${DOCKER_CONTAINER_NAME} /bin/bash -c "PGPASSWORD=${DB_PASSWORD} pg_dump --username ${DB_USER} ${DB_NAME}" > ${dumpFilePath}`
    );
    break;
  case 'restore':
    console.log(`removing tables`);
    execCommand(`docker cp ${removeTablesPath} ${DOCKER_CONTAINER_NAME}:/removeTablesPath.sql`);
    execCommand(
      `docker exec -it ${DOCKER_CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -f /removeTablesPath.sql`,
      3
    );

    console.log(`restoring database from ${dumpFilePath}`);
    execCommand(
      `docker exec -i ${DOCKER_CONTAINER_NAME} /bin/bash -c "PGPASSWORD=${DB_PASSWORD} psql --username ${DB_USER} ${DB_NAME}" < ${dumpFilePath}`
    );
    break;
  default:
    console.error(`invalid command ${command}`);
    break;
}
