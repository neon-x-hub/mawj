import { StyledTextParser } from "./parser";
import { encodeInput } from "./preprocess";

export default function tw(input) {
    const encodedInput = encodeInput(input);
    const parser = new StyledTextParser();
    return parser.parse(encodedInput);
}
