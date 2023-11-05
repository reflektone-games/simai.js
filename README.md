![simai.js Banner](./assets/banner.jpg)

<!-- markdownlint-disable -->
<div align="center">
    <p>
        <a href="https://www.npmjs.com/package/simai.js" target="_blank"><img src="https://img.shields.io/npm/v/simai.js.svg" alt="npm version"/></a>
        <a href="https://discord.gg/6fpETgpvjZ" target="_blank"><img src="https://img.shields.io/discord/892807792996536453.svg" alt="discord"/></a>
        <a href="https://github.com/reflektone-games/simai.js/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/reflektone-games/simai.js.svg" alt="license"/></a>
    </p>
</div>
<!-- markdownlint-enable -->

# simai.js

simai.js is an interpreter and serializer for [simai](https://w.atwiki.jp/simai/),
a custom chart format for the arcade rhythm game [maimai](https://maimai.sega.jp/),
written in [Typescript](https://www.typescriptlang.org/).

# Getting Started

To use simai.js in your own project, install it via [npm](https://www.npmjs.com/package/simai.js)

```bash
pnpm add simai.js
yarn install simai.js
npm install simai.js
```

Then, use the following method to deserialize a chart:

```typescript
import { SimaiFile, SimaiConvert } from "simai.js";

// or CommonJS version
// const { SimaiFile, SimaiConvert } = require("simai.js");

// Read it into your program
const simaiFile = new SimaiFile(chartContent);

// Specify a key to read, without the "&"
const chartKey = "inote_5";

// Get the corresponding value as a string
const rawChart = simaiFile.getValue(chartKey);

// Deserialize the chart
const chart = SimaiConvert.deserialize(rawChart);
```

# Contribute

Issues and pull requests are welcome!
