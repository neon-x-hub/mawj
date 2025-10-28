import Mustache from "mustache";
import he from "he";
import { normalizeDataRow } from './normalise.js';

/**
 * Takes a row of data and a mustache template, and returns
 * the rendered string with HTML entities decoded.
 *
 * @param {Object} row - A row of data
 * @param {string} template - A Mustache template
 * @return {string} The rendered string with HTML entities decoded
 */
export function hydrateString(row, template) {
    const preprocessed = normalizeDataRow(row);
    return he.decode(Mustache.render(template, preprocessed));
}
