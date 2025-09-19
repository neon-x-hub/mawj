import fs from "fs";
import path from "path";

function localFileToDataURL(filePath) {
  const absPath = path.resolve(filePath);
  const buffer = fs.readFileSync(absPath);
  const mime = "image/png"; // or detect with mime-types
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export default localFileToDataURL;
