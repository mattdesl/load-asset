const load = require('../');
const parseOBJ = require('parse-wavefront-obj');

const OBJ = opt => {
  // Load the resource as text, then parse it as OBJ
  // Here you could promisify a callback-style API, such as THREE.GLTFLoader
  opt = Object.assign({}, opt, { type: 'text' });
  return load(opt).then(result => parseOBJ(result));
};

async function start () {
  const assets = await load.any({
    image: 'fixtures/baboon.png',
    data: 'fixtures/foo.json',
    cube: { url: 'fixtures/cube.obj', type: OBJ }
  }, ev => {
    console.log(`Progress: ${ev.progress}`);
  });
  console.log('Parsed OBJ:', assets.cube.positions, assets.cube.cells);
}

start();
