const load = require('../');

// A custom font loader
const Font = async (opt) => {
  return new window.FontFace(opt.family, `url(${opt.url})`).load();
};

// Render a Canvas2D graphic with a loaded image + custom font
const draw = async () => {
  // First, preload font and image assets
  const { background, font } = await load.all({
    background: 'fixtures/baboon.png',
    font: { url: 'fixtures/Oswald-Medium.ttf', family: 'Oswald', type: Font }
  });

  // Then, add the font to the document so that it can be rendered in Canvas2D
  document.fonts.add(font);

  // Create a <canvas> and grab its 2D context
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Draw the loaded background image...
  context.drawImage(background, 0, 0);

  // Now set & draw the loaded font
  context.font = `40px ${font.family}`;
  context.lineWidth = 2;
  context.strokeStyle = 'white';
  context.strokeText('loaded.', 8, 75);
  return canvas;
};

// Draw the canvas graphics and then append it to the body.
(async () => {
  const canvas = await draw();
  document.body.appendChild(canvas);
})();
