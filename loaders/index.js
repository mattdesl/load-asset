const createMediaLoader = require('./createMediaLoader');
const createFileLoader = require('./createFileLoader');
const loadImage = require('./loadImage');

module.exports = [
  // json
  {
    key: 'json',
    match: /\.json$/i,
    load: createFileLoader('json')
  },
  // text
  {
    key: 'text',
    match: /\.txt$/i,
    load: createFileLoader('text')
  },
  // image
  {
    key: 'image',
    match: /\.(jpg|jpeg|svg|png|gif|webp|bmp|tga|tif|apng|wbpm|ico)$/i,
    load: loadImage
  },
  // audio
  createMediaLoader('audio', function () {
    return new window.Audio();
  }),
  // video
  createMediaLoader('video', function () {
    return document.createElement('video');
  }),
  // binary
  {
    key: 'binary',
    match: /\.bin$/i,
    load: createFileLoader('binary')
  },
  // blob
  {
    key: 'blob',
    load: createFileLoader('blob')
  }
];
