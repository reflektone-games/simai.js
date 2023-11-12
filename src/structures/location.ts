import { NoteGroup } from "./noteGroup";

export class Location {
    /**
     * Describes which button / sensor in the {@link group} this element is pointing to.
     */
    public index: number;

    public group: NoteGroup;

    constructor(index: number, noteGroup: NoteGroup) {
        this.index = index;
        this.group = noteGroup;
    }

    public equals(other: Location): boolean {
        return this.index === other.index && this.group === other.group;
    }

    public toString(): string {
        switch (this.group) {
            case NoteGroup.Tap:
                return (this.index + 1).toString();
            case NoteGroup.CSensor:
                return "C";
            default:
                let groupChar = "";

                switch (this.group) {
                    case NoteGroup.ASensor:
                        groupChar = "A";
                        break;
                    case NoteGroup.BSensor:
                        groupChar = "B";
                        break;
                    case NoteGroup.DSensor:
                        groupChar = "D";
                        break;
                    case NoteGroup.ESensor:
                        groupChar = "E";
                        break;
                    // default:
                    //  throw new ArgumentOutOfRangeException();
                }

                return groupChar + (this.index + 1).toString();
        }
    }
}
