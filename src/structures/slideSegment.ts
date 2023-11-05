import { Location } from "./location";
import { SlideType } from "./slideType";

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
