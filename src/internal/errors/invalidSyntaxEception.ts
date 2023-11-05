import { SimaiException } from "./simaiException";

export class InvalidSyntaxException extends SimaiException {
    constructor(line: number, character: number, message?: string) {
        super(line, character, message);
        this.name = "InvalidSyntaxException";
    }
}
