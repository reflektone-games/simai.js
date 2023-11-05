import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { Token } from "../../lexicalAnalysis/token";
import { Deserializer } from "../deserializer";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class SubdivisionReader {
    public static process(parent: Deserializer, token: Token) {
        if (token.lexeme[0] === "#") {
            const explicitTempo = parseFloat(token.lexeme.slice(1));

            if (isNaN(explicitTempo))
                throw new UnexpectedCharacterException(token.line, token.character + 1, '0~9, or "."');

            parent.currentTiming.explicitOverride(explicitTempo);
            return;
        }

        const subdivision = parseFloat(token.lexeme);

        if (isNaN(subdivision)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

        parent.currentTiming.subdivisions = subdivision;
    }
}
