import sharp from 'sharp';


/**
 * Creates an empty transparent PNG image of the specified width and height.
 * Uses sharp library to create the image.
 * @param {Object} options - Options object.
 * @param {number} options.width - Width of the image.
 * @param {number} options.height - Height of the image.
 * @param {string} options.outPath - File path to save the image to.
 * @returns {Promise<string>} - Path to the created image file.
 */
export async function createTransparentImage({ width, height, outPath }) {
  // uses sharp to produce an empty transparent PNG
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .png()
    .toFile(outPath);
  return outPath;
}
