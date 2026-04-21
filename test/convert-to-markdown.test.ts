import { describe, it, expect } from "vitest";
import { convertToMarkdown, type MutantStatus } from "../src/convert-to-markdown.js";

function makeReport(
  files: Record<string, MutantStatus[]>,
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

interface MutantInput {
  status: MutantStatus;
  mutatorName: string;
  location?: { line: number; column: number };
}

function makeDetailedReport(files: Record<string, MutantInput[]>) {
  return {
    files: Object.fromEntries(
      Object.entries(files).map(([name, mutants]) => [
        name,
        {
          language: "typescript",
          mutants: mutants.map((m, i) => ({
            id: String(i),
            status: m.status,
            mutatorName: m.mutatorName,
            ...(m.location && {
              location: {
                start: { line: m.location.line, column: m.location.column },
                end: { line: m.location.line, column: m.location.column },
              },
            }),
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

  describe("mutant status counts", () => {
    it("includes counts for killed, survived, no coverage, and timed out mutants", () => {
      const report = makeReport({
        "src/foo.ts": ["Killed", "Killed", "Survived", "NoCoverage", "Timeout"],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).toContain("| Killed | 2 |");
      expect(markdown).toContain("| Survived | 1 |");
      expect(markdown).toContain("| No Coverage | 1 |");
      expect(markdown).toContain("| Timeout | 1 |");
    });

    it("aggregates counts across multiple files and shows zero for absent statuses", () => {
      const report = makeReport({
        "src/a.ts": ["Killed", "Killed"],
        "src/b.ts": ["Killed"],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).toContain("| Killed | 3 |");
      expect(markdown).toContain("| Survived | 0 |");
      expect(markdown).toContain("| No Coverage | 0 |");
      expect(markdown).toContain("| Timeout | 0 |");
    });
  });

  describe("survived mutants", () => {
    it("omits the section by default even when survived mutants exist", () => {
      const report = makeDetailedReport({
        "src/foo.ts": [
          { status: "Survived", mutatorName: "StringLiteral", location: { line: 3, column: 10 } },
        ],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).not.toContain("Survived Mutants");
    });

    it("wraps survived mutants in a collapsible details element when enabled", () => {
      const report = makeDetailedReport({
        "src/foo.ts": [
          { status: "Survived", mutatorName: "ConditionalExpression", location: { line: 10, column: 5 } },
        ],
      });

      const markdown = convertToMarkdown(report, { survivedMutants: true });

      expect(markdown).toContain("<details>");
      expect(markdown).toContain("<summary>Survived Mutants (1)</summary>");
      expect(markdown).toContain("</details>");
      expect(markdown).toContain("| src/foo.ts | 10:5 | ConditionalExpression |");
    });

    it("lists survived mutants with file, location, and mutator name when enabled", () => {
      const report = makeDetailedReport({
        "src/foo.ts": [
          { status: "Killed", mutatorName: "BlockStatement", location: { line: 5, column: 1 } },
          { status: "Survived", mutatorName: "ConditionalExpression", location: { line: 10, column: 5 } },
        ],
      });

      const markdown = convertToMarkdown(report, { survivedMutants: true });

      expect(markdown).toContain("| src/foo.ts | 10:5 | ConditionalExpression |");
      expect(markdown).not.toContain("BlockStatement");
    });

    it("lists survived mutants from multiple files when enabled", () => {
      const report = makeDetailedReport({
        "src/foo.ts": [
          { status: "Survived", mutatorName: "StringLiteral", location: { line: 3, column: 10 } },
        ],
        "src/bar.ts": [
          { status: "Survived", mutatorName: "ArithmeticOperator", location: { line: 7, column: 1 } },
        ],
      });

      const markdown = convertToMarkdown(report, { survivedMutants: true });

      expect(markdown).toContain("| src/foo.ts | 3:10 | StringLiteral |");
      expect(markdown).toContain("| src/bar.ts | 7:1 | ArithmeticOperator |");
    });

    it("shows a dash for location when mutant has no location data", () => {
      const report = makeDetailedReport({
        "src/foo.ts": [
          { status: "Survived", mutatorName: "StringLiteral" },
        ],
      });

      const markdown = convertToMarkdown(report, { survivedMutants: true });

      expect(markdown).toContain("<summary>Survived Mutants (1)</summary>");
      expect(markdown).toContain("| src/foo.ts | - | StringLiteral |");
    });

    it("omits the section when enabled but no mutants survived", () => {
      const report = makeReport({
        "src/foo.ts": ["Killed", "Killed"],
      });

      const markdown = convertToMarkdown(report, { survivedMutants: true });

      expect(markdown).not.toContain("Survived Mutants");
    });
  });

  describe("per-file mutation scores", () => {
    it("omits the table when the report has no files", () => {
      const report = makeReport({});

      const markdown = convertToMarkdown(report);

      expect(markdown).not.toContain("| File |");
    });

    it("shows 0.00% for a file with no mutants", () => {
      const report = makeReport({
        "src/empty.ts": [],
        "src/foo.ts": ["Killed"],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).toContain("| src/empty.ts | 0.00% |");
      expect(markdown).toContain("| src/foo.ts | 100.00% |");
    });

    it("includes a table with each file and its mutation score", () => {
      const report = makeReport({
        "src/foo.ts": ["Killed", "Killed", "Survived"],
        "src/bar.ts": ["Killed", "Survived", "Survived", "Survived"],
      });

      const markdown = convertToMarkdown(report);

      expect(markdown).toContain(
        "| File | Mutation Score |\n" +
        "| --- | --- |\n" +
        "| src/foo.ts | 66.67% |\n" +
        "| src/bar.ts | 25.00% |",
      );
    });
  });
});
