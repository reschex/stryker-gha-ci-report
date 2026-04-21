import { readFileSync } from "fs";
import { convertToMarkdown } from "./convert-to-markdown.js";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: stryker-gha-ci-report <path-to-mutation.json>");
  process.exit(1);
}

const report = JSON.parse(readFileSync(filePath, "utf-8"));
console.log(convertToMarkdown(report));
