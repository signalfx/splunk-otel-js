const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set the environment variable
process.env.TEST_ALLOW_DOUBLE_START = 'y';

// Function to recursively find files
function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (filePath.endsWith('.test.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Find all test files in the ./test directory
const testFiles = findTestFiles(__dirname);
const majorVersion = parseInt(process.version.substring(1, 3))
const olderThanNode20 = majorVersion < 20;

//timeout added v20.11
const timeoutFlag = '--test-timeout=50000';
const command = `node --require ts-node/register/transpile-only --test ${olderThanNode20 ? '' : timeoutFlag} ${testFiles.join(' ')}`;

exec(command, (error, stdout, stderr) => {
  if (stdout) {
    console.log(`Output:\n${stdout}`);
  }

  if (stderr) {
    console.error(`Stderr:\n${stderr}`);
  }

  if (error) {
    console.error(`ErrorExec: ${error.code} - ${error.message}`);
  }
});
