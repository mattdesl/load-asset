var mime = require('browser-media-mime-type');

function getMediaType (ext) {
  var result = mime(ext);
  if (!result) return null;
  if (result.indexOf('audio') === 0) return 'audio';
  if (result.indexOf('video') === 0) return 'video';
  return null;
}

module.exports = function createMediaLoader (type, createElement) {
  return {
    key: type,
    match: function (ext) {
      return getMediaType(ext) === type;
    },
    load: function (opt) {
      return new Promise(function (resolve, reject) {
        var finished = false;
        var media = createElement();
        var onLoaded = function onLoaded () {
          if (finished) return;
          finished = true;
          resolve(media);
        };

        var event = (opt.event || 'canplay').toLowerCase();
        if (event === 'loadedmetadata') {
          media.onloadedmetadata = onLoaded;
        } else if (event === 'canplaythrough') {
          media.oncanplaythrough = onLoaded;
        } else if (event === 'loadeddata') {
          media.onloadeddata = onLoaded;
        } else {
          media.oncanplay = onLoaded;
        }

        media.onerror = function onError (er) {
          if (finished) return;
          finished = true;
          reject(new Error('Error while loading ' + type + ' at ' + opt.url));
        };

        // pass through media properties if defined
        if (opt.crossOrigin) media.crossOrigin = opt.crossOrigin;
        if (typeof opt.volume !== 'undefined') media.volume = opt.volume;
        if (typeof opt.preload !== 'undefined') media.preload = opt.volume;
        if (typeof opt.playbackRate !== 'undefined') media.playbackRate = opt.volume;
        if (typeof opt.muted !== 'undefined') media.muted = opt.volume;
        if (typeof opt.currentTime !== 'undefined') media.currentTime = opt.volume;
        if (typeof opt.controls !== 'undefined') media.controls = opt.volume;
        if (typeof opt.autoPlay !== 'undefined') media.autoPlay = opt.volume;

        media.src = opt.url;

        if (media.readyState >= media.HAVE_ENOUGH_DATA) {
          finished = true;
          return resolve(media);
        }

        media.load();
      });
    }
  };
};
