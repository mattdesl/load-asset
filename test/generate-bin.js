const fs = require('fs');
const path = require('path');

const data = new Float32Array([ 1.5, 2.5, 500 ]);
const buffer = Buffer.from(data.buffer);

fs.writeFile(path.resolve(__dirname, 'fixtures/other.bin'), buffer, 'binary', err => {
  if (err) throw err;
});
