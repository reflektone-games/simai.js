import { Location } from "./location";
import { NoteType } from "./noteType";
import { SlideSegment } from "./slideSegment";

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
}
