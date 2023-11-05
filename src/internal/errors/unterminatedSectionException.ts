import { SimaiException } from "./simaiException";

export class UnterminatedSectionException extends SimaiException {
    constructor(line: number, character: number, message?: string) {
        super(line, character, message);
        this.name = "UnterminatedSectionException";
    }
}
