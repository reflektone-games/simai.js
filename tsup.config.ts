import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist-web",
    minify: true,
    dts: true,
    sourcemap: true
});
