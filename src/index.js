#! /usr/bin/env node

const inquirer = require('inquirer');
const localServices = require('./localServices.js');
const project = require('./project.js');
const messages = require('./helpers/messages.js');
const settings = require('./helpers/settings.js');
const cli = require('./helpers/cli.js');

/**
 * Main menu
 */
const main = async () => {
  if (settings.exists()) {
    return project.main();
  }

  cli.clearScreen();
  messages.logo(1, 1);

  // Sync status of services
  await localServices.syncStatus();

  // Build choices
  const choices = [
    {
      name: 'Create a new project',
      value: 'create',
    },
    new inquirer.Separator(),
    {
      name: 'Read the documentation',
      value: 'docs',
    },
    {
      name: 'Quit',
      value: 'quit',
    }
  ]

  // Ask for user input
  inquirer
    .prompt([{
      type: 'list',
      name: 'command',
      message: 'What do you want to do?',
      choices: choices,
    }])
    .then(answers => {
      const { command } = answers;

      if (command === 'quit') process.exit(0);
      if (command === 'create') project.create();
      if (command === 'docs') {
        cli.openDocs();
        main();
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        messages.error('Prompt couldn\'t be rendered in the current environment', 1, 1);
        process.exit(1);
      } else {
        messages.error('Something went wrong', 1, 1);
        console.error(error);
        process.exit(1);
      }
    });
}

main();

module.exports.main = main;