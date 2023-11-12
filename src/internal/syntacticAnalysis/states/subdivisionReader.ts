import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { Token } from "../../lexicalAnalysis/token";
import { Deserializer } from "../deserializer";
import { TimingChange } from "../timingChange";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class SubdivisionReader {
    public static process(parent: Deserializer, token: Token) {
        if (token.lexeme[0] === "#") {
            const explicitTempo = parseFloat(token.lexeme.slice(1));

            if (isNaN(explicitTempo))
                throw new UnexpectedCharacterException(token.line, token.character + 1, '0~9, or "."');

            let newTimingChange;
            {
                const oldTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
                newTimingChange = new TimingChange();
                newTimingChange.tempo = oldTimingChange.tempo;
                newTimingChange.subdivisions = oldTimingChange.subdivisions;
            }

            newTimingChange.setSeconds(explicitTempo);
            newTimingChange.time = parent.currentTime;

            if (
                Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <=
                1.401298e-45
            )
                parent.timingChanges.pop();

            parent.timingChanges.push(newTimingChange);
            return;
        }

        const subdivision = parseFloat(token.lexeme);

        if (isNaN(subdivision)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

        let newTimingChange;
        {
            const oldTimingChange = parent.timingChanges[parent.timingChanges.length - 1];
            newTimingChange = new TimingChange();
            newTimingChange.tempo = oldTimingChange.tempo;
            newTimingChange.subdivisions = oldTimingChange.subdivisions;
        }

        newTimingChange.subdivisions = subdivision;
        newTimingChange.time = parent.currentTime;

        if (Math.abs(parent.timingChanges[parent.timingChanges.length - 1].time - parent.currentTime) <= 1.401298e-45)
            parent.timingChanges.pop();

        parent.timingChanges.push(newTimingChange);
    }
}
