import fs from "fs";
import { basename, dirname } from "path";

import { defineConfig } from "vitest/config";

const parentDir = basename(dirname(__dirname));
const currentDir = basename(__dirname);

let excludeFromCoverage = new Array<string>();
if (fs.existsSync("excludeFromCoverage.json")) {
  excludeFromCoverage = (
    JSON.parse(fs.readFileSync("excludeFromCoverage.json", "utf8")) as {
      exclude: Array<string>;
    }
  ).exclude;
}

let coverageThresholds;
if (fs.existsSync("coverageThresholds.json")) {
  coverageThresholds = JSON.parse(
    fs.readFileSync("coverageThresholds.json", "utf8")
  ) as { lines: number; branches: number; functions: number };
} else {
  coverageThresholds = {
    lines: 85,
    branches: 80,
    functions: 85,
  };
}

export default defineConfig({
  esbuild: {
    treeShaking: true,
    target: "es2023", // this is needed for the newest typescript features
  },
  build: {
    rollupOptions: {
      treeshake: true,
    },
  },
  cacheDir: `.vitest-cache/${parentDir}-${currentDir}`,
  test: {
    pool: "forks", // We use forks instead of threads to avoid a segmentation fault in the API's tests. Also because of this issue: https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker
    include: ["**/*.vitest.ts", "**/*.vitest.tsx"],
    testTimeout: 60000,
    coverage: {
      all: true,
      include: ["**/src/**", "**/app/**"],
      exclude: [
        "*.config.*",
        "**/__tests__/**",
        "**/*.jest.ts",
        "**/*.test.ts",
        "**/*.d.ts",
        "cdktf.out/**",
        "scripts/**",
        "src/main.ts",
        ".gen/**",
        "**/*.vitest.ts",
        "node_modules/**",
        "build/**",
        "dist/**",
      ].concat(excludeFromCoverage),
      reporter: ["text", "json", "html"],
      ...coverageThresholds,
    },
  },
  plugins: [
    {
      name: "replace-json-modules",
      transform(code): string {
        const replace = 'assert { type: "json" }';
        return code.replaceAll(replace, " ".repeat(replace.length));
      },
    },
  ],
});
