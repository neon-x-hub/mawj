import { tailwindToInlineStyle as twToInline } from "./css.js";

export class StyledTextParser {
    parse(input) {
        let i = 0;
        const len = input.length;

        const stack = [
            { style: "", content: "" } // root
        ];

        while (i < len) {
            if (input[i] === "[") {
                const end = input.indexOf("]", i);
                if (end === -1) break;

                const token = input.slice(i + 1, end).trim();

                // closing tag: [/], [ / ], etc.
                if (token === "/") {
                    if (stack.length > 1) {
                        const node = stack.pop();
                        const parent = stack[stack.length - 1];

                        parent.content += `<span style="${node.style}">${node.content}</span>`;
                    }

                    i = end + 1;
                    continue;
                }

                // opening tag
                stack.push({
                    style: twToInline(token),
                    content: ""
                });

                i = end + 1;
                continue;
            }

            // normal characters
            stack[stack.length - 1].content += input[i];
            i++;
        }

        return stack[0].content;
    }
}
