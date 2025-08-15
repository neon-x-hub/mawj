/**
 * Normalise a key, removing whitespace and replacing spaces with underscores
 * @param {string} key
 */
export const normalizeKey = (key) => key.trim().replace(/\s+/g, '_');

/**
 * Flattens and normalises a data row for filtering/comparison.
 * - Metadata keys are prefixed with "m."
 * - Data keys are normalised directly
 *
 * @param {Object} row
 * @returns {Object} Normalised row
 */
export const normalizeDataRow = (row) => {
    const normalized = {};

    // Normalize meta attributes with "m." prefix
    for (const [key, value] of Object.entries(row)) {
        if (key === 'data') continue;
        normalized[`m.${normalizeKey(key)}`] = value;
    }

    // Normalize data keys
    if (row.data && typeof row.data === 'object') {
        for (const [key, value] of Object.entries(row.data)) {
            normalized[normalizeKey(key)] = value;
        }
    }

    return normalized;
};
