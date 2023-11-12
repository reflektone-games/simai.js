import { SlideSegment } from "./slideSegment";
import { Location } from "./location";
import { NoteType } from "./noteType";

export class SlidePath {
    public startLocation: Location = new Location(0, 0);
    public segments: SlideSegment[];

    /**
     * The intro delay of a slide before it starts moving.
     */
    public delay = 0;

    public duration = 0;

    public type: NoteType = NoteType.Slide;

    constructor(segments: SlideSegment[]) {
        this.segments = segments;
    }

    public write(): string {
        let writer = "";

        for (const segment of this.segments) {
            writer += segment.write(this.startLocation);
        }

        if (this.type === NoteType.Break) writer += "b";

        writer += `[${this.delay.toFixed(7)}##${this.duration.toFixed(7)}]`;

        return writer;
    }
}
