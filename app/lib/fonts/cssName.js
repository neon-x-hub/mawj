export default function makeCssFontName(family, style) {
    return `${family}__${style}`.replace(/\s+/g, ' ').trim();
}
