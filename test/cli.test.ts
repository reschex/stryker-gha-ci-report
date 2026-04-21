import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";
import { join } from "path";

const cli = join(import.meta.dirname, "..", "dist", "cli.js");
const exampleReport = join(import.meta.dirname, "..", "example_report", "mutation.json");

function run(...args: string[]): string {
  return execFileSync("node", [cli, ...args], { encoding: "utf-8" });
}

describe("cli", () => {
  it("omits survived mutants section by default", () => {
    const output = run(exampleReport);

    expect(output).toContain("# Mutation Testing Report");
    expect(output).not.toContain("Survived Mutants");
  });

  it("includes survived mutants section when --survived-mutants is passed", () => {
    const output = run("--survived-mutants", exampleReport);

    expect(output).toContain("<details>");
    expect(output).toContain("<summary>Survived Mutants (");
    expect(output).toContain("</details>");
  });
});
