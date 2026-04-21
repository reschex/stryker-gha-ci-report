#!/usr/bin/env node
import { readFileSync } from "fs";
import { convertToMarkdown } from "./convert-to-markdown.js";

const args = process.argv.slice(2);
const survivedMutants = args.includes("--survived-mutants");
const filePath = args.find((a) => !a.startsWith("--"));

if (!filePath) {
  console.error("Usage: stryker-gha-ci-report [--survived-mutants] <path-to-mutation.json>");
  process.exit(1);
}

const report = JSON.parse(readFileSync(filePath, "utf-8"));
console.log(convertToMarkdown(report, { survivedMutants }));
