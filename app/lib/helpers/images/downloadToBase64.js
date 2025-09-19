import axios from "axios";

async function fetchImageAsDataURL(url) {
    const res = await axios.get(url, {
        responseType: "arraybuffer", // get raw bytes
        headers: {
            'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'referer': 'https://app.onecompiler.com/',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) ' +
                          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
        }
    });

    const mime = res.headers["content-type"] || "image/webp";
    const base64 = Buffer.from(res.data, "binary").toString("base64");

    return `data:${mime};base64,${base64}`;
}

export default fetchImageAsDataURL;
