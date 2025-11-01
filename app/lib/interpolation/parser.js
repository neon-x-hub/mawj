class InterpolationRecipeParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.points = [];
        this.unit = null;
        this.variable = "textLength";
        this.consider_diacritics = false;
        this.errors = [];
    }

    /**
     * Parse a recipe string into an interpolation object.
     * @param {string} input - The raw recipe text (textarea-style).
     * @returns {object} Structured interpolation object.
     */
    parse(input) {
        this.reset();

        if (typeof input !== "string" || !input.trim()) {
            this.errors.push("Input is empty or not a string.");
            return null;
        }

        const lines = input
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            // Match numeric mappings: e.g. "10 -> 72"
            const match = line.match(/^(\d+(?:\.\d+)?)\s*->\s*(\d+(?:\.\d+)?)$/);
            if (match) {
                this.points.push({ x: Number(match[1]), y: Number(match[2]) });
                return;
            }

            // Match "unit: something"
            const unitMatch = line.match(/^unit\s*:\s*(\S+)$/i);
            if (unitMatch) {
                this.unit = unitMatch[1];
                return;
            }

            // Match "variable: something" (optional)
            const varMatch = line.match(/^variable\s*:\s*(\S+)$/i);
            if (varMatch) {
                this.variable = varMatch[1];
                return;
            }

            // Match "consider_diacritics"
            if (/^consider_diacritics$/i.test(line)) {
                this.consider_diacritics = true;
                return;
            }

            // Anything else is unrecognized
            this.errors.push(`Line ${lineNumber}: Unrecognized syntax → "${line}"`);
        });

        // Basic validation
        if (this.points.length === 0) {
            this.errors.push("No interpolation points found (e.g., '10 -> 72').");
        }

        return this.errors.length ? null : this.buildResult();
    }

    buildResult() {
        return {
            type: "interpolation",
            variable: this.variable,
            points: this.points,
            unit: this.unit || null,
            consider_diacritics: this.consider_diacritics
        };
    }

    /**
     * Test if the recipe is parsable (for UI feedback).
     * @param {string} input - The recipe text.
     * @returns {{success: boolean, result: object|null, errors: string[]}}
     */
    static test(input) {
        const parser = new InterpolationRecipeParser();
        const result = parser.parse(input);

        return {
            success: parser.errors.length === 0,
            result,
            errors: parser.errors
        };
    }
}

export default InterpolationRecipeParser;
