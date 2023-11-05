import { NoteAppearance } from "./noteAppearance";
import { NoteCollection } from "./noteCollection";
import { NoteStyles } from "./noteStyles";
import { SlideMorph } from "./slideMorph";
import { SlidePath } from "./slidePath";
import { Location } from "./location";
import { NoteType } from "./noteType";

export class Note {
    public parentCollection: NoteCollection;

    public location: Location = new Location(0, 0);
    public styles: NoteStyles = NoteStyles.None;
    public appearance: NoteAppearance = NoteAppearance.Default;
    public type: NoteType = NoteType.Tap;

    public length: number | undefined;

    public slideMorph: SlideMorph = SlideMorph.FadeIn;
    public slidePaths: SlidePath[] = [];

    constructor(parentCollection: NoteCollection) {
        this.parentCollection = parentCollection;
    }

    get isEx() {
        return (this.styles & NoteStyles.Ex) != 0;
    }

    get isStar() {
        return (
            this.appearance >= NoteAppearance.ForceStar ||
            (this.slidePaths.length > 0 && this.appearance !== NoteAppearance.ForceNormal)
        );
    }

    public getVisibleDuration(): number {
        var baseValue = this.length ?? 0;

        if (this.slidePaths.length > 0) baseValue = Math.max(...this.slidePaths.map((s) => s.delay + s.duration));

        return baseValue;
    }
}
