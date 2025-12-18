/**
 * Scope <style> blocks to #canvas and strip dangerous CSS.
 * @param {string} html - HTML string with <style> tags.
 * @returns {string} - HTML with safe, scoped styles.
 */
function s4(html, parentId) {
    return html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
        // 🚫 remove @import and external urls
        let safeCSS = css
            .replace(/@import[^;]+;/gi, '') // remove @import
            .replace(/url\(["']?(https?:)?[^)"']+["']?\)/gi, ''); // remove external urls


        // naive but works: split by } and reattach
        safeCSS = safeCSS.split('}').map(block => {
            const [selectors, rules] = block.split('{');
            if (!selectors || !rules) return '';
            // prefix each selector
            const scoped = selectors
                .split(',')
                .map(s => `#${parentId} ${s.trim()}`)
                .join(', ');
            return `${scoped} {${rules}}`;
        }).join(' ');

        return `<style>${safeCSS}</style>`;
    });
}

export default s4;
