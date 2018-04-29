var xhr = require('xhr');
var assign = require('object-assign');

module.exports = function (type) {
  return function loadFile (opt) {
    var p;
    if ('fetch' in window) {
      p = window.fetch(opt.url, opt)
        .then(function (response) {
          if (/404/.test(response.status)) {
            throw new Error('Resource not found');
          }
          if (!/^2/.test(response.status)) {
            throw new Error('Unexpected HTTP Status Code: ' + response.status);
          }
          if (!response.ok) {
            throw new Error('Response not OK');
          }
          if (type === 'json') {
            return response.json();
          } else if (type === 'binary') {
            return response.arrayBuffer();
          } else if (type === 'blob') {
            return response.blob();
          } else {
            return response.text();
          }
        });
    } else {
      p = xhrFetch(type, opt);
    }
    return p.catch(function (err) {
      throw new Error(
        err.message + ' while loading file ' + opt.url
      );
    });
  };
};

function xhrFetch (type, opt) {
  return new Promise(function (resolve, reject) {
    var responseType = 'text';
    if (type === 'json') responseType = 'text';
    else if (type === 'binary') responseType = 'arraybuffer';
    else if (type === 'blob') responseType = 'blob';
    opt = assign({}, opt, {
      json: false,
      responseType: responseType
    });
    xhr(opt, function (err, res, body) {
      if (err) return reject(err);
      if (/404/.test(res.statusCode)) {
        throw new Error('Resource not found');
      }
      if (!/^2/.test(res.statusCode)) {
        return reject(new Error('Unexpected HTTP Status Code: ' + res.statusCode));
      }
      if (type === 'json') {
        try {
          body = JSON.parse(body);
        } catch (err) {
          return reject(err);
        }
      }
      resolve(body);
    });
  });
}
