var createFileLoader = require('./util/createFileLoader');

module.exports = {
  key: 'text',
  match: /\.txt$/i,
  load: createFileLoader('text')
};
