export type MutantStatus =
  | "Killed"
  | "Survived"
  | "Timeout"
  | "NoCoverage"
  | "RuntimeError"
  | "CompileError";

export interface Mutant {
  id: string;
  status: MutantStatus;
  mutatorName: string;
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
  if (mutants.length === 0) return 0;
  const detected = mutants.filter(
    (m) => m.status === "Killed" || m.status === "Timeout",
  ).length;
  return (detected / mutants.length) * 100;
}

function summaryHeader(mutants: Mutant[]): string {
  const score = mutationScore(mutants);
  return `# Mutation Testing Report\n\n**Mutation Score: ${score.toFixed(2)}%**`;
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

export function convertToMarkdown(report: StrykerReport): string {
  const allMutants = Object.values(report.files).flatMap((f) => f.mutants);
  const fileEntries = Object.entries(report.files);

  const sections = [
    summaryHeader(allMutants),
    statusCountsTable(allMutants),
    fileScoresTable(fileEntries),
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
