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

    public write(startLocation: Location): string {
        let writer = "";

        switch (this.slideType) {
            case SlideType.StraightLine:
                writer += `-${this.vertices[0]}`;
                break;
            case SlideType.RingCw:
                writer += (startLocation.index + 2) % 8 >= 4 ? `<${this.vertices[0]}` : `>${this.vertices[0]}`;
                break;
            case SlideType.RingCcw:
                writer += (startLocation.index + 2) % 8 >= 4 ? `<${this.vertices[0]}` : `>${this.vertices[0]}`;
                break;
            case SlideType.Fold:
                writer += `v${this.vertices[0]}`;
                break;
            case SlideType.CurveCw:
                writer += `q${this.vertices[0]}`;
                break;
            case SlideType.CurveCcw:
                writer += `pp${this.vertices[0]}`;
                break;
            case SlideType.ZigZagS:
                writer += `s${this.vertices[0]}`;
                break;
            case SlideType.ZigZagZ:
                writer += `z${this.vertices[0]}`;
                break;
            case SlideType.EdgeFold:
                writer += `V${this.vertices[0]}${this.vertices[1]}`;
                break;
            case SlideType.EdgeCurveCw:
                writer += `qq${this.vertices[0]}`;
            case SlideType.EdgeCurveCcw:
                writer += `pp${this.vertices[0]}`;
            case SlideType.Fan:
                writer += `w${this.vertices[0]}`;
            // default:
            //     throw new ArguementOutOfRangeException();
        }

        return writer;
    }
}
