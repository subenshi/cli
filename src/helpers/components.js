const fsHelpers = require('./fs.js');
const cli = require('./cli.js');
const download = require('./download.js');

const inspect = async () => {
  // Get components
  const components = await fsHelpers.listFolders( fsHelpers.project() );
  let inspection = []

  for (const component of components) {
    const componentPath = fsHelpers.project([component])

    let packageInfo = cli.getPackageInfo(componentPath);
    if (!packageInfo) {
      continue;
    }

    packageInfo._git = await download.status(componentPath);

    const packageJson = fsHelpers.readJson(fsHelpers.project([component, 'package.json']));
    let runCommand = null;
    if (packageJson) {
      runCommand = packageJson.scripts && packageJson.scripts['run-from-cli'];
    }

    inspection.push({
      name: packageInfo.name,
      path: componentPath,
      runCommand,
      version: packageInfo.version,
      ahead: packageInfo._git.ahead,
      behind: packageInfo._git.behind,
      branch: packageInfo._git.current,
    })
  }
  return inspection;
}

module.exports.inspect = inspect;