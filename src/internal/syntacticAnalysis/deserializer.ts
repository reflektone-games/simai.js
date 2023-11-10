import { ScopeMismatchException, ScopeType } from "../errors/scopeMismatchException";
import { UnsupportedSyntaxException } from "../errors/unsupportedSyntaxException";
import { NoteCollection } from "../../structures/noteCollection";
import { SubdivisionReader } from "./states/subdivisionReader";
import { TokenType } from "../lexicalAnalysis/tokenType";
import { NoteGroup } from "../../structures/noteGroup";
import { SlideType } from "../../structures/slideType";
import { EachStyle } from "../../structures/eachStyle";
import { Location } from "../../structures/location";
import { MaiChart } from "../../structures/maiChart";
import { TempoReader } from "./states/tempoReader";
import { Token } from "../lexicalAnalysis/token";
import { NoteReader } from "./states/noteReader";
import { TimingChange } from "./timingChange";
import { Enumerator } from "../enumerator";

export class Deserializer {
    private readonly _chart: MaiChart = new MaiChart();
    /**
     * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
     */
    public readonly enumerator: Enumerator<Token>;

    private _maxFinishTime: number = 0;
    private _currentTime: number = 0;
    /**
     * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
     */
    public currentNoteCollection: NoteCollection | undefined;
    /**
     * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
     */
    public currentTiming: TimingChange = new TimingChange(0, 0);
    /**
     * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
     */
    public endOfFile: boolean = false;

    constructor(sequence: Iterable<Token>) {
        this.enumerator = new Enumerator<Token>(sequence);
    }

    public getChart(): MaiChart {
        const noteCollections: NoteCollection[] = [];

        // Some readers (e.g. NoteReader) moves the enumerator automatically.
        // We can skip moving the pointer if that's satisfied.
        let manuallyMoved = false;

        while (!this.endOfFile && (manuallyMoved || this.moveNext())) {
            const token = this.enumerator.current;
            manuallyMoved = false;

            switch (token.type) {
                case TokenType.Tempo: {
                    TempoReader.process(this, token);
                    break;
                }
                case TokenType.Subdivision: {
                    SubdivisionReader.process(this, token);
                    break;
                }
                case TokenType.Location: {
                    this.currentNoteCollection ??= new NoteCollection(this._currentTime);

                    if (token.lexeme[0] === "0") {
                        if (this.currentNoteCollection.eachStyle !== EachStyle.ForceBroken)
                            this.currentNoteCollection.eachStyle = EachStyle.ForceEach;
                        break;
                    }

                    const note = NoteReader.process(this, token);
                    this.currentNoteCollection.addNote(note);
                    manuallyMoved = true;

                    this._maxFinishTime = Math.max(
                        this._maxFinishTime,
                        this.currentNoteCollection.time + note.getVisibleDuration()
                    );
                    break;
                }
                case TokenType.TimeStep:
                    {
                        if (this.currentNoteCollection != null) {
                            noteCollections.push(this.currentNoteCollection);
                            this.currentNoteCollection = undefined;
                        }

                        this._currentTime += this.currentTiming.secondsPerBeat;
                    }
                    break;
                case TokenType.EachDivider:
                    {
                        switch (token.lexeme[0]) {
                            case "/":
                                break;

                            case "`":
                                if (this.currentNoteCollection != null)
                                    this.currentNoteCollection.eachStyle = EachStyle.ForceBroken;
                                break;
                        }
                    }
                    break;
                case TokenType.Decorator:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Note);
                case TokenType.Slide:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Note);
                case TokenType.Duration:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Note | ScopeType.Slide);
                case TokenType.SlideJoiner:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Slide);
                case TokenType.EndOfFile:
                    this._chart.finishTiming = this._currentTime;
                    break;
                case TokenType.None:
                    break;
                default:
                    throw new UnsupportedSyntaxException(token.line, token.character);
            }
        }

        this._chart.finishTiming ??= this._maxFinishTime;

        if (this.currentNoteCollection !== undefined) {
            noteCollections.push(this.currentNoteCollection!);
            this.currentNoteCollection = undefined;
        }

        this._chart.noteCollections = noteCollections;

        return this._chart;
    }

    /**
     *
     * @param startLocation The starting location.
     * @param endLocation The ending location.
     * @param direction 1: Right; -1: Left; Default: Shortest route.
     * @returns The recommended ring type
     */
    public static determineRingType(startLocation: Location, endLocation: Location, direction: number = 0): SlideType {
        switch (direction) {
            case 1:
                return (startLocation.index + 2) % 8 >= 4 ? SlideType.RingCcw : SlideType.RingCw;
            case -1:
                return (startLocation.index + 2) % 8 >= 4 ? SlideType.RingCw : SlideType.RingCcw;
            default:
                var difference = endLocation.index - startLocation.index;

                var rotation = difference >= 0 ? (difference > 4 ? -1 : 1) : difference < -4 ? 1 : -1;

                return rotation > 0 ? SlideType.RingCw : SlideType.RingCcw;
        }
    }

    /**
     * @returns [result, location]
     */
    public static tryReadLocation(token: Token): [boolean, Location] {
        const isSensor =
            token.lexeme[0].charCodeAt(0) >= "A".charCodeAt(0) && token.lexeme[0].charCodeAt(0) <= "E".charCodeAt(0);
        const indexRange = isSensor ? token.lexeme.substring(1) : token.lexeme.substring(0);

        let group = NoteGroup.Tap;

        if (isSensor) {
            group = (token.lexeme[0].charCodeAt(0) - "A".charCodeAt(0) + 1) as NoteGroup;

            if (group === NoteGroup.CSensor) {
                return [true, new Location(0, group)];
            }
        }

        const indexInGroup = parseInt(indexRange);

        if (!indexInGroup) return [false, new Location(0, 0)];

        return [true, new Location(indexInGroup - 1, group)];
    }

    public moveNext(): boolean {
        this.endOfFile = !this.enumerator.moveNext();
        return !this.endOfFile;
    }
}
