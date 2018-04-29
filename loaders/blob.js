var createFileLoader = require('./util/createFileLoader');

module.exports = {
  key: 'blob',
  load: createFileLoader('blob')
};
