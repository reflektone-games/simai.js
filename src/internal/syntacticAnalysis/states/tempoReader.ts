import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { Token } from "../../lexicalAnalysis/token";
import { Deserializer } from "../deserializer";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class TempoReader {
    public static process(parent: Deserializer, token: Token) {
        const tempo = parseFloat(token.lexeme);

        if (isNaN(tempo)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

        parent.currentTiming.tempo = tempo;
    }
}
