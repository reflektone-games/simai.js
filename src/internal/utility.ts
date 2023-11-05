export type FileEncoding = "utf7" | "utf8" | "utf16le" | "utf16be" | "utf32le" | "utf32be" | "unicode" | "unicodebe";

export default new (class Utility {
    static removeLineEndings(str: string): string {
        return str.replace(/(\r\n|\n|\r)/gm, "");
    }

    static tryGetEncoding(textBytes: Uint8Array, taster: number): FileEncoding {
        if (textBytes.byteLength >= 4) {
            if (textBytes[0] == 0x00 && textBytes[1] == 0x00 && textBytes[2] == 0xfe && textBytes[3] == 0xff) {
                return "utf32be"; // UTF-32, big-endian
            } else if (textBytes[0] == 0xff && textBytes[1] == 0xfe && textBytes[2] == 0x00 && textBytes[3] == 0x00) {
                return "utf32le"; // UTF-32, little-endian
            }
        } else if (textBytes.byteLength >= 2) {
            if (textBytes[0] == 0xfe && textBytes[1] == 0xff) {
                return "utf16be"; // UTF-16, big-endian
            } else if (textBytes[0] == 0xff && textBytes[1] == 0xfe) {
                return "utf16le"; // UTF-16, little-endian
            }
        } else if (textBytes.byteLength >= 3) {
            if (textBytes[0] == 0xef && textBytes[1] == 0xbb && textBytes[2] == 0xbf) {
                return "utf8"; // UTF-8
            } else if (textBytes[0] == 0x2b && textBytes[1] == 0x2f && textBytes[2] == 0x76) {
                return "utf7"; // UTF-7
            }
        }

        if (taster == 0 || taster > textBytes.byteLength) taster = textBytes.byteLength; // Taster size can't be bigger than the filesize obviously.

        let i = 0;
        let utf8 = false;

        while (i < taster - 4) {
            if (textBytes[i] <= 0x7f) {
                i += 1;
                continue;
            } else if (
                textBytes[i] >= 0xc2 &&
                textBytes[i] < 0xe0 &&
                textBytes[i + 1] >= 0x80 &&
                textBytes[i + 1] < 0xc0
            ) {
                i += 2;
                utf8 = true;
                continue;
            }

            if (
                textBytes[i] >= 0xe0 &&
                textBytes[i] < 0xf0 &&
                textBytes[i + 1] >= 0x80 &&
                textBytes[i + 1] < 0xc0 &&
                textBytes[i + 2] >= 0x80 &&
                textBytes[i + 2] < 0xc0
            ) {
                i += 3;
                utf8 = true;
                continue;
            }

            if (
                textBytes[i] >= 0xf0 &&
                textBytes[i] < 0xf5 &&
                textBytes[i + 1] >= 0x80 &&
                textBytes[i + 1] < 0xc0 &&
                textBytes[i + 2] >= 0x80 &&
                textBytes[i + 2] < 0xc0 &&
                textBytes[i + 3] >= 0x80 &&
                textBytes[i + 3] < 0xc0
            ) {
                i += 4;
                utf8 = true;
                continue;
            }

            utf8 = false;
            break;
        }

        if (utf8) return "utf8";

        const threshold = 0.1; // proportion of chars step 2 which must be zeroed to be diagnosed as utf-16. 0.1 = 10%

        var count = 0;
        for (var n = 0; n < taster; n += 2) if (textBytes[n] == 0) count++;
        if (count / taster > threshold) return "unicodebe"; // (big-endian)

        count = 0;
        for (var n = 1; n < taster; n += 2) if (textBytes[n] == 0) count++;
        if (count / taster > threshold) return "unicode"; // (little-endian)

        for (var n = 0; n < taster - 9; n++) {
            if (
                ((String.fromCharCode(textBytes[n + 0]) != "c" && String.fromCharCode(textBytes[n + 0]) != "C") ||
                    (String.fromCharCode(textBytes[n + 1]) != "h" && String.fromCharCode(textBytes[n + 1]) != "H") ||
                    (String.fromCharCode(textBytes[n + 2]) != "a" && String.fromCharCode(textBytes[n + 2]) != "A") ||
                    (String.fromCharCode(textBytes[n + 3]) != "r" && String.fromCharCode(textBytes[n + 3]) != "R") ||
                    (String.fromCharCode(textBytes[n + 4]) != "s" && String.fromCharCode(textBytes[n + 4]) != "S") ||
                    (String.fromCharCode(textBytes[n + 5]) != "e" && String.fromCharCode(textBytes[n + 5]) != "E") ||
                    (String.fromCharCode(textBytes[n + 6]) != "t" && String.fromCharCode(textBytes[n + 6]) != "T") ||
                    String.fromCharCode(textBytes[n + 7]) != "=") &&
                ((String.fromCharCode(textBytes[n + 0]) != "e" && String.fromCharCode(textBytes[n + 0]) != "E") ||
                    (String.fromCharCode(textBytes[n + 1]) != "n" && String.fromCharCode(textBytes[n + 1]) != "N") ||
                    (String.fromCharCode(textBytes[n + 2]) != "c" && String.fromCharCode(textBytes[n + 2]) != "C") ||
                    (String.fromCharCode(textBytes[n + 3]) != "o" && String.fromCharCode(textBytes[n + 3]) != "O") ||
                    (String.fromCharCode(textBytes[n + 4]) != "d" && String.fromCharCode(textBytes[n + 4]) != "D") ||
                    (String.fromCharCode(textBytes[n + 5]) != "i" && String.fromCharCode(textBytes[n + 5]) != "I") ||
                    (String.fromCharCode(textBytes[n + 6]) != "n" && String.fromCharCode(textBytes[n + 6]) != "N") ||
                    (String.fromCharCode(textBytes[n + 7]) != "g" && String.fromCharCode(textBytes[n + 7]) != "G") ||
                    String.fromCharCode(textBytes[n + 8]) != "=")
            )
                continue;

            if (String.fromCharCode(textBytes[n + 0]) == "c" || String.fromCharCode(textBytes[n + 0]) == "C") n += 8;
            else n += 9;
            if (String.fromCharCode(textBytes[n]) == '"' || String.fromCharCode(textBytes[n]) == "'") n++;

            // while (
            //     n < taster &&
            //     (String.fromCharCode(textBytes[n]) == "_" ||
            //         String.fromCharCode(textBytes[n]) == "-" ||
            //         (textBytes[n] >= "0".charCodeAt(0) && textBytes[n] <= "9".charCodeAt(0)) ||
            //         (textBytes[n] >= "a".charCodeAt(0) && textBytes[n] <= "z".charCodeAt(0)) ||
            //         (textBytes[n] >= "A".charCodeAt(0) && textBytes[n] <= "Z".charCodeAt(0)))
            // )
            //     n++;

            //   var nb = new byte[n - oldN]();
            //   Array.Copy(textBytes, oldN, nb, 0, n - oldN);
            //   try {
            //     var internalEnc = Encoding.ASCII.GetString(nb);
            //     return Encoding.GetEncoding(internalEnc);
            //   } catch {
            //     // If C# doesn't recognize the name of the encoding, break.
            //     break;
            //   }
        }

        return "utf8";
    }
})();
