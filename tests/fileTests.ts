import { SimaiFile } from "../src";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

// simai.js doesn't support reading charts from file due to compaltibility with the web, so we have to use node:fs to read the file.

const testChartPath = path.join(__dirname, "./resources/fileTests/");

describe("SimaiFile", () => {
    const _simaiFile = new SimaiFile(fs.readFileSync(path.join(testChartPath, "./0.txt"), "utf-8"));

    it("should be able to convert to key value pair", () => {
        const kvp = _simaiFile.toKeyValuePairs();
        assert.equal(kvp.get("title"), "SimaiFileRead test case");
        assert.equal(kvp.get("artist"), "非英語文本");
        assert.equal(kvp.get("first"), "0");
        assert.equal(kvp.get("lv_1"), "12+");
        assert.equal(kvp.get("inote_1"), "(170){4}A1/2,3h[4:1],E");
    });

    it("should be able to read indiviual key value pair", () => {
        const kvp = _simaiFile.getValue("inote_2");
        assert.equal(kvp, "(170){1},{8}6h[8:1]/2,7,,3h[8:1]/7,2,,6h[8:1]/2,5,,E");
    });

    it("should be able to read multiline chart", () => {
        // kvp here somehow have \r\n?
        const kvp = _simaiFile.getValue("inote_3")!;
        assert.equal(
            kvp.replace(/\r\n/g, "\n"),
            `(170){16}7/2-6[8:1],,1-5[8:1],8,2,,1,,
{8}2,18,7,16,2/7h[4:1],1,
3,{16}3,4,{8}2h[8:1]/5h[8:1],,18,,
{16}2/7-3[8:1],,8-4[8:1],1,7,,8,,
{8}7,81,2,83,7/2h[4:1],8,
6,{16}6,5,{8}7h[8:1]/4h[8:1],,7h[16:3]/1,,`.replace(/\r\n/g, "\n")
        );
    });
});
