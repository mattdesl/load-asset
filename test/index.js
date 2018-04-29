const test = require('tape');
const loader = require('../');

test('should load images', async t => {
  t.plan(2);
  const result = await loader('fixtures/baboon.png');
  t.equal(result.width, 128);
  t.equal(result.height, 128);
});

test('should load images with query param', async t => {
  t.plan(2);
  const result = await loader('fixtures/baboon.png?cachebust=213');
  t.equal(result.width, 128);
  t.equal(result.height, 128);
});

test('should load image without extension', async t => {
  t.plan(2);
  const result = await loader({ url: 'fixtures/baboon-no-ext', type: 'image' });
  t.equal(result.width, 128);
  t.equal(result.height, 128);
});

test('should reject without extension', t => {
  t.plan(1);
  loader('fixtures/baboon-no-ext').then(() => t.fail('should not succeed'), () => t.ok(true));
});

test('should reject without URL', t => {
  t.plan(1);
  loader('').then(() => t.fail('should not succeed'), () => t.ok(true));
});

test('should load json', async t => {
  t.plan(1);
  const result = await loader('fixtures/foo.json');
  t.equal(result.hello, 'world');
});

test('should reject with JSON error', t => {
  t.plan(1);
  loader('fixtures/foo-err.json').then(() => t.fail('should not succeed'), () => t.ok(true));
});

test('should load text files for all other extensions', async t => {
  t.plan(1);
  const result = await loader('fixtures/test.txt');
  t.equal(result, 'hello, world!');
});

test('should load binary', async t => {
  t.plan(1);
  const result = await loader('fixtures/other.bin');
  t.deepEqual(new Float32Array(result), new Float32Array([ 1.5, 2.5, 500 ]));
});

test('should load audio blob', async t => {
  t.plan(3);
  const result = await loader({ url: 'fixtures/bluejean_short.mp3', type: 'blob' });
  t.ok(result instanceof window.Blob);
  t.equal(result.size, 241988);
  t.equal(result.type, 'audio/mpeg');
});

test('should load audio file', async t => {
  t.plan(1);
  const result = await loader('fixtures/bluejean_short.mp3');
  t.equal(Math.floor(result.duration), 15);
});

test('should load audio file with loadeddata event', async t => {
  t.plan(1);
  const result = await loader({ url: 'fixtures/bluejean_short.mp3', event: 'loadeddata' });
  t.equal(Math.floor(result.duration), 15);
});

test('should load audio file with loadedmetadata event', async t => {
  t.plan(1);
  const result = await loader({ url: 'fixtures/bluejean_short.mp3', event: 'loadedmetadata' });
  t.equal(Math.floor(result.duration), 15);
});

test('should load audio file with canplaythrough event', async t => {
  t.plan(1);
  const result = await loader({ url: 'fixtures/bluejean_short.mp3', event: 'canplaythrough' });
  t.equal(Math.floor(result.duration), 15);
});

test('can load mp4 with audio type', async t => {
  t.plan(1);
  const result = await loader({ url: 'fixtures/giphy.mp4', type: 'audio', event: 'loadedmetadata' });
  t.equal(Math.floor(result.duration), 1);
});

test('can load mp4 with video type', async t => {
  t.plan(1);
  const result = await loader('fixtures/giphy.mp4');
  t.equal(Math.floor(result.duration), 1);
});

test('load multiple as a named object', async t => {
  t.plan(2);
  const result = await loader.all({
    message: 'fixtures/test.txt',
    image: { url: 'fixtures/baboon-no-ext', type: 'image' }
  });
  t.equal(result.message, 'hello, world!');
  t.equal(result.image.width, 128);
});

test('load multiple as a list of descriptors', async t => {
  t.plan(2);
  const result = await loader.all([
    'fixtures/test.txt',
    { url: 'fixtures/baboon-no-ext', type: 'image' }
  ]);
  t.equal(result[0], 'hello, world!');
  t.equal(result[1].width, 128);
});

test('load multiple while allowing failures', async t => {
  t.plan(2);
  const result = await loader.any([
    'fixtures/test.txt',
    'fixtures/does-not-exist.txt'
  ]);
  t.equal(result[0], 'hello, world!');
  t.deepEqual(result[1], null);
});

test('array should emit progress', async t => {
  t.plan(2);
  let curCount = 0;
  await loader.any([
    'fixtures/test.txt',
    'fixtures/baboon.png'
  ], ev => {
    t.equal(ev.count, ++curCount);
  });
});

test('array should emit progress', async t => {
  t.plan(4);
  let curCount = 0;
  await loader.any([
    'fixtures/test.txt',
    'fixtures/not-found.png',
    'fixtures/baboon.png'
  ], ev => {
    if (ev.error) {
      t.ok(ev.error, 'got error');
    }
    t.equal(ev.count, ++curCount);
  });
});
