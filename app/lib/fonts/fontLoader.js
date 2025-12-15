import makeCssFontName from "./cssName";

export function getFontFormat(file) {
    const ext = file.split('.').pop().toLowerCase();
    switch (ext) {
        case 'ttf': return 'truetype';
        case 'otf': return 'opentype';
        case 'woff': return 'woff';
        case 'woff2': return 'woff2';
        default: return 'truetype';
    }
}

export function loadCustomFont(fontName, fontStyle, fontUrl) {
    const cssFontName = makeCssFontName(fontName, fontStyle);

    const safeId = `font-${CSS.escape(cssFontName)}`;
    const safeUrl = encodeURI(fontUrl);
    const format = getFontFormat(fontUrl);

    // Avoid duplicates (per family + style)
    if (document.getElementById(safeId)) return;

    const style = document.createElement('style');
    style.id = safeId;
    style.textContent = `
@font-face {
    font-family: "${cssFontName.replace(/"/g, '\\"')}";
    src: url("${safeUrl}") format("${format}");
    font-display: swap;
}
    `;

    document.head.appendChild(style);
}
