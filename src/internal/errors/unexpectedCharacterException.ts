import { SimaiException } from "./simaiException";

export class UnexpectedCharacterException extends SimaiException {
    public readonly expected: string;

    /**
     * This is thrown when reading a character that is not fit for the expected syntax
     * This issue is commonly caused by a typo or a syntax error.
     * @param line The line on which the error occurred
     * @param character The first character involved in the error
     * @param expected The expected syntax
     */
    constructor(line: number, character: number, expected: string, message?: string) {
        super(line, character, message);
        this.name = "UnexpectedCharacterException";
        this.expected = expected;
    }
}
