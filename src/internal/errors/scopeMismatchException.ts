import { SimaiException } from "./simaiException";

export enum ScopeType {
    Note = 1,
    Slide = 1 << 1,
    Global = 1 << 2
}

export class ScopeMismatchException extends SimaiException {
    public readonly correctScope: ScopeType;

    constructor(line: number, character: number, correctScope: ScopeType, message?: string) {
        super(line, character, message);
        this.name = "ScopeMismatchException";
        this.correctScope = correctScope;
    }
}
