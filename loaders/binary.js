var createFileLoader = require('./util/createFileLoader');

module.exports = {
  key: 'binary',
  match: /\.bin$/i,
  load: createFileLoader('binary')
};
