import { twind, virtual } from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';

const sheet = virtual(); // for ssr
const tw = twind({
    presets: [presetTailwind()],
}, sheet);

export function tailwindToInlineStyle(classString) {
    const twClasses = tw(classString).split(' ');
    const rules = sheet.target;
    let inline = '';

    for (const rule of rules) {
        for (const cls of twClasses) {
            const prefix = `.${cls}{`;
            if (rule.startsWith(prefix)) {
                const cssContent = rule.slice(prefix.length, -1).trim();
                if (cssContent) {
                    inline += cssContent.endsWith(';') ? cssContent : cssContent + ';';
                }
            }
        }
    }

    return inline;
}
