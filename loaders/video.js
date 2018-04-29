var createMediaLoader = require('./util/createMediaLoader');
module.exports = createMediaLoader('video', function () {
  return document.createElement('video');
});
