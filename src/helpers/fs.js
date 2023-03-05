const url = require('url');
const os = require('os');
const path = require('path');
const fs = require('fs');
const readdir = require('fs/promises').readdir;

// Paths for folders and files
const filename = () => __filename
const dirname = () => __dirname

////////////////////////////////////////////////////////////////////////////////
// System's folders
////////////////////////////////////////////////////////////////////////////////

// User's home folder
const home = (relative) => path.join(os.homedir(), ...relative);

////////////////////////////////////////////////////////////////////////////////
// Subenshi's system folders
////////////////////////////////////////////////////////////////////////////////

const cli = (relative) => path.join(__dirname, '..', '..', ...relative)

////////////////////////////////////////////////////////////////////////////////
// Project related folders
////////////////////////////////////////////////////////////////////////////////

const project = (relative) => path.resolve(process.cwd(), ...relative || []);

////////////////////////////////////////////////////////////////////////////////
// Actual helpers
////////////////////////////////////////////////////////////////////////////////

const pathExists = (pathCheck) => fs.existsSync(pathCheck);
const clonePath = (src, dest) => fs.cp(src, dest, {recursive: true});
const deleteFile = (deletePath) => fs.rm(deletePath, {recursive: false, force: true});
const listFolders = (originalPath) => {
  return readdir(originalPath, {withFileTypes: true})
    .then((files) => {
      return files
        .filter((file) => file.isDirectory() || file.isSymbolicLink()).map((file) => {
          return path.join(originalPath, file.name)
        });
    })
}
const readJson = (path) => {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
  catch (e) {
    return null;
  }
}

// Exports

module.exports.dirname = dirname
module.exports.filename = filename
module.exports.home = home
module.exports.cli = cli
module.exports.project = project
module.exports.pathExists = pathExists
module.exports.clonePath = clonePath
module.exports.readJson = readJson
module.exports.listFolders = listFolders
module.exports.deleteFile = deleteFile