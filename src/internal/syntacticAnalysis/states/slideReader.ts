import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { ScopeMismatchException, ScopeType } from "../../errors/scopeMismatchException";
import { UnsupportedSyntaxException } from "../../errors/unsupportedSyntaxException";
import { SlideSegment } from "../../../structures/slideSegment";
import { TokenType } from "../../lexicalAnalysis/tokenType";
import { SlidePath } from "../../../structures/slidePath";
import { SlideType } from "../../../structures/slideType";
import { Location } from "../../../structures/location";
import { NoteType } from "../../../structures/noteType";
import { Token } from "../../lexicalAnalysis/token";
import { Note } from "../../../structures/note";
import { Deserializer } from "../deserializer";
import { TimingChange } from "../timingChange";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class SlideReader {
    public static process(
        parent: Deserializer,
        currentNote: Note,
        identityToken: Token,
        defaultTimingChange: TimingChange
    ): SlidePath {
        const path = new SlidePath([]);
        path.delay = defaultTimingChange.secondsPerBeat;

        SlideReader.readSegment(parent, identityToken, currentNote.location, path);

        // Some readers (e.g. NoteReader) moves the enumerator automatically.
        // We can skip moving the pointer if that's satisfied.
        let manuallyMoved = true;

        while (!parent.endOfFile && (manuallyMoved || parent.moveNext())) {
            var token = parent.enumerator.current;
            manuallyMoved = false;

            switch (token.type) {
                case TokenType.Tempo:
                case TokenType.Subdivision:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Global);

                case TokenType.Decorator: {
                    SlideReader.decorateSlide(token, path);
                    break;
                }

                case TokenType.Slide: {
                    const segments = path.segments[path.segments.length - 1];
                    SlideReader.readSegment(parent, token, segments.vertices[segments.vertices.length - 1], path);
                    manuallyMoved = true;
                    break;
                }

                case TokenType.Duration: {
                    SlideReader.readDuration(parent.timingChanges[parent.timingChanges.length - 1], token, path);
                    break;
                }

                case TokenType.SlideJoiner: {
                    parent.moveNext();
                    return path;
                }

                case TokenType.TimeStep:
                case TokenType.EachDivider:
                case TokenType.EndOfFile:
                case TokenType.Location:
                    // slide terminates here
                    return path;

                case TokenType.None:
                    break;

                default:
                    throw new UnsupportedSyntaxException(token.line, token.character);
            }
        }

        return path;
    }

    private static readSegment(
        parent: Deserializer,
        identityToken: Token,
        startingLocation: Location,
        path: SlidePath
    ) {
        const segment = new SlideSegment([]);
        const length = identityToken.lexeme.length;
        SlideReader.assignVertices(parent, identityToken, segment);
        segment.slideType = SlideReader.identifySlideType(identityToken, startingLocation, segment, length);

        path.segments.push(segment);
    }

    private static decorateSlide(token: Token, path: SlidePath) {
        switch (token.lexeme[0]) {
            case "b":
                path.type = NoteType.Break;
                return;
            default:
                throw new UnsupportedSyntaxException(token.line, token.character);
        }
    }

    private static identifySlideType(
        identityToken: Token,
        startingLocation: Location,
        segment: SlideSegment,
        length: number
    ): SlideType {
        switch (identityToken.lexeme[0]) {
            case "-":
                return SlideType.StraightLine;
            case ">":
                return Deserializer.determineRingType(startingLocation, segment.vertices[0], 1);
            case "<":
                return Deserializer.determineRingType(startingLocation, segment.vertices[0], -1);
            case "^":
                return Deserializer.determineRingType(startingLocation, segment.vertices[0]);
            case "q":
                if (length === 2 && identityToken.lexeme[1] === "q") return SlideType.EdgeCurveCw;
                return SlideType.CurveCw;
            case "p":
                if (length === 2 && identityToken.lexeme[1] === "p") return SlideType.EdgeCurveCcw;
                return SlideType.CurveCcw;
            case "v":
                return SlideType.Fold;
            case "V":
                return SlideType.EdgeFold;
            case "s":
                return SlideType.ZigZagS;
            case "z":
                return SlideType.ZigZagZ;
            case "w":
                return SlideType.Fan;
            default:
                throw new UnsupportedSyntaxException(identityToken.line, identityToken.character);
        }
    }

    private static assignVertices(parent: Deserializer, identityToken: Token, segment: SlideSegment) {
        do {
            if (!parent.moveNext()) throw new UnsupportedSyntaxException(identityToken.line, identityToken.character);

            const current = parent.enumerator.current;

            const [isLocationToken, location] = Deserializer.tryReadLocation(current);
            if (isLocationToken) segment.vertices.push(location);
        } while (parent.enumerator.current.type === TokenType.Location);
    }

    private static readDuration(timing: TimingChange, token: Token, path: SlidePath) {
        const startOfDurationDeclaration = 0;
        const overrideTiming = timing;

        // (Optional) Intro delay duration:
        // By tempo: T#d (T: tempo, d: slide duration)
        // By explicit statement: D##d (D: seconds, d: slide duration)
        const firstHashIndex = token.lexeme.indexOf("#");
        const statesIntroDelayDuration = firstHashIndex > -1;
        if (statesIntroDelayDuration) {
            const startOfDurationDeclaration = token.lexeme.lastIndexOf("#") + 1;
            const lastHashIndex = startOfDurationDeclaration - 1;

            const delayDeclaration = token.lexeme.substring(0, firstHashIndex);
            const isExplicitStatement = firstHashIndex !== lastHashIndex;

            const delayValue = parseFloat(delayDeclaration);
            if (isNaN(delayValue)) throw new UnexpectedCharacterException(token.line, token.character, '0~9, or "."');

            if (isExplicitStatement) path.delay = delayValue;
            else {
                overrideTiming.tempo = delayValue;
                path.delay = overrideTiming.secondsPerBar;
            }
        }

        const durationDeclaration = token.lexeme.substring(startOfDurationDeclaration);
        const indexOfSeparator = durationDeclaration.indexOf(":");

        // Slide duration:
        // By beat: X:Y (subdivisions)
        // By explicit statement: D (seconds)
        if (indexOfSeparator === -1) {
            const explicitValue = parseFloat(durationDeclaration);
            if (isNaN(explicitValue))
                throw new UnexpectedCharacterException(
                    token.line,
                    token.character + startOfDurationDeclaration,
                    '0~9, or "."'
                );

            path.duration += explicitValue;
            return;
        }

        const nominator = parseFloat(durationDeclaration.substring(0, indexOfSeparator));
        if (isNaN(nominator))
            throw new UnexpectedCharacterException(
                token.line,
                token.character + startOfDurationDeclaration,
                '0~9, or "."'
            );

        const denominator = parseFloat(durationDeclaration.substring(indexOfSeparator + 1));
        if (isNaN(denominator))
            throw new UnsupportedSyntaxException(
                token.line,
                token.character + startOfDurationDeclaration + indexOfSeparator + 1,
                '0~9, or "."'
            );

        path.duration += (overrideTiming.secondsPerBar / (nominator / 4)) * denominator;
    }
}
