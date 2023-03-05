const fs = require('fs');
const fsHelper = require('./fs.js');

const CONFIG_FILE_LOCATION = fsHelper.project(['.config.json']);

const exists = () => {
  return fs.existsSync(CONFIG_FILE_LOCATION);
}

const getAll = () => {
  if (!fs.existsSync(CONFIG_FILE_LOCATION)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(CONFIG_FILE_LOCATION));
}

const set = (config) => {
  let current = getAll();
  let newConfig = Object.assign({}, current, config);
  fs.writeFileSync(CONFIG_FILE_LOCATION, JSON.stringify(newConfig, null, 2));
}

const get = (key) => {
  let config = getAll();
  return config[key];
}

/**
 * Remove the configuration file
 */
const remove = () => {
  fs.unlinkSync(CONFIG_FILE_LOCATION);
}

module.exports.exists = exists
module.exports.getAll = getAll
module.exports.set = set
module.exports.get = get
module.exports.remove = remove