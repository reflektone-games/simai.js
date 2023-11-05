import { NoteGroup } from "./noteGroup";

export class Location {
    /**
     * Describes which button / sensor in the <see cref="group" /> this element is pointing to.
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
        return `index: ${this.index}, group: ${this.group.toString()}`;
    }
}
