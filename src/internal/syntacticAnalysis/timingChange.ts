export class TimingChange {
    public time: number = 0;
    public tempo: number;
    public subdivisions: number;

    get secondsPerBar(): number {
        // could use || here since number is falsy if 0
        return this.tempo === 0 ? 0 : 60 / this.tempo;
    }

    get secondsPerBeat(): number {
        // could use || here since number is falsy if 0
        return this.secondsPerBar / ((this.subdivisions === 0 ? 4 : this.subdivisions) / 4);
    }

    constructor(tempo: number, subdivisions: number = 4) {
        this.tempo = tempo;
        this.subdivisions = subdivisions;
    }

    explicitOverride(value: number) {
        this.tempo = 60 / value;
        this.subdivisions = 4;
    }
}
