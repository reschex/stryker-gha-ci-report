import { describe, it, expect } from "vitest";
import { convertToMarkdown } from "../src/convert-to-markdown.js";

function makeReport(
  files: Record<string, string[]>,
) {
  return {
    files: Object.fromEntries(
      Object.entries(files).map(([name, statuses]) => [
        name,
        {
          language: "typescript",
          mutants: statuses.map((status, i) => ({
            id: String(i),
            status,
            mutatorName: "TestMutator",
          })),
        },
      ]),
    ),
    schemaVersion: "1",
    thresholds: { high: 80, low: 60, break: 0 },
  };
}

describe("convertToMarkdown", () => {
  describe("summary header with overall mutation score", () => {
    it("includes a heading with the mutation score percentage", () => {
      const report = makeReport({
        "src/foo.ts": ["Killed", "Killed", "Survived", "Timeout"],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).toContain("# Mutation Testing Report");
      expect(markdown).toContain("75.00%");
    });

    it("computes 100% when all mutants are killed", () => {
      const markdown = convertToMarkdown(
        makeReport({ "src/bar.ts": ["Killed", "Killed"] }),
      );

      expect(markdown).toContain("100.00%");
    });

    it("computes 0% when no mutants are killed", () => {
      const markdown = convertToMarkdown(
        makeReport({ "src/baz.ts": ["Survived", "NoCoverage"] }),
      );

      expect(markdown).toContain("0.00%");
    });

    it("computes score across multiple files", () => {
      const markdown = convertToMarkdown(
        makeReport({
          "src/a.ts": ["Killed"],
          "src/b.ts": ["Survived"],
        }),
      );

      expect(markdown).toContain("50.00%");
    });

    it("computes 0% when there are no mutants at all", () => {
      const markdown = convertToMarkdown(
        makeReport({ "src/empty.ts": [] }),
      );

      expect(markdown).toContain("0.00%");
    });
  });
});
