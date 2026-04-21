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
  if (score >= thresholds.high) return "✅ passing";
  if (score < thresholds.low) return "❌ failing";
  return "⚠️ warning";
}

function summaryHeader(
  mutants: Mutant[],
  thresholds: StrykerReport["thresholds"],
): string {
  const score = mutationScore(mutants);
  const indicator = thresholdIndicator(score, thresholds);
  return `# 🧬 Mutation Testing Report\n\n**Mutation Score: ${score.toFixed(2)}% ${indicator}**`;
}

function statusCountsTable(mutants: Mutant[]): string {
  const c = statusCounts(mutants);

  return [
    "| Status | Count |",
    "| --- | --- |",
    `| ✅ Killed | ${c.killed} |`,
    `| 🔴 Survived | ${c.survived} |`,
    `| 🟡 No Coverage | ${c.noCoverage} |`,
    `| ⏱️ Timeout | ${c.timeout} |`,
  ].join("\n");
}

function statusCounts(mutants: Mutant[]) {
  return {
    killed: mutants.filter((m) => m.status === "Killed").length,
    survived: mutants.filter((m) => m.status === "Survived").length,
    noCoverage: mutants.filter((m) => m.status === "NoCoverage").length,
    timeout: mutants.filter((m) => m.status === "Timeout").length,
  };
}

interface FolderNode {
  files: [string, FileResult][];
  children: Map<string, FolderNode>;
}

function buildFolderTree(fileEntries: [string, FileResult][]): FolderNode {
  const root: FolderNode = { files: [], children: new Map() };
  for (const [path, result] of fileEntries) {
    const parts = path.split("/");
    const fileName = parts.pop()!;
    let node = root;
    for (const part of parts) {
      if (!node.children.has(part)) {
        node.children.set(part, { files: [], children: new Map() });
      }
      node = node.children.get(part)!;
    }
    node.files.push([fileName, result]);
  }
  return root;
}

function allMutantsInNode(node: FolderNode): Mutant[] {
  const mutants = node.files.flatMap(([, f]) => f.mutants);
  for (const child of node.children.values()) {
    mutants.push(...allMutantsInNode(child));
  }
  return mutants;
}

function thresholdEmoji(
  score: number,
  thresholds: StrykerReport["thresholds"],
): string {
  if (score >= thresholds.high) return "✅";
  if (score < thresholds.low) return "❌";
  return "⚠️";
}

function renderFolderNode(
  name: string,
  node: FolderNode,
  thresholds: StrykerReport["thresholds"],
): string {
  const allMuts = allMutantsInNode(node);
  const score = mutationScore(allMuts);
  const counts = statusCounts(allMuts);
  const emoji = thresholdEmoji(score, thresholds);

  const parts: string[] = [];

  parts.push("<details>");
  parts.push(
    `<summary>${emoji} <code>${name}</code> ${score.toFixed(2)}% ` +
      `(Killed: ${counts.killed}, Survived: ${counts.survived}, ` +
      `No Coverage: ${counts.noCoverage}, Timeout: ${counts.timeout})</summary>`,
  );
  parts.push("");

  if (node.files.length > 0) {
    parts.push("| File | Mutation Score | Killed | Survived | No Coverage | Timeout |");
    parts.push("| --- | --- | --- | --- | --- | --- |");
    for (const [fileName, file] of node.files) {
      const c = statusCounts(file.mutants);
      parts.push(
        `| ${fileName} | ${mutationScore(file.mutants).toFixed(2)}% | ${c.killed} | ${c.survived} | ${c.noCoverage} | ${c.timeout} |`,
      );
    }
    parts.push("");
  }

  for (const [childName, childNode] of node.children) {
    parts.push(renderFolderNode(childName, childNode, thresholds));
    parts.push("");
  }

  parts.push("</details>");
  return parts.join("\n");
}

function folderScoresSection(
  fileEntries: [string, FileResult][],
  thresholds: StrykerReport["thresholds"],
): string {
  if (fileEntries.length === 0) return "";
  const tree = buildFolderTree(fileEntries);

  const sections: string[] = [];
  for (const [name, node] of tree.children) {
    sections.push(renderFolderNode(name, node, thresholds));
  }
  if (tree.files.length > 0) {
    const rows = tree.files.map(([fileName, file]) => {
      const c = statusCounts(file.mutants);
      return `| ${fileName} | ${mutationScore(file.mutants).toFixed(2)}% | ${c.killed} | ${c.survived} | ${c.noCoverage} | ${c.timeout} |`;
    });
    sections.push(
      [
        "| File | Mutation Score | Killed | Survived | No Coverage | Timeout |",
        "| --- | --- | --- | --- | --- | --- |",
        ...rows,
      ].join("\n"),
    );
  }
  return sections.join("\n\n");
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
    "## 💡 Recommendations",
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
    folderScoresSection(fileEntries, report.thresholds),
    options.survivedMutants ? survivedMutantsSection(fileEntries) : "",
    recommendationsSection(fileEntries),
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
