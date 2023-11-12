import { UnexpectedCharacterException } from "../../errors/unexpectedCharacterException";
import { ScopeMismatchException, ScopeType } from "../../errors/scopeMismatchException";
import { UnsupportedSyntaxException } from "../../errors/unsupportedSyntaxException";
import { InvalidSyntaxException } from "../../errors/invalidSyntaxEception";
import { NoteAppearance } from "../../../structures/noteAppearance";
import { NoteStyles } from "../../../structures/noteStyles";
import { TokenType } from "../../lexicalAnalysis/tokenType";
import { SlideMorph } from "../../../structures/slideMorph";
import { NoteGroup } from "../../../structures/noteGroup";
import { NoteType } from "../../../structures/noteType";
import { Token } from "../../lexicalAnalysis/token";
import { Note } from "../../../structures/note";
import { Deserializer } from "../deserializer";
import { TimingChange } from "../timingChange";
import { SlideReader } from "./slideReader";

/**
 * INTERNAL USAGE ONLY! DO NOT USE THIS PROPERTY DIRECTLY!
 */
export class NoteReader {
    public static process(parent: Deserializer, identityToken: Token): Note {
        const [canReadNoteLocation, noteLocation] = Deserializer.tryReadLocation(identityToken);

        if (!canReadNoteLocation) throw new InvalidSyntaxException(identityToken.line, identityToken.character);

        const currentNote = new Note(parent.currentNoteCollection!);
        currentNote.location = noteLocation;

        const overrideTiming = new TimingChange();
        overrideTiming.tempo = parent.timingChanges[parent.timingChanges.length - 1].tempo;

        if (noteLocation.group !== NoteGroup.Tap) currentNote.type = NoteType.Touch;

        // Some readers (e.g. NoteReader) moves the enumerator automatically.
        // We can skip moving the pointer if that's satisfied.
        let manuallyMoved = false;

        while (!parent.endOfFile && (manuallyMoved || parent.moveNext())) {
            const token = parent.enumerator.current;
            manuallyMoved = false;

            switch (token.type) {
                case TokenType.Tempo:
                case TokenType.Subdivision:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Global);

                case TokenType.Decorator: {
                    NoteReader.decorateNote(token, currentNote);
                    break;
                }

                case TokenType.Slide: {
                    if (currentNote.type === NoteType.Hold) currentNote.length = overrideTiming.secondsPerBeat;

                    const slide = SlideReader.process(parent, currentNote, token, overrideTiming);
                    manuallyMoved = true;

                    currentNote.slidePaths.push(slide);
                    break;
                }

                case TokenType.Duration: {
                    NoteReader.readDuration(parent.timingChanges[parent.timingChanges.length - 1], token, currentNote);
                    break;
                }

                case TokenType.SlideJoiner:
                    throw new ScopeMismatchException(token.line, token.character, ScopeType.Slide);

                case TokenType.TimeStep:
                case TokenType.EachDivider:
                case TokenType.EndOfFile:
                case TokenType.Location:
                    // note terminates here
                    return currentNote;

                case TokenType.None:
                    break;

                default:
                    throw new UnsupportedSyntaxException(token.line, token.character);
            }
        }

        return currentNote;
    }

    private static decorateNote(token: Token, note: Note) {
        switch (token.lexeme[0]) {
            case "f":
                note.styles |= NoteStyles.Fireworks;
                return;
            case "b":
                if (note.type === NoteType.ForceInvalidate) break;
                // always override note type
                note.type = NoteType.Break;
                return;
            case "x":
                note.styles |= NoteStyles.Ex;
                return;
            case "m":
                note.styles |= NoteStyles.Mine;
                return;
            case "h":
                if (note.type !== NoteType.Break && note.type !== NoteType.ForceInvalidate) note.type = NoteType.Hold;

                note.length ??= 0;
                return;
            case "?":
                note.type = NoteType.ForceInvalidate;
                note.slideMorph = SlideMorph.FadeIn;
                return;
            case "!":
                note.type = NoteType.ForceInvalidate;
                note.slideMorph = SlideMorph.SuddenIn;
                return;
            case "@":
                note.appearance = NoteAppearance.ForceNormal;
                return;
            case "$":
                note.appearance =
                    note.appearance === NoteAppearance.ForceStar
                        ? NoteAppearance.ForceStarSpinning
                        : NoteAppearance.ForceStar;
                return;
        }
    }

    private static readDuration(timing: TimingChange, token: Token, note: Note) {
        if (note.type !== NoteType.Break) note.type = NoteType.Hold;

        if (token.lexeme[0] === "#") {
            const explicitValue = parseFloat(token.lexeme.slice(1));

            if (isNaN(explicitValue))
                throw new UnexpectedCharacterException(token.line, token.character + 1, '0~9, or "."');

            note.length = explicitValue;
            return;
        }

        const indexOfSeparator = token.lexeme.indexOf(":");
        const nominator = parseFloat(token.lexeme.slice(0, indexOfSeparator));
        const denominator = parseFloat(token.lexeme.slice(indexOfSeparator + 1));

        if (isNaN(nominator) || isNaN(denominator))
            throw new UnexpectedCharacterException(token.line, token.character + 1, '0~9, or "."');

        note.length = (timing.secondsPerBar / (nominator / 4)) * denominator;
    }
}
