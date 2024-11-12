const { spawn } = require('node:child_process');
const fs = require('fs');
const path = require('path');

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
let testFiles = findTestFiles(__dirname);

if (process.argv.length > 2) {
  const patterns = process.argv.slice(2);

  testFiles = testFiles.filter((path) => {
    for (const pattern of patterns) {
      if (path.includes(pattern)) {
        return true;
      }
    }

    return false;
  });
}


const args = [
  '--require',
  'ts-node/register/transpile-only',
  '--test',
  '--test-reporter',
  'spec',
  ...testFiles,
];

console.log(args);

const testProcess = spawn('node', args);

testProcess.stdout.pipe(process.stdout);
testProcess.stderr.pipe(process.stderr);
