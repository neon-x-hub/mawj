/**
 * Encode HTML input to display literally, preserving [tokens] and [/]
 * @param {string} input
 * @returns {string} encoded string
 */
export function encodeInput(input) {
  const tokenMap = {};
  let tokenIndex = 0;

  // [anything] or [/]
  const tokenRegex = /\[\/?\s*[\w\s-]*\]/g;

  const protectedInput = input.replace(tokenRegex, (match) => {
    const key = `__TOKEN_${tokenIndex}__`;
    tokenMap[key] = match;
    tokenIndex++;
    return key;
  });

  const encoded = protectedInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const restored = encoded.replace(/__TOKEN_(\d+)__/g, (_, idx) => tokenMap[`__TOKEN_${idx}__`]);

  return restored;
}
