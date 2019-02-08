const fs = require('fs');
module.exports = {
  writeJSON: (path, txt) => {
    fs.writeFile(path, txt, function (err) {
      if (err) throw err;
      // console.log(txt);
      console.log('Saved!');
    })
  }
}
