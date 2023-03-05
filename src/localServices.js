const inquirer = require('inquirer');
const pm2 = require('pm2');

const tail = require('./helpers/tail.js');
const fsHelper = require('./helpers/fs.js');
const index = require('./index.js');
const components = require('./helpers/components.js');
const cli = require('./helpers/cli.js');
const pm2Helper = require('./helpers/pm2.js');

// List of pm2 ids
let pmIds = [];

// Indicate if we are connected to pm2
let connected = false;

// Return pm2 ids to other modules
const getPmIds = () => {
  return pmIds;
}

/**
 * Connect to pm2
 * @returns {Promise} - Promise that resolves when connected
 */
const connect = () => {
  if (connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        reject(err)
      }
      connected = true;
      resolve()
    })
  })
}

/**
 * User input when starting all services
 * @returns {Promise} - Promise that resolves when the user has answered
 */
const start = async () => {
  // Ignore if there are services running
  if (pmIds.length) return Promise.resolve();

  const comps = await components.inspect();
  const ecosystem = pm2Helper.ecosystem(comps);

  // Start all services based on the ecosystem file
  return new Promise((resolve, reject) => {
    pm2.start(ecosystem, (err, apps) => {
      if (err) {
        reject(err)
      }
      pmIds = apps.map((app) => {
        return app.pm2_env.pm_id
      })
      resolve()
    })
  })
}

/**
 * Stop all services
 * @returns {void}
 */
const stopAll = async () => {
  await connect();
  await stopProcesses(pmIds);
  await deleteProcesses(pmIds);
  pmIds = [];
}

/**
 * Stop all services
 * @param {Array} pmIds - Array of pm2 ids 
 * @returns {Promise} - Promise that resolves when all services have been stopped
 */
const stopProcesses = pmIds => {
  const promises = pmIds.map((pm_id) => {
    return new Promise((resolve, reject) => {
      pm2.stop(pm_id, (err) => {
        if (err) reject(err)
        resolve()
      });
    })
  })
  return Promise
    .all(promises)
};

/**
 * Delete a list of processes from pm2
 * @param {Array} pmIds - Array of pm2 ids
 * @returns {Promise} - Promise that resolves when all processes have been deleted
 */
const deleteProcesses = pmIds => {
  const promises = pmIds.map((pm_id) => {
    return new Promise((resolve, reject) => {
      pm2.delete(pm_id, (err) => {
        if (err) reject(err)
        resolve()
      });
    })
  })
  return Promise
    .all(promises)
}

/**
 * Get all processes from pm2
 * @returns {Promise} - Promise that resolves with an array of processes
 */
const getAllPm2Processes = () => {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) reject(err)
      resolve(list)
    })
  })
}

/**
 * Get descriptions of all processes
 * @returns {Promise} - Promise that resolves with an array of descriptions
 * @example
 * [
 *  {
 *   "pm2_env": {
 *    "name": "ms",
 *    ...
 *   }
 *  },
 * ]
 */
const describe = () => {
  let descriptions = []
  const promises = pmIds.map((pm_id) => {
    return new Promise((resolve, reject) => {
      pm2.describe(pm_id, (err, description) => {
        if (err) return reject(err)
        descriptions.push(description[0])
        resolve()
      });
    })
  })
  return Promise
    .all(promises)
    .then(() => {
      return descriptions
    })
}

/**
 * Monitor all processes and tail their logs
 * @returns {void}
 */
const monitorProcesses = async () => {
  const descriptions = await describe()

  let logFiles = []
  for (const description of descriptions) {
    logFiles.push(description.pm2_env.pm_out_log_path)
    logFiles.push(description.pm2_env.pm_err_log_path)
  }

  tail.start(logFiles)
}

/**
 * Check if a process is a microservice
 * @param {Object} process - Process object
 * @returns {Boolean} - True if the process is a microservice
 */
const checkIfProcessIsMs = (process) => {
  const { cwd } = process.pm2_env;
  return cwd.startsWith(fsHelper.project()); 
}

const syncStatus = async () => {
  const allProcesses = await getAllPm2Processes();
  for (const process of allProcesses) {
    if (checkIfProcessIsMs(process)) {
      if (!pmIds.includes(process.pm_id)) {
        pmIds.push(process.pm_id)
      }
    }
  }
}

/**
 * Asks for user input
 * @returns {void}
 */
const startAll = async () => {
  inquirer
    .prompt([{
      type: 'confirm',
      name: 'confirmation',
      message: 'You are about to start the ecosystem. When you are done watching live events, just press Enter. Continue?',
      choices: [{
        name: 'Start all services',
        value: 'start.all',
      }, {
        name: 'Quit',
        value: 'quit',
      }],
    }])
    .then(async (answers) => {
      const { confirmation } = answers;

      if (!confirmation) return index.main();

      await connect();
      await start();
      await monitorProcesses();
      await cli.waitForKey()
        .then(() => {
          tail.stop();
          index.main();
        });
    })
}

module.exports.startAll = startAll;
module.exports.stopAll = stopAll;
module.exports.getPmIds = getPmIds;
module.exports.syncStatus = syncStatus;