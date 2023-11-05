import { TokenType } from "./tokenType";

export class Token {
    public readonly type: TokenType;
    public readonly lexeme: string;

    public readonly line: number;
    public readonly character: number;

    constructor(type: TokenType, lexeme: string, line: number, character: number) {
        this.type = type;
        this.lexeme = lexeme;

        this.line = line;
        this.character = character;
    }
}
