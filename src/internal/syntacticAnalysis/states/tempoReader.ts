import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { Token } from "../../lexicalAnalysis/token";
import { Deserializer } from "../deserializer";
import { TimingChange } from "../timingChange";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class TempoReader {
    public static process(parent: Deserializer, token: Token) {
        const tempo = parseFloat(token.lexeme);

        if (isNaN(tempo)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

        let newTimingChange;
        {
            const oldTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
            newTimingChange = new TimingChange();
            newTimingChange.tempo = oldTimingChange.tempo;
            newTimingChange.subdivisions = oldTimingChange.subdivisions;
        }

        newTimingChange.tempo = tempo;
        newTimingChange.time = parent.currentTime;

        if (Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <= 1.401298e-45)
            parent.timingChanges.pop();

        parent.timingChanges.push(newTimingChange);
    }
}
