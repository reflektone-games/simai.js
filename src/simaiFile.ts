export class SimaiFile {
    public data: string = "";

    constructor(data: string) {
        this.data = data;
    }

    public toKeyValuePairs(): ReadonlyMap<string, string> {
        let currentKey: string = "";
        let currentValue: string = "";

        let lines: string[] = this.data.replace(/\r\n/g, "\n").split("\n");
        let result: Map<string, string> = new Map<string, string>();

        for (let line of lines) {
            if (line.startsWith("&")) {
                if (currentKey !== "") {
                    result.set(currentKey, currentValue.trimEnd());
                    currentValue = "";
                }

                let keyValuePair: string[] = line.split("=", 2);
                currentKey = keyValuePair[0].substring(1);
                currentValue += keyValuePair[1] + "\n";
            } else {
                currentValue += line + "\n";
            }
        }

        // Incase there is no trailing newline
        if (currentKey) result.set(currentKey, currentValue.trimEnd());

        return result;
    }

    public getValue(key: string): string | undefined {
        return this.toKeyValuePairs().get(key);
    }
}
