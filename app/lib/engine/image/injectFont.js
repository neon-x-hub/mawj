const BASE_URL = process.env.ASSET_HOST || 'http://localhost:3000';
export async function loadFontInPuppeteer(page, font, cssName) {
    const format = getFontFormat(font.file);
    const safeUrl = encodeURI(BASE_URL + font.url);

    await page.evaluate(({ cssName, safeUrl, format }) => {
        const style = document.createElement('style');
        style.textContent = `
@font-face {
    font-family: "${cssName.replace(/"/g, '\\"')}";
    src: url("${safeUrl}") format("${format}");
    font-display: swap;
}
        `;
        document.head.appendChild(style);
    }, { cssName, safeUrl, format });
}

function getFontFormat(file) {
    const ext = file.split('.').pop().toLowerCase();
    switch (ext) {
        case 'ttf': return 'truetype';
        case 'otf': return 'opentype';
        case 'woff': return 'woff';
        case 'woff2': return 'woff2';
        default: return 'truetype';
    }
}
