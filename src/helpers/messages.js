const cli = require('./cli.js');

const packageJson = cli.info();

const log = (type, message, above, below) => {
  for (let i = 0; i < above; i++) console.log('');
  console[type](message);
  for (let i = 0; i < below; i++) console.log('');
}

const logo = (above, below) => {
  log('log', `🍱 ${packageJson.name} ${packageJson.version}`, above, below);
}

const project = (projectName, above, below) => {
  log('log', `📁 PROJECT: ${projectName}`, above, below);
}

const success = (message, above, below) => log('log', `✅ ${message}`, above, below)
const warning = (message, above, below) => log('warn', `⚠️  ${message}`, above, below)
const info = (message, above, below) => log('info', `⚠️  ${message}`, above, below)
const error = (message, above, below) => log('error', `🔴 ${message}`, above, below)

module.exports.logo = logo
module.exports.project = project
module.exports.success = success
module.exports.warning = warning
module.exports.info = info
module.exports.error = error