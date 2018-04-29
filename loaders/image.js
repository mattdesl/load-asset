module.exports = {
  key: 'image',
  match: /\.(jpg|jpeg|svg|png|gif|webp|bmp|tga|tif|apng|wbpm|ico)$/i,
  load: function (opt) {
    return new Promise(function (resolve, reject) {
      var finished = false;
      var image = new window.Image();
      image.onload = function onLoaded () {
        if (finished) return;
        finished = true;
        resolve(image);
      };
      image.onerror = function onError () {
        if (finished) return;
        finished = true;
        reject(new Error('Error loading image at "' + opt.url + '"'));
      };
      if (opt.crossOrigin) image.crossOrigin = opt.crossOrigin;
      image.src = opt.url;
    });
  }
};
