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

        const newTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
        newTimingChange.tempo = tempo;
        newTimingChange.time = parent.currentTime;

        if (Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <= 0.0001)
            parent.timingChanges.pop();

        parent.timingChanges.push(newTimingChange);
    }
}
