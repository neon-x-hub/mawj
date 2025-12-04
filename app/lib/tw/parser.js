import { tailwindToInlineStyle as twToInline } from "./css.js";

export class StyledTextParser {
    parse(input) {
        let i = 0;
        const len = input.length;

        const stack = [
            { style: "", content: "" }  // root context
        ];

        while (i < len) {
            // [ ... ]
            if (input[i] === "[" && input[i+1] !== "/") {
                let end = input.indexOf("]", i);
                if (end === -1) break;

                const rawClasses = input.slice(i+1, end).trim();
                stack.push({
                    style: twToInline(rawClasses),
                    content: ""
                });

                i = end + 1;
                continue;
            }

            // [/]
            if (input[i] === "[" && input[i+1] === "/") {
                let end = input.indexOf("]", i);
                if (end === -1) break;

                const node = stack.pop();
                const parent = stack[stack.length - 1];

                parent.content += `<span style="${node.style}">${node.content}</span>`;

                i = end + 1;
                continue;
            }

            // normal chars
            stack[stack.length - 1].content += input[i];
            i++;
        }

        return stack[0].content;
    }
}
