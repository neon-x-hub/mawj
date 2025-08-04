export async function loadFontInPuppeteer(page, fontName, fontUrl) {
    const format = getFontFormat(fontUrl);
    const safeUrl = encodeURI(fontUrl);

    await page.evaluate(({ fontName, safeUrl, format }) => {
        const style = document.createElement('style');
        style.innerHTML = `
      @font-face {
        font-family: "${fontName.replace(/"/g, '\\"')}";
        src: url("${safeUrl}") format("${format}");
        font-display: swap;
      }
    `;
        document.head.appendChild(style);
    }, { fontName, safeUrl, format });
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
