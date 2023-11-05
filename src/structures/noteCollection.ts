import { EachStyle } from "./eachStyle";
import { Note } from "./note";

export class NoteCollection extends Array<Note> {
    public eachStyle: EachStyle = EachStyle.Default;
    public time: number;

    constructor(time: number) {
        super();
        this.time = time;
    }

    public addNote(note: Note) {
        note.parentCollection = this;
        this.push(note);
    }
}
