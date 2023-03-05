const inquirer = require("inquirer");

const index = require("./index.js");
const messages = require("./helpers/messages.js");
const fsHelper = require("./helpers/fs.js");

/**
 * Checks if a service already exists with that name
 * @param {String} name 
 * @returns {Boolean} - True if the service already exists
 */
const checkIfExists = (name) => {
  // Prepare path to be checked
  const path = fsHelper.project([name]);
  // Check if the path exists
  return fsHelper.pathExists(path);
}

/**
 * Prepares the new microservice to be an http service
 * @param {*} answers 
 */
const setupHttp = async answers => {
  const { name, isHttp, methods, pathname, auth, authMethod } = answers;

}

/**
 * Creates a new microservice
 * @param {Object} answers 
 */
const doCreate = async (answers) => {
  const { name, isHttp, methods, pathname, auth, authMethod } = answers;

  // Copy template folder to new service folder
  const templatePath = fsHelper.project(['template']);
  const servicePath = fsHelper.project([name]);
  await fsHelper.clonePath(templatePath, servicePath);

  if (isHttp) {

  }
}

// Error message
const error = (message) => messages.error(`Couldn't complete :( Reason: ${message}`, 1, 1)

/**
 * User input
 * @returns {void}
 */
const create = () => {

  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Service name",
        validate: (value) => {
          if (value.length) {
            if (checkIfExists(value)) {
              return `Service ${value} already exists (at least a folder with that name)`;
            }
            return true;
          }
          return "Service name is required";
        }
      },
      {
        type: "confirm",
        name: "isHttp",
        message: "Does the service expose any HTTP endpoint(s)?",
      },
      {
        type: 'checkbox',
        name: 'methods',
        message: 'Select the HTTP methods',
        choices: [
          { name: 'GET', value: 'get', checked: true, },
          { name: 'POST', value: 'post', checked: false, },
          { name: 'PUT', value: 'put', checked: false, },
          { name: 'DELETE', value: 'delete', checked: false, },
        ],
        when: (answers) => answers.isHttp,
      },
      {
        type: 'input',
        name: 'pathname',
        message: 'Pathname (e.g. /users)',
        when: (answers) => answers.isHttp,
        validate: (value) => {
          if (value.length) {
            // Make sure it starts with a slash
            if (value[0] !== '/') {
              return "Pathname must start with a slash";
            }
            // Make sure it doesn't end with a slash
            if (value[value.length - 1] === '/') {
              return "Pathname must not end with a slash";
            }
            // Make sure it doesn't contain any spaces
            if (value.includes(' ')) {
              return "Pathname must not contain any spaces";
            }
            // Make sure it doesn't contain any special characters (except for "/")
            if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]/g.test(value)) {
              return "Pathname must not contain any special characters";
            }
            // Make sure it doesn't contain any uppercase characters
            if (/[A-Z]/g.test(value)) {
              return "Pathname must not contain any uppercase characters";
            }
            return true;
          }
          return "Pathname is required";
        }
      },
      {
        type: 'confirm',
        message: 'Does it needs some kind of authentication?',
        name: 'auth',
        when: (answers) => answers.isHttp,
      },
      {
        type: 'list',
        message: 'Select the authentication method',
        name: 'authMethod',
        choices: [
          { name: 'Required', value: 'required', checked: true, },
          { name: 'Optional', value: 'optional', checked: false, },
        ],
        when: (answers) => answers.auth,
      }
    ])
    .then(async (answers) => {
      const { name } = answers;
      
      if (checkIfExists(name)) {
        error(`Service ${name} already exists`);
        return index.main();
      }

      await doCreate(answers)

      return index.main();
    });

}

module.exports.create = create;