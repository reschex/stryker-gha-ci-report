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

export function convertToMarkdown(report: StrykerReport): string {
  const allMutants = Object.values(report.files).flatMap((f) => f.mutants);
  const score = mutationScore(allMutants);

  let md = `# Mutation Testing Report\n\n**Mutation Score: ${score.toFixed(2)}%**\n`;

  const fileEntries = Object.entries(report.files);
  if (fileEntries.length > 0) {
    md += "\n| File | Mutation Score |\n| --- | --- |\n";
    for (const [name, file] of fileEntries) {
      md += `| ${name} | ${mutationScore(file.mutants).toFixed(2)}% |\n`;
    }
  }

  return md;
}
