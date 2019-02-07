const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
// const fs = require('fs');
module.exports = {
  readJSON: (path) => {
    return fs.readFileAsync(path);
  }
}
