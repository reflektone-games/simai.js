import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist",
    minify: true,
    dts: true
});
