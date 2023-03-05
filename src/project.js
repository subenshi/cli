const inquirer = require('inquirer');
const Table = require('cli-table');

const localServices = require('./localServices.js');
const templates = require('./templates.js');
const messages = require('./helpers/messages.js');
const settings = require('./helpers/settings.js');
const fsHelpers = require('./helpers/fs.js');
const cli = require('./helpers/cli.js');
const download = require('./helpers/download.js');
const index = require('./index.js');
const components = require('./helpers/components.js');

/**
 * Main menu
 */
const main = async back => {

  // Sync status of services
  await localServices.syncStatus();

  cli.clearScreen();
  messages.logo(1, 0);
  messages.project(settings.get('name'), 0, back ? 1 : 1);

  // Build choices
  let choices = [
    {
      name: '+ new service',
      value: 'create',
    },
    new inquirer.Separator(),
    {
      name: 'Stop all services',
      value: 'stop.all',
      when: localServices.getPmIds().length,
    },
    {
      name: 'Start all services',
      value: 'start.all',
    },
    // Add separator
    new inquirer.Separator(),
    {
      name: 'Setup project',
      value: 'install',
    },
    {
      name: 'Advanced',
      value: 'advanced',
    },
    {
      name: 'Quit',
      value: 'quit',
    }
  ];

  await components.inspect().then((components) => {
    if (components.length) {
      // Add separator
      choices.unshift(new inquirer.Separator());
    }

    // Sort components by name
    components.sort((a, b) => a.name < b.name ? -1 : 1);

    // Add components to choices
    components.forEach(component => {
      let gitInfo = [
        component.branch,
        component.ahead ? `+${component.ahead}` : null,
        component.behind ? `-${component.behind}` : null
      ].filter(Boolean).join(' ');
      
      choices.unshift({
        name: `${component.name} ${component.version} [${gitInfo}]`,
        value: `component|${component.name}`,
      })
    })
  })

  // Ask for user input
  inquirer
    .prompt([{
      type: 'list',
      name: 'command',
      message: 'What do you want to do?',
      choices: choices,
      pageSize: 100
    }])
    .then(async (answers) => {
      const { command } = answers;

      if (command === 'advanced') advanced();
      if (command === 'create') templates.create();
      if (command === 'start.all') localServices.startAll();
      if (command === 'quit') process.exit(0);
      if (command === 'install') setupProject();
      if (command === 'stop.all') {
        await localServices.stopAll();
        index.main();
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        messages.error('Prompt couldn\'t be rendered in the current environment', 1, 1);
        exit(1);
      } else {
        messages.error('Something went wrong', 1, 1);
        console.error(error);
        exit(1);
      }
    });
}

const advanced = async () => {
  // Build choices
  const choices = [
    {
      name: `Remove '${settings.get('name')}' configuration file`,
      value: 'remove.config',
    },
    new inquirer.Separator(),
    {
      name: 'Back',
      value: 'back',
    },
  ];

  // Ask for user input
  inquirer
    .prompt([{
      type: 'list',
      name: 'command',
      message: 'What do you want to do?',
      choices: choices,
    }])
    .then(async (answers) => {
      const { command } = answers;

      if (command === 'remove.config') {
        settings.remove();
        messages.success('Configuration file removed', 1, 1);
        index.main();
      }
      if (command === 'back') index.main();
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

const setupProject = async () => {

  const inspection = await components.inspect();

  let choices = [
    {
      type: 'checkbox',
      name: 'components',
      message: 'What do you want to include?',
      choices: [
        {
          name: 'Gateway',
          value: 'gateway',
          checked: true,
        },
        {
          name: 'Logger',
          value: 'logger',
          checked: true,
        },
        {
          name: 'Admin dashboard',
          value: 'admin',
        },
        {
          name: 'Angular application',
          value: 'angular',
        },
      ]
    }
  ];

  // Flag already installed components
  inspection.forEach(component => {
    choices[0].choices.forEach(choice => {
      if (choice.value === component.name) {
        choice.checked = true;
        choice.disabled = true;
      }
    })
  })

  // Ask for user input
  inquirer
    .prompt(choices)
    .then(async (answers) => {
      const { components } = answers;
      console.log({components})
      // Download components
      await download.components(components);
      main();
    })
}

/**
 * Create a new project
 */
const create = async () => {
  messages.warning(`This will create a new project in the current folder: ${fsHelpers.project()}`, 1, 1)

  // Ask for user input
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to continue?',
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your project?',
        validate: (value) => {
          if (value.length) return true;
          return 'Please enter a name';
        },
        when: (answers) => answers.confirm,
      }
    ])
    .then(async (answers) => {
      const { name, confirm } = answers;

      if (!confirm) return index.main();

      settings.set({ name });

      setupProject();
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

module.exports.main = main;
module.exports.create = create;