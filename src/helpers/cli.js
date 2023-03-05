const open = require('open');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const fsHelpers = require('./fs.js');

// Readline instance
let rl;

const info = () => {
  const cliPackageJson = fsHelpers.cli(['package.json']);
  if (!fs.existsSync(cliPackageJson)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(cliPackageJson));
}

const openDocs = () => {
  open(info().website);
}

const clearScreen = () => {
  // process.stdout.write("\u001b[2J\u001b[0;0H");
}

const getPackageInfo = packagePath => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null
  }
  return JSON.parse(fs.readFileSync(packageJsonPath));
}

/**
 * Waits for user input
 * @param {String} query - Query to show to the user 
 * @returns {Promise} - Promise that resolves with the user input
 */
const waitForKey = (query) => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Return promise when user input is received
  return new Promise((resolve, reject) => {
    rl.question(query || '', (answer) => {
      resolve(answer);
    });
  })
}

module.exports.info = info;
module.exports.openDocs = openDocs;
module.exports.clearScreen = clearScreen;
module.exports.getPackageInfo = getPackageInfo;
module.exports.waitForKey = waitForKey;