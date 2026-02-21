import { StyledTextParser } from "./parser";
import { TwHTMLRenderer } from "./renderers/html";
import { encodeInput } from "./preprocess";
import { tailwindToInlineStyle } from "./css";

/**
 * Converts a string containing Tailwind CSS classes into an HTML string.
 * @param {string} input - The string to convert, containing Tailwind CSS classes.
 * @returns {string} - The converted HTML string.
 * @example
 * const html = tw(
 *   "Hello [font-bold text-red-500]important[/] text with [italic text-blue-500]colors"
 * );
 * console.log(html); // <span class="font-bold text-red-500">Hello</span> <span class="italic text-blue-500">text with colors</span>
 */
export default function tw(input) {
    const encodedInput = encodeInput(input);
    const parser = new StyledTextParser();
    const renderer = new TwHTMLRenderer();
    const ast = parser.parse(encodedInput);
    const html = renderer.render(ast, tailwindToInlineStyle);
    return html;
}
