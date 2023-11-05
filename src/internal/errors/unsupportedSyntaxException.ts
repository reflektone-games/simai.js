import { SimaiException } from "./simaiException";

export class UnsupportedSyntaxException extends SimaiException {
    /**
     * This is thrown when an unsupported syntax is encountered when attempting to tokenize or deserialize the simai file.
     * @param line The line on which the error occurred
     * @param character The first character involved in the error
     */
    constructor(line: number, character: number, message?: string) {
        super(line, character, message);
        this.name = "UnsupportedSyntaxException";
    }
}
