const load = require('../');
const parseOBJ = require('parse-wavefront-obj');

const OBJ = async opt => {
  // First load the resource as text
  const text = await load({ ...opt, type: 'text' });
  // Then parse the OBJ file format
  return parseOBJ(text);
};

async function preload () {
  // Now we have a custom OBJ asset alongside the rest of our preloader
  const assets = await load.any({
    cube: { url: 'fixtures/cube.obj', type: OBJ },
    image: 'fixtures/baboon.png',
    data: 'fixtures/foo.json'
  }, ev => {
    console.log(`Progress: ${ev.progress}`);
  });
  console.log('Parsed OBJ:', assets.cube.positions, assets.cube.cells);
  return assets;
}

preload();
