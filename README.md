# load-asset

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A simple Promise-based asset loader with cross browser support down to IE 11. Ideal for use with async/await syntax. Uses `fetch` where possible, otherwise falls back to `XMLHTTPRequest`.

Tries to infer loader type from extension, but you can also specify a `type` for other extensions – see [Loaders](#loaders) for details.

- Image tag (png, jpg, svg, etc)
- Audio tag (mp3, ogg, etc)
- Video tag (mp4, etc)
- JSON (json)
- Text (txt)
- Binary (bin)
- Blob

```js
const load = require('load-asset');

async function printImageSize () {
  // Load a single <img> asset
  const image = await load('image.png');

  // Print the image width and height after loading
  console.log(`Image Size: ${image.width} x ${image.height}`);
}
```

Handles loading a single asset, or multiple assets in parallel. You can use a named object map for convenience, provide a `progress` callback for visual updates, and optionally continue loading if individual resources error out.

**Note:** You will need to polyfill Promise for older browsers.

## Full Example

```js
const load = require('load-asset');

async function render () {
  // Load markdown file as text string
  const readme = await load({ url: 'readme.md', type: 'text' });
  console.log(readme);

  // Load a list of named assets in parallel
  const urls = [ 'a.png', 'data.json', 'other.txt' ];
  const items = await load.all(urls);
  console.log(items[0], items[1].some.data, items[2].toUpperCase());

  // Load a map of named assets in parallel
  // But use 'any' instead of 'all' so that errors/404s
  // do not stop loading the rest of the assets.
  const assets = await load.any({
    diffuse: 'assets/diffuse.png',
    data: { url: 'path/to/api', type: 'json' },
    arrayBuffer: { url: 'file.buf', type: 'binary' },
    document: { url: 'file.pdf', type: 'blob' },
    video: { url: 'file.mp4', muted: true }
  });

  console.log(assets.diffuse); // <img> tag
  console.log(assets.data.some.property); // JSON data
}
```

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install load-asset --save
```

## Usage

#### `asset = load(item)`

Loads the `item` asset, which is either a string URL or an object with properties, and returns an `asset` Promise which will resolve to the loaded object (such as HTMLVideoElement, Audio or Image tags).

If `item` is an object, you can specify a list of options like so:

- `url` (required) - the URL to the asset
- `type` - the loader type name, can be `'image'`, `'audio'`, etc (see [full list](#loaders) below). If not specified, it will be inferred from file extension if possible. If no loader is found by the extension, or no extension exists, the returned Promise will reject with an error.

Loaders may have individual options that can also be passed down into them, such as `crossOrigin` on Image:

```js
const image = await load({ url: 'foo.png', crossOrigin: 'Anonymous' });
```

You can also pass a function to `type` if you have a custom loader, see [test/custom-type.js](./test/custom-type.js) for an example loading the Wavefront OBJ format. This way you can integrate other game/app-specific asset types into a single sequence of progress events.

#### `assets = load.all(items, [progress])`

This loads an array or map of `items`, loading them all in parallel, and returns the result when all are finished loading. 

If you specify an array, the returned Promise resolves to an array of loaded values corresponding to the same order as the `items`. Alternatively, you can specify an object to receive back a map with named values.

```js
async function start () {
  // Resolves to an array of images
  const images = await load.all([ 'a.png', 'b.png' ]);
  console.log(images[0].width);

  // Resolves to an object mapping
  const assets = await load.all({
    normal: 'foo/normal.png',
    diffuse: 'foo/diffuse.png'
  });
  console.log(assets.normal.width, assets.diffuse.width);
}
```

You can optionally specify a `progress` callback function which gets triggered after each item is loaded, passed with an `event` object:

- `count` - number of items that have been loaded
- `total` - number of total items in the queue
- `progress` - a number between 0 (exclusive) and 1 (inclusive) of load completion
- `target` - an object or string representing the asset descriptor to load
- `value` - the loaded value for this target

> *Note:* With this function, if one asset fails to load, the loading will stop and reject early.

#### `assets = load.any(items, [progress])`

The same as `load.all`, except that any errors in loading (for e.g. 404 assets) will be caught and resolved to `null`, so that other assets can continue loading.

If a resource did not load, an additional `error` property will be added to the `progress` callback event for that resource.

Example:

```js
async function start () {
  // Resolves to an array of images
  const results = await load.any([ 'a.png', 'b.png' ], ({ error }) => {
    // Log error to avoid developer errors
    if (error) console.error(error);
  });

  // Filter out any images that couldn't load
  const images = results.filter(Boolean);
  // ... do something ...
}
```

## Nesting

If you pass a Promise to the load funtion, it will simply be returned. This allows for nesting features, for example:

```js
loader.all({
  tiles: loader.all([ 'a.png', 'b.png', 'c.png' ]),
  group: loader.all({
    iconA: 'bar.png',,
    iconB: 'foo.png'
  })
}).then(assets => {
  console.log(assets.tiles[0], assets.group.iconA.width);
});
```

## Loaders

All loaders, their inferred extensions, and any additional options are detailed below. You can specify a `type` option, such as `'image'` or `'blob'`, to override the extension lookup.

#### `'image'`

<sup>**Extensions:** *jpg, jpeg, svg, png, gif, webp, bmp, tga, tif, apng, wbpm, ico*</sup>

Resolves to an Image tag. You can also pass `crossOrigin` in options for images, e.g. `{ crossOrigin: 'Anonymous' }`.

#### `'json'`

<sup>**Extensions:** *json*</sup>

Resolves to parsed JSON data.

#### `'text'`

<sup>**Extensions:** *txt*</sup>

Resolves to a text string.

#### `'audio'` / `'video'`

<sup>**Audio Extensions:** *mp3, ogg, wav, midi, and more*  
**Video Extensions:** *mp4, m4v, mov, mkv, mpeg, and more*</sup>

See [here](https://github.com/mattdesl/browser-media-mime-type/blob/master/mime-types.json) for all inferred audio and video extensions.

Additional options for `audio` & `video` types:

- `crossOrigin` - e.g. 'Anonymous'
- `event` - the load event to wait for, default `'canplay'`, can also be: `'canplaythrough'`, `'loadeddata'`, `'loadedmetadata'`
- Additional media properties: *volume, preload, playbackRate, muted, currentTime, controls, autoPlay*

#### `'binary'`

<sup>**Extensions:** *bin*</sup>

Resolves to an ArrayBuffer.

#### `'blob'`

Not associated with any file extensions.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/load-asset/blob/master/LICENSE.md) for details.
