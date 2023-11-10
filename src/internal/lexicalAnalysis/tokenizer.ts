import { UnexpectedCharacterException } from "../errors/unexpectedCharacterException";
import { UnterminatedSectionException } from "../errors/unterminatedSectionException";
import { UnsupportedSyntaxException } from "../errors/unsupportedSyntaxException";
import { TokenType } from "./tokenType";
import { Token } from "./token";

export class Tokenizer {
    private readonly space: string = String.fromCharCode(0x0020);
    private readonly enSpace: string = String.fromCharCode(0x2002);
    private readonly punctuationSpace: string = String.fromCharCode(0x2008);
    private readonly ideographicSpace: string = String.fromCharCode(0x3000);

    private readonly lineSeparator: string = String.fromCharCode(0x2028);
    private readonly paragraphSeparator: string = String.fromCharCode(0x2029);

    private readonly endOfFileChar: string = "E";

    private readonly eachDividerChars: ReadonlySet<string> = new Set(["/", "`"]);

    private readonly decoratorChars: ReadonlySet<string> = new Set(["f", "b", "x", "h", "m", "!", "?", "@", "$"]);

    private readonly slideChars: ReadonlySet<string> = new Set(["-", ">", "<", "^", "p", "q", "v", "V", "s", "z", "w"]);

    private readonly separatorChars: ReadonlySet<string> = new Set([
        "\r",
        "\t",
        this.lineSeparator,
        this.paragraphSeparator,
        this.space,
        this.enSpace,
        this.punctuationSpace,
        this.ideographicSpace
    ]);

    private readonly _sequence: string;
    private _current: number = 0;
    private _charIndex: number = 0;
    private _line: number = 1;

    private _start: number = 0;

    constructor(sequence: string) {
        this._sequence = sequence;
    }

    private get isAtEnd(): boolean {
        return this._current >= this._sequence.length;
    }

    public *getTokens(): Generator<Token> {
        while (!this.isAtEnd) {
            this._start = this._current;
            const token = this.scanToken();

            if (token !== undefined) yield token;
        }
    }

    private scanToken(): Token | undefined {
        this._charIndex++;

        const c = this.advance();

        if (this.decoratorChars.has(c)) return this.compileToken(TokenType.Decorator);
        else if (this.eachDividerChars.has(c)) return this.compileToken(TokenType.EachDivider);
        else if (this.separatorChars.has(c)) return undefined;

        switch (c) {
            case ",":
                return this.compileToken(TokenType.TimeStep);

            case "(":
                return this.compileSectionToken(TokenType.Tempo, "(", ")");
            case "{":
                return this.compileSectionToken(TokenType.Subdivision, "{", "}");
            case "[":
                return this.compileSectionToken(TokenType.Duration, "[", "]");

            case "*":
                return this.compileToken(TokenType.SlideJoiner);

            case "\n":
                this._line++;
                this._charIndex = 0;
                return undefined;

            case this.endOfFileChar:
                try {
                    const [isLocationToken, locationLength] = this.tryScanLocationToken();
                    if (isLocationToken) {
                        this._current += locationLength - 1;
                        return this.compileToken(TokenType.Location);
                    }
                } catch (ignored) {}

                return this.compileToken(TokenType.EndOfFile);

            case "|": {
                if (this.peek() !== "|") throw new UnexpectedCharacterException(this._line, this._charIndex, "|");

                while (this.peek() !== "\n" && !this.isAtEnd) this.advance();

                return undefined;
            }
        }

        const [isLocationToken, locationLength] = this.tryScanLocationToken();
        if (isLocationToken) {
            this._current += locationLength - 1;
            return this.compileToken(TokenType.Location);
        }

        const [isSlideDeclaration, slideLength] = this.isReadingSlideDeclaration();
        if (isSlideDeclaration) {
            this._current += slideLength - 1;
            return this.compileToken(TokenType.Slide);
        }

        throw new UnsupportedSyntaxException(this._line, this._charIndex);
    }

    /**
     * @returns [result, length]
     */
    private tryScanLocationToken(): [boolean, number] {
        const firstLocationChar = this.peekPrevious();

        if (Tokenizer.isButtonLocation(firstLocationChar)) return [true, 1];
        if (!Tokenizer.isSensorLocation(firstLocationChar)) return [false, 0];

        const secondLocationChar = this.peek();

        if (Tokenizer.isButtonLocation(secondLocationChar)) return [true, 2];
        if (firstLocationChar === "C") return [true, 1];

        const secondCharIsEmpty =
            this.separatorChars.has(secondLocationChar) || secondLocationChar === "\n" || secondLocationChar === "\0";

        // This is the notation for EOF.
        if (firstLocationChar === this.endOfFileChar && secondCharIsEmpty) return [false, 0];

        throw new UnexpectedCharacterException(this._line, this._charIndex, "1, 2, 3, 4, 5, 6, 7, 8");
    }

    /**
     * @returns [result, length]
     */
    private isReadingSlideDeclaration(): [boolean, number] {
        if (!this.slideChars.has(this.peekPrevious())) return [false, 0];

        const nextChar = this.peek();

        return [true, nextChar === "p" || nextChar === "q" ? 2 : 1];
    }

    private compileSectionToken(tokenType: TokenType, initiator: string, terminator: string): Token {
        this._start++;

        while (this.peek() !== terminator) {
            if (this.isAtEnd || this.peek() === initiator)
                throw new UnterminatedSectionException(this._line, this._charIndex);

            this.advance();
        }

        const token = this.compileToken(tokenType);

        // The terminator.
        this.advance();

        return token;
    }

    private compileToken(type: TokenType): Token {
        const text = this._sequence.substring(this._start, this._current);
        return new Token(type, text, this._line, this._charIndex);
    }

    private static isSensorLocation(value: string): boolean {
        return value.charCodeAt(0) >= "A".charCodeAt(0) && value.charCodeAt(0) <= "E".charCodeAt(0);
    }

    private static isButtonLocation(value: string): boolean {
        return value.charCodeAt(0) >= "0".charCodeAt(0) && value.charCodeAt(0) <= "8".charCodeAt(0);
    }

    /**
     * @returns the {@link _current} glyph, and increments by one.
     */
    private advance(): string {
        return this._sequence[this._current++];
    }

    /**
     * @returns the {@link _current} glyph without incrementing.
     */
    private peek(): string {
        return this.isAtEnd ? "" : this._sequence[this._current];
    }

    /**
     * @returns the last glyph without decrementing.
     */
    private peekPrevious(): string {
        return this._current == 0 ? "" : this._sequence[this._current - 1];
    }
}
