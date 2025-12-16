export function stripTwTags(input = "") {
    if (typeof input !== "string") return "";

    let out = "";
    let i = 0;

    while (i < input.length) {
        if (input[i] === "[") {
            const end = input.indexOf("]", i);
            if (end === -1) {
                // broken tag → keep literal
                out += input[i++];
                continue;
            }

            const token = input.slice(i + 1, end).trim();

            // opening or closing tag → drop entirely
            if (token === "/" || token.length > 0) {
                i = end + 1;
                continue;
            }
        }

        out += input[i++];
    }

    return out;
}
