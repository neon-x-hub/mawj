export default class RGBA {
    /**
     * Create from {r,g,b,a}. All channels are validated & clamped.
     * @param {Object} obj   – { r:0-255, g:0-255, b:0-255, a:0-1 }
     */
    constructor(obj = {}) {
        const { r, g, b, a } = RGBA.#normalize(obj);
        this.r = r; this.g = g; this.b = b; this.a = a;
        Object.freeze(this);                // make the instance immutable
    }

    /* ────────── PUBLIC CONVERSION METHODS ────────── */

    /** → "rgba(r, g, b, a)" -- suitable for CSS */
    toCSS() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.#round(this.a, 3)})`;
    }

    /**
     * → hexadecimal string
     * @param {boolean} withAlpha  – include 2-digit alpha? (default: false)
     * @returns "#rrggbb" | "#rrggbbaa"
     */
    toHex(withAlpha = false) {
        const hex = n => n.toString(16).padStart(2, "0");
        const rgb = hex(this.r) + hex(this.g) + hex(this.b);
        return "#" + (withAlpha ? rgb + hex(Math.round(this.a * 255)) : rgb);
    }

    /** → [r, g, b, a]  */
    toArray() {
        return [this.r, this.g, this.b, this.a];
    }

    /** → { r, g, b, a }  */
    toObject() {
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }

    /* ────────── STATIC HELPERS ────────── */

    /**
     * Build from a CSS string – handles:
     *   "rgba(0, 0, 0, 0.5)"
     *   "rgba(0,0,0,0.5)"
     *   "rgba(0 0 0 / 0.5)"
     *   "rgb(34 34 34)"           …etc.
     */
    static fromCSS(str = "") {
        // 1) optional commas *and/or* spaces between channels
        // 2) optional "/" or "," before the alpha channel
        const re = /^rgba?\(\s*([0-9]{1,3})\s*,?\s*([0-9]{1,3})\s*,?\s*([0-9]{1,3})(?:\s*(?:[,/]|\/)\s*([01](?:\.\d+)?))?\s*\)$/i;

        const m = str.trim().match(re);
        if (!m) throw new TypeError(`✖ Malformed CSS color string: "${str}"`);

        // r-g-b are integers, a is float (default 1)
        const [, r, g, b, a = "1"] = m;
        return new RGBA({ r: +r, g: +g, b: +b, a: +a });
    }

    /** Quick validity check without creating an instance */
    static isValid({ r, g, b, a }) {
        return [r, g, b].every(c => Number.isInteger(c) && c >= 0 && c <= 255) &&
            typeof a === "number" && a >= 0 && a <= 1;
    }

    /* ────────── PRIVATE SECTION ────────── */

    /** Clamp + validate incoming object */
    static #normalize({ r, g, b, a }) {
        const err = msg => { throw new TypeError(`✖ ${msg}`); };

        const toInt = (v, ch) => {
            if (!Number.isFinite(v)) err(`"${ch}" must be a number`);
            return Math.min(255, Math.max(0, Math.round(v)));
        };

        const toAlpha = v => {
            if (!Number.isFinite(v)) err('"a" must be a number');
            return Math.min(1, Math.max(0, v));
        };

        return {
            r: toInt(r, "r"),
            g: toInt(g, "g"),
            b: toInt(b, "b"),
            a: toAlpha(a)
        };
    }

    /** small helper to avoid ugly "0.3333333333" */
    #round(num, decimals = 2) {
        const f = 10 ** decimals;
        return Math.round(num * f) / f;
    }
}
