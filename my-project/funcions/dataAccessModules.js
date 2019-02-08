const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports = {
  readJSON: (path) => {
    console.log('dataAccessModules.readJSON');
    return fs.readFileAsync(path);
  },
  writeJSON: (path, txt) => {
    console.log('dataAccessModules.writeJSON');
    return fs.writeFileAsync(path, txt, function (err) {
      if (err) throw err;
    })
  }
}
