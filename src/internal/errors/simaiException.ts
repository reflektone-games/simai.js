export class SimaiException extends Error {
    public readonly line: number;
    public readonly character: number;

    constructor(line: number, character: number, message?: string) {
        super(message);
        this.name = "SimaiException";
        this.character = character;
        this.line = line;
    }
}
