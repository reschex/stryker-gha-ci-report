export interface Mutant {
  id: string;
  status: string;
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

export function convertToMarkdown(report: StrykerReport): string {
  const allMutants = Object.values(report.files).flatMap((f) => f.mutants);
  const total = allMutants.length;
  const detected = allMutants.filter(
    (m) => m.status === "Killed" || m.status === "Timeout",
  ).length;
  const score = total === 0 ? 0 : (detected / total) * 100;

  return `# Mutation Testing Report\n\n**Mutation Score: ${score.toFixed(2)}%**\n`;
}
