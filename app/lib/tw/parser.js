export class StyledTextParser {
  parse(input) {
    let i = 0;

    const root = { type: "root", children: [] };
    const stack = [root];

    while (i < input.length) {
      if (input[i] === "[") {
        const end = input.indexOf("]", i);
        if (end === -1) break;

        const token = input.slice(i + 1, end).trim();

        // closing tag
        if (token === "/") {
          if (stack.length > 1) {
            const node = stack.pop();
            node.end = end + 1;
            stack[stack.length - 1].children.push(node);
          }
          i = end + 1;
          continue;
        }

        // opening tag
        stack.push({
          type: "style",
          tag: token,
          children: [],
          start: i,
          end: null
        });

        i = end + 1;
        continue;
      }

      // text
      const start = i;
      let text = "";

      while (i < input.length && input[i] !== "[") {
        text += input[i++];
      }

      stack[stack.length - 1].children.push({
        type: "text",
        value: text,
        start,
        end: i
      });
    }

    return root;
  }
}
