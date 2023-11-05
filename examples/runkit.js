const { SimaiFile, SimaiConvert } = require("simai.js");

const chartContent = `&inote_1=1/2/3/4/5/6/7/8`;

// Read it into your program
const simaiFile = new SimaiFile(chartContent);

// Specify a key to read, without the "&"
const chartKey = "inote_1";

// Get the corresponding value as a string
const rawChart = simaiFile.getValue(chartKey);

// Deserialize the chart
const chart = SimaiConvert.deserialize(rawChart);

console.log(chart);
