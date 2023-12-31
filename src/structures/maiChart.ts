import { TimingChange } from "../internal/syntacticAnalysis/timingChange";
import { NoteCollection } from "./noteCollection";

export class MaiChart {
    public finishTiming: number | undefined;
    public noteCollections: NoteCollection[] = [];
    public timingChanges: TimingChange[] = [];
}
