const spawn = require("child_process").spawn;

// Indicate if we are tailing
let tailing = null;

/**
 * Tail files
 * @param {Array} files - Array of files to tail (full path)
 * @returns {void}
 */
const start = files => {
  tailing = spawn("tail", ["-f"].concat(files));
  tailing.stdout.on("data", function (data) {
      console.log(data.toString());
  });
}

/**
 * Stop tailing
 * @returns {void}
 */
const stop = () => {
  if (tailing) {
    tailing.kill();
  }
}

module.exports.start = start;
module.exports.stop = stop;