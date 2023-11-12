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

            // TODO: This might not copy the object and just be a reference.
            const newTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
            newTimingChange.explicitOverride(explicitTempo);

            if (Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <= 0.0001)
                parent.timingChanges.pop();

            parent.timingChanges.push(newTimingChange);
            return;
        }

        const subdivision = parseFloat(token.lexeme);

        if (isNaN(subdivision)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

        const newTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
        newTimingChange.subdivisions = subdivision;

        // TODO: This might not copy the object and just be a reference.
        if (Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <= 0.0001)
            parent.timingChanges.pop();

        parent.timingChanges.push(newTimingChange);
    }
}
