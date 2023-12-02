import { EachStyle } from "../../structures/eachStyle";
import { MaiChart } from "../../structures/maiChart";
import { NoteCollection } from "../../structures/noteCollection";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class Serializer {
    private _currentTimingChange: number = 0;
    private _currentNoteCollection: number = 0;
    private _currentTime: number = 0;

    // there's no such thing as StringWriter in TypeScript
    public serialize(chart: MaiChart): string {
        let writer = "";

        writer += `(${chart.timingChanges[this._currentTimingChange].tempo})`;
        writer += `{${chart.timingChanges[this._currentTimingChange].subdivisions}}`;

        while (this._currentTime <= (chart.finishTiming ? chart.finishTiming : 0)) {
            if (
                this._currentTimingChange < chart.timingChanges.length - 1 &&
                Math.abs(chart.timingChanges[this._currentTimingChange + 1].time - this._currentTime) < 1.401298E-45
            ) {
                this._currentTimingChange++;

                if (
                    Math.abs(
                        chart.timingChanges[this._currentTimingChange].tempo -
                            chart.timingChanges[this._currentTimingChange - 1].tempo
                    ) > 1.401298E-45
                ) {
                    writer += `(${chart.timingChanges[this._currentTimingChange].tempo})`;
                }

                if (
                    Math.abs(
                        chart.timingChanges[this._currentTimingChange].subdivisions -
                            chart.timingChanges[this._currentTimingChange - 1].subdivisions
                    ) > 1.401298E-45
                ) {
                    writer += `{${chart.timingChanges[this._currentTimingChange].subdivisions}}`;
                }
            }

            if (
                this._currentNoteCollection < chart.noteCollections.length &&
                Math.abs(chart.noteCollections[this._currentNoteCollection].time - this._currentTime) <= 1.401298E-45
            ) {
                writer += Serializer.serializeNoteCollection(chart.noteCollections[this._currentNoteCollection]);

                this._currentNoteCollection++;
            }

            const timingChange = chart.timingChanges[this._currentTimingChange];
            this._currentTime += timingChange.secondsPerBeat;
            writer += ",";
        }
        writer += "E";

        return writer;
    }

    private static serializeNoteCollection(notes: NoteCollection): string {
        let writer = "";

        const seperator = notes.eachStyle === EachStyle.ForceBroken ? "`" : "/";

        if (notes.eachStyle === EachStyle.ForceEach) writer += "0/";

        for (let i = 0; i < notes.length; i++) {
            writer += notes[i].write();

            if (i !== notes.length - 1) writer += seperator;
        }

        return writer;
    }
}
