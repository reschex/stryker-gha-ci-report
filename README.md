# stryker-gha-ci-report

Convert [Stryker](https://stryker-mutator.io/) mutation testing JSON reports into markdown summaries for GitHub Actions job summaries.

## Features

- Overall mutation score with threshold indicator (passing / warning / failing)
- Per-file mutation scores
- Mutant status counts (Killed, Survived, No Coverage, Timeout)
- Optional collapsible list of survived mutants with file, location, and mutator
- Recommendations section ranking top 5 files by survived mutant count

## Installation

```sh
npm install stryker-gha-ci-report
```

Requires Node.js >= 20.

## CLI Usage

```sh
npx stryker-gha-ci-report [--survived-mutants] <path-to-mutation.json>
```

### Options

| Flag | Description |
| --- | --- |
| `--survived-mutants` | Include a collapsible section listing each survived mutant |

### GitHub Actions Example

```yaml
- name: Run Stryker
  run: npx stryker run

- name: Report
  if: always()
  run: npx stryker-gha-ci-report reports/mutation/mutation.json >> $GITHUB_STEP_SUMMARY
```

## Library Usage

```ts
import { convertToMarkdown } from "stryker-gha-ci-report";
import { readFileSync } from "fs";

const report = JSON.parse(readFileSync("reports/mutation/mutation.json", "utf-8"));
const markdown = convertToMarkdown(report, { survivedMutants: true });
console.log(markdown);
```

### API

#### `convertToMarkdown(report, options?)`

| Parameter | Type | Description |
| --- | --- | --- |
| `report` | `StrykerReport` | Parsed Stryker JSON report |
| `options.survivedMutants` | `boolean` | Include survived mutants detail section (default: `false`) |

Returns a markdown string.

### Exported Types

`StrykerReport`, `ConvertOptions`, `FileResult`, `Mutant`, `MutantStatus`, `MutantLocation`

## Threshold Indicator

The summary header includes a threshold indicator based on the `thresholds` configured in your Stryker report:

| Condition | Indicator |
| --- | --- |
| Score >= `thresholds.high` | passing |
| Score >= `thresholds.low` | warning |
| Score < `thresholds.low` | failing |

## Development

```sh
npm install
npm run build
npm test
npm run lint
```

## License

MIT
