export type MutantStatus =
  | "Killed"
  | "Survived"
  | "Timeout"
  | "NoCoverage"
  | "RuntimeError"
  | "CompileError"
  | "Ignored";

export interface MutantLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface Mutant {
  id: string;
  status: MutantStatus;
  mutatorName: string;
  location?: MutantLocation;
}

export interface FileResult {
  language: string;
  mutants: Mutant[];
}

export interface StrykerReport {
  files: Record<string, FileResult>;
  schemaVersion: string;
  thresholds: { high: number; low: number; break: number };
}

function mutationScore(mutants: Mutant[]): number {
  const testable = mutants.filter(
    (m) =>
      m.status !== "CompileError" &&
      m.status !== "RuntimeError" &&
      m.status !== "Ignored",
  );
  if (testable.length === 0) return 0;
  const detected = testable.filter(
    (m) => m.status === "Killed" || m.status === "Timeout",
  ).length;
  return (detected / testable.length) * 100;
}

function thresholdIndicator(
  score: number,
  thresholds: StrykerReport["thresholds"],
): string {
  if (score >= thresholds.high) return "passing";
  if (score < thresholds.low) return "failing";
  return "warning";
}

function summaryHeader(
  mutants: Mutant[],
  thresholds: StrykerReport["thresholds"],
): string {
  const score = mutationScore(mutants);
  const indicator = thresholdIndicator(score, thresholds);
  return `# Mutation Testing Report\n\n**Mutation Score: ${score.toFixed(2)}% — ${indicator}**`;
}

function statusCountsTable(mutants: Mutant[]): string {
  const killed = mutants.filter((m) => m.status === "Killed").length;
  const survived = mutants.filter((m) => m.status === "Survived").length;
  const noCoverage = mutants.filter((m) => m.status === "NoCoverage").length;
  const timeout = mutants.filter((m) => m.status === "Timeout").length;

  return [
    "| Status | Count |",
    "| --- | --- |",
    `| Killed | ${killed} |`,
    `| Survived | ${survived} |`,
    `| No Coverage | ${noCoverage} |`,
    `| Timeout | ${timeout} |`,
  ].join("\n");
}

function fileScoresTable(fileEntries: [string, FileResult][]): string {
  if (fileEntries.length === 0) return "";

  const rows = fileEntries.map(
    ([name, file]) => `| ${name} | ${mutationScore(file.mutants).toFixed(2)}% |`,
  );

  return ["| File | Mutation Score |", "| --- | --- |", ...rows].join("\n");
}

function survivedMutantsSection(
  fileEntries: [string, FileResult][],
): string {
  const rows: string[] = [];
  for (const [name, file] of fileEntries) {
    for (const mutant of file.mutants) {
      if (mutant.status === "Survived") {
        const loc = mutant.location
          ? `${mutant.location.start.line}:${mutant.location.start.column}`
          : "-";
        rows.push(`| ${name} | ${loc} | ${mutant.mutatorName} |`);
      }
    }
  }
  if (rows.length === 0) return "";

  const table = [
    "| File | Location | Mutator |",
    "| --- | --- | --- |",
    ...rows,
  ].join("\n");

  return [
    "<details>",
    `<summary>Survived Mutants (${rows.length})</summary>`,
    "",
    table,
    "",
    "</details>",
  ].join("\n");
}

function recommendationsSection(fileEntries: [string, FileResult][]): string {
  const filesWithSurvived = fileEntries
    .map(([name, file]) => {
      const survived = file.mutants.filter((m) => m.status === "Survived").length;
      return { name, survived, score: mutationScore(file.mutants) };
    })
    .filter((f) => f.survived > 0)
    .sort((a, b) => b.survived - a.survived)
    .slice(0, 5);

  if (filesWithSurvived.length === 0) return "";

  const rows = filesWithSurvived.map(
    (f) => `| ${f.name} | ${f.survived} | ${f.score.toFixed(2)}% |`,
  );

  return [
    "## Recommendations",
    "",
    "| File | Survived | Mutation Score |",
    "| --- | --- | --- |",
    ...rows,
  ].join("\n");
}

export interface ConvertOptions {
  survivedMutants?: boolean;
}

export function convertToMarkdown(
  report: StrykerReport,
  options: ConvertOptions = {},
): string {
  const allMutants = Object.values(report.files).flatMap((f) => f.mutants);
  const fileEntries = Object.entries(report.files);

  const sections = [
    summaryHeader(allMutants, report.thresholds),
    statusCountsTable(allMutants),
    fileScoresTable(fileEntries),
    options.survivedMutants ? survivedMutantsSection(fileEntries) : "",
    recommendationsSection(fileEntries),
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
