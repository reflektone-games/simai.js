<!-- TODO: Rework README -->

![simaisharp.js Banner](./assets/banner.jpg)

# simaisharp.js

simaisharp.js is an interpreter and serializer for [simai](https://w.atwiki.jp/simai/), 
a custom chart format for the arcade rhythm game [maimai](https://maimai.sega.jp/),
written in [Typescript](https://www.typescriptlang.org/).

# Getting Started

To use simaisharp.js in your own project, 

Then, use the following method to deserialize a chart:

<!--
```typescript
// Specify the chart file
var filePath = "Z:\path\to\your\chart.txt";

// Read it into your program
var simaiFile = new SimaiFile(filePath);

// Specify a key to read, without the "&"
var chartKey = "inote_5";

// Get the corresponding value as a string
var rawChart = simaiFile.getValue(chartKey);

// Deserialize the chart
var chart = SimaiConvert.deserialize(rawChart);
```
-->

# Contribute

Issues and pull requests are welcome!