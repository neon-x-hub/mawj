import fsSync from "fs";
import path from "path";
import axios from "axios";

/**
 * Downloads an audio file from a URL and saves it to a directory.
 * @param {string} url - URL to download from
 * @param {string} downloadDir - Directory to save the file to
 * @returns {Promise<string|null>} A promise that resolves to the path of the downloaded file, or null if there was an error.
 */
export default async function downloadAudio(url, downloadDir) {
    try {
        const fileName = path.basename(new URL(url).pathname);
        const destPath = path.join(downloadDir, fileName);

        // Use fsSync for createWriteStream
        const writer = fsSync.createWriteStream(destPath);

        const response = await axios({
            method: "get",
            url,
            responseType: "stream",
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        return destPath;
    } catch (err) {
        console.error(`Error downloading audio from ${url}: ${err.message}`);
        return null;
    }
}
