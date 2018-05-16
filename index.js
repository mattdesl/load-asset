var loaders = require('./loaders');
var assign = require('object-assign');
var isPromise = require('is-promise');
var noop = function () {};

module.exports = loadAsset;

module.exports.all = function all (opt, progress) {
  return loadMultiple(opt, progress, false);
};

module.exports.any = function any (opt, progress) {
  return loadMultiple(opt, progress, true);
};

function loadMultiple (opt, progress, skipMissing) {
  progress = progress || noop;
  if (typeof progress !== 'function') {
    return Promise.reject(new Error('The second argument to load.all() and load.any() must be a function, or undefined'));
  }

  var total;
  var count = 0;
  var load;
  var emitProgress = function (item, value, count, error) {
    var obj = {
      target: item,
      total: total,
      count: count,
      progress: count / total,
      value: value
    };
    if (error) obj.error = error;
    progress(obj);
  };

  if (skipMissing) {
    load = function (opt) {
      return loadAsset(opt).then(function (result) {
        return { value: result };
      }, function (error) {
        return { value: null, error: error };
      }).then(function (optional) {
        emitProgress(opt, optional.value, ++count, optional.error);
        return optional.value;
      });
    };
  } else {
    load = function (opt) {
      return loadAsset(opt).then(function (result) {
        emitProgress(opt, result, ++count);
        return result;
      });
    };
  }

  if (Array.isArray(opt)) {
    total = opt.length;
    return Promise.all(opt.map(function (item) {
      return load(item);
    }));
  } else if (opt) {
    var entries = Object.keys(opt).map(function (key) {
      return { key: key, value: opt[key] };
    });
    total = entries.length;
    return Promise.all(entries.map(function (item) {
      var key = item.key;
      return load(item.value).then(function (value) {
        return { value: value, key: key };
      });
    })).then(function (results) {
      return results.reduce(function (obj, item) {
        obj[item.key] = item.value;
        return obj;
      }, {});
    });
  } else {
    return Promise.reject(new Error('You must specify an array of assets or object group to load'));
  }
}

function loadAsset (opt) {
  if (!opt) return Promise.reject(new Error('You must specify a URL or descriptor of the asset to load'));
  if (typeof opt === 'string') {
    opt = { url: opt };
  }
  // If it's a promise, assume nested features...
  if (isPromise(opt)) return opt;
  return getLoader(opt).then(function (loader) {
    opt = assign({}, opt);
    delete opt.type;
    return loader(opt);
  });
}

function getLoader (opt) {
  var i, loader;
  var type = opt.type ? opt.type : null;
  if (type) {
    // Allow user to specify custom type function
    if (typeof type === 'function') {
      return Promise.resolve(type);
    } else {
      type = type.toLowerCase();
    }
    // User specified an explicit type, use that.
    if (!opt.url) {
      return Promise.reject(new Error('When using loadAsset(), you must specify a URL or descriptor of the asset to load'));
    }
    for (i = 0; i < loaders.length; i++) {
      loader = loaders[i];
      if (loader.key === type) return Promise.resolve(loader.load);
    }
    return Promise.reject(new Error('Could not find an asset loader by the key "' + opt.type + '"'));
  } else {
    // User didn't specify type, try to infer from file extension
    if (!opt.url) {
      return Promise.reject(new Error('When using loadAsset(), you must specify a URL or descriptor of the asset to load'));
    }
    var ext = extname(opt.url);
    if (!ext) return Promise.reject(new Error('No extension found for input URL "' + opt.url + '", try to specify a { type } such as "image" or "text"'));
    for (i = 0; i < loaders.length; i++) {
      loader = loaders[i];
      if (!loader.match) continue;
      var isMatch = typeof loader.match === 'function'
        ? loader.match(ext)
        : loader.match.test(ext);
      if (isMatch) return Promise.resolve(loader.load);
    }
    return Promise.reject(new Error('Could not infer an asset loader from the file type "' + ext + '", try specifying { type } such as "image" or "text"'));
  }
}

function extname (url) {
  if (!url) return '';
  var idx = url.lastIndexOf('/');
  if (idx !== -1) url = url.substring(idx + 1); // Keep path without its segments
  idx = url.indexOf('?');
  if (idx !== -1) url = url.substring(0, idx); // Remove query
  idx = url.indexOf('#');
  if (idx !== -1) url = url.substring(0, idx); // Remove fragment
  idx = url.lastIndexOf('.');
  return idx !== -1 ? url.substring(idx) : '';
}
