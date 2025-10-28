import fs from "fs/promises";

function isImage(p) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(p);
}
function isVideo(p) {
  return /\.(mp4|mov|mkv|webm|avi)$/i.test(p);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export { isImage, isVideo, fileExists };
