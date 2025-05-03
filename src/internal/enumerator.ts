export class Enumerator<T> implements Iterable<T> {
    private _current: T | undefined;
    private _index: number = -1;
    private _done: boolean = false;

    constructor(private _source: Iterable<T>) {}

    public get current(): T | undefined {
        return this._current;
    }

    public get index(): number {
        return this._index;
    }

    public get done(): boolean {
        return this._done;
    }

    public moveNext(): boolean {
        const it = this._source[Symbol.iterator]();
        const { value, done } = it.next();
        this._current = value;
        this._done = !!done;
        this._index++;
        return !done;
    }

    public reset(): void {
        this._index = -1;
        this._done = false;
        this._current = undefined;
    }

    [Symbol.iterator](): Iterator<T> {
        return {
            next: () => {
                this.moveNext();
                return {
                    value: this.current!,
                    done: this.done
                };
            }
        };
    }
}
