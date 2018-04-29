var createFileLoader = require('./util/createFileLoader');

module.exports = {
  key: 'json',
  match: /\.json$/i,
  load: createFileLoader('json')
};
