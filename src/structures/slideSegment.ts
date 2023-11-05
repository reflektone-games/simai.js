import { SlideType } from "./slideType";
import { Location } from "./location";

export class SlideSegment {
    /**
     *  Describes the target buttons
     */
    public vertices: Location[];

    public slideType: SlideType;

    constructor(vertices: Location[] | undefined) {
        this.vertices = vertices ?? [];
        this.slideType = SlideType.StraightLine;
    }
}
