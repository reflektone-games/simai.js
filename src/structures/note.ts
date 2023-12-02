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
        return (this.styles & NoteStyles.Ex) !== 0;
    }

    get isStar() {
        return (
            this.appearance >= NoteAppearance.ForceStar ||
            (this.slidePaths.length > 0 && this.appearance !== NoteAppearance.ForceNormal)
        );
    }

    public getVisibleDuration(): number {
        let baseValue = this.length ?? 0;

        if (this.slidePaths.length > 0) baseValue = Math.max(...this.slidePaths.map((s) => s.delay + s.duration));

        return baseValue;
    }

    public write(): string {
        let writer = "";

        writer += this.location.toString();

        if ((this.styles & NoteStyles.Ex) !== 0) writer += "x";

        if ((this.styles & NoteStyles.Mine) !== 0) writer += "m";

        if (this.type === NoteType.ForceInvalidate) writer += this.slideMorph === SlideMorph.FadeIn ? "?" : "!";

        switch (this.appearance) {
            case NoteAppearance.ForceNormal:
                writer += "@";
                break;
            case NoteAppearance.ForceStarSpinning:
                writer += "$$";
                break;
            case NoteAppearance.ForceStar:
                writer += "$";
                break;
        }

        if (this.length) `h[#${this.length.toFixed(7)}]`;

        for (let i = 0; i < this.slidePaths.length; i++) {
            if (i > 0) writer += "*";

            writer += this.slidePaths[i].write();
        }

        return writer;
    }
}
