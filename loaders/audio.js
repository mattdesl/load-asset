var createMediaLoader = require('./util/createMediaLoader');
module.exports = createMediaLoader('audio', function () {
  return new window.Audio();
});
