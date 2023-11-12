import { NoteGroup } from "../src/structures/noteGroup";
import { Location } from "../src/structures/location";
import { SimaiConvert, SimaiFile } from "../src";
import fs from "node:fs/promises";
import assert from "node:assert";
import path from "node:path";

const testChartPath = path.join(__dirname, "./resources/chartTests/");

describe("SimaiConvert", () => {
    it("should be able to read empty chart", async () => {
        const chartText = await fs.readFile(path.join(testChartPath, "./CanReadEmptyChart.txt"), "utf-8");

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 0);
    });

    it("should be able to read a chart's note (singular location)", async () => {
        const chartText = await fs.readFile(path.join(testChartPath, "./CanReadSingularLocation.txt"), "utf-8");

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 1);
        assert.equal(chart.noteCollections[0].length, 1);
        assert(chart.noteCollections[0][0].location.equals(new Location(0, NoteGroup.Tap)));
    });

    it("should be able to read a chart's note locations and with seperators", async () => {
        const chartText = await fs.readFile(path.join(testChartPath, "./CanReadLocationsWithSeparators.txt"), "utf-8");

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 1);
        assert.equal(chart.noteCollections[0].length, 8);
        assert(chart.noteCollections[0][0].location.equals(new Location(0, NoteGroup.Tap)));
        assert(chart.noteCollections[0][1].location.equals(new Location(1, NoteGroup.Tap)));
        assert(chart.noteCollections[0][2].location.equals(new Location(2, NoteGroup.Tap)));
        assert(chart.noteCollections[0][3].location.equals(new Location(3, NoteGroup.Tap)));
        assert(chart.noteCollections[0][4].location.equals(new Location(4, NoteGroup.Tap)));
        assert(chart.noteCollections[0][5].location.equals(new Location(5, NoteGroup.Tap)));
        assert(chart.noteCollections[0][6].location.equals(new Location(6, NoteGroup.Tap)));
        assert(chart.noteCollections[0][7].location.equals(new Location(7, NoteGroup.Tap)));
    });

    it("should be able to read a chart's note locations and without seperators", async () => {
        const chartText = await fs.readFile(
            path.join(testChartPath, "./CanReadLocationsWithoutSeparators.txt"),
            "utf-8"
        );

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 1);
        assert.equal(chart.noteCollections[0].length, 8);
        assert(chart.noteCollections[0][0].location.equals(new Location(0, NoteGroup.Tap)));
        assert(chart.noteCollections[0][1].location.equals(new Location(1, NoteGroup.Tap)));
        assert(chart.noteCollections[0][2].location.equals(new Location(2, NoteGroup.Tap)));
        assert(chart.noteCollections[0][3].location.equals(new Location(3, NoteGroup.Tap)));
        assert(chart.noteCollections[0][4].location.equals(new Location(4, NoteGroup.Tap)));
        assert(chart.noteCollections[0][5].location.equals(new Location(5, NoteGroup.Tap)));
        assert(chart.noteCollections[0][6].location.equals(new Location(6, NoteGroup.Tap)));
        assert(chart.noteCollections[0][7].location.equals(new Location(7, NoteGroup.Tap)));
    });

    it("should be able to read a chart's tempo with default subdivision", async () => {
        const chartText = await fs.readFile(
            path.join(testChartPath, "./CanReadTempoWithDefaultSubdivisions.txt"),
            "utf-8"
        );

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 2);
        assert.equal(chart.noteCollections[1].time, 1);
    });

    it("should be able to read a chart's tempo changes with default subdivision", async () => {
        const chartText = await fs.readFile(
            path.join(testChartPath, "./CanReadTempoChangesWithDefaultSubdivisions.txt"),
            "utf-8"
        );

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_1"));

        assert.equal(chart.noteCollections.length, 3);
        assert.equal(chart.noteCollections[1].time, 1);
        assert.equal(chart.noteCollections[2].time, 1.5);
    });

    it("should be able to serialize", async () => {
        const chartText = await fs.readFile(path.join(testChartPath, "../fileTests/0.txt"), "utf-8");

        const simaiFile = new SimaiFile(chartText);
        const chart = SimaiConvert.deserialize(simaiFile.getValue("inote_3"));

        const serialized = SimaiConvert.serialize(chart);
        console.log(serialized);
        assert.notEqual(serialized, "");
    });
});
