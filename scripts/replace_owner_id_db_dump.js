const fs = require("fs");

// Function to replace all occurrences of a string in a file
function replaceInFile(filePath, searchString, replaceString) {
  // Read the file content
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the file: ${err}`);
      return;
    }

    // Replace all occurrences of the searchString with replaceString
    const regex = new RegExp(searchString, "g"); // 'g' flag for global replacement
    const modifiedContent = data.replace(regex, replaceString);

    // Write the modified content back to the file
    fs.writeFile(filePath, modifiedContent, "utf8", (err) => {
      if (err) {
        console.error(`Error writing the file: ${err}`);
        return;
      }

      console.log(
        `Replaced all occurrences of '${searchString}' with '${replaceString}' in ${filePath}`
      );
    });
  });
}

// Example usage
const filePath = "backend/scripts/database_dump.sql"; // Path to the file

const searchString = "barter_stag"; // The string to be replaced
const replaceString = "ucmbtf9m0asbm6"; // The replacement string

replaceInFile(filePath, searchString, replaceString);
