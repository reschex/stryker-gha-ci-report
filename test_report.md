
> stryker-gha-ci-report@0.2.0 report
> node dist/cli.js example_report/mutation_local.json

# Mutation Testing Report

**Mutation Score: 89.76% ÔÇö passing**

| Status | Count |
| --- | --- |
| Killed | 711 |
| Survived | 76 |
| No Coverage | 6 |
| Timeout | 8 |

<details>
<summary><code>src</code> 89.76% (Killed: 711, Survived: 76, No Coverage: 6, Timeout: 8)</summary>

<details>
<summary><code>core</code> 90.82% (Killed: 259, Survived: 26, No Coverage: 1, Timeout: 8)</summary>

| File | Mutation Score | Killed | Survived | No Coverage | Timeout |
| --- | --- | --- | --- | --- | --- |
| estimateCc.ts | 89.29% | 19 | 3 | 0 | 6 |
| lspCallGraphParsing.ts | 88.89% | 16 | 1 | 1 | 0 |
| analyze.ts | 0.00% | 0 | 0 | 0 | 0 |
| ccRegistry.ts | 100.00% | 2 | 0 | 0 | 0 |
| churnParse.ts | 100.00% | 7 | 0 | 0 | 0 |
| graphBuilder.ts | 100.00% | 6 | 0 | 0 | 0 |
| jacocoParse.ts | 80.33% | 49 | 12 | 0 | 0 |
| lcovParse.ts | 89.80% | 44 | 5 | 0 | 0 |
| rollup.ts | 100.00% | 20 | 0 | 0 | 0 |
| coverageStore.ts | 76.47% | 13 | 4 | 0 | 0 |
| churn.ts | 100.00% | 2 | 0 | 0 | 0 |
| coverageMap.ts | 100.00% | 24 | 0 | 0 | 0 |
| rank.ts | 97.06% | 31 | 1 | 0 | 2 |
| viewModel.ts | 100.00% | 15 | 0 | 0 | 0 |
| metrics.ts | 100.00% | 11 | 0 | 0 | 0 |

</details>

<details>
<summary><code>ddp</code> 89.15% (Killed: 452, Survived: 50, No Coverage: 5, Timeout: 0)</summary>

| File | Mutation Score | Killed | Survived | No Coverage | Timeout |
| --- | --- | --- | --- | --- | --- |
| analysisOrchestrator.ts | 73.53% | 25 | 9 | 0 | 0 |
| configuration.ts | 100.00% | 22 | 0 | 0 | 0 |
| riskTreeProvider.ts | 93.33% | 28 | 2 | 0 | 0 |
| documentSymbols.ts | 88.24% | 15 | 2 | 0 | 0 |
| lcov.ts | 94.44% | 17 | 1 | 0 | 0 |
| symbolId.ts | 90.00% | 9 | 1 | 0 | 0 |
| editor.ts | 100.00% | 2 | 0 | 0 | 0 |
| revealSymbol.ts | 84.21% | 16 | 2 | 1 | 0 |
| lspCallGraphAdapter.ts | 75.00% | 9 | 3 | 0 | 0 |
| spawnCollect.ts | 90.48% | 19 | 2 | 0 | 0 |
| lspCallGraph.ts | 100.00% | 30 | 0 | 0 | 0 |
| coverageStore.ts | 82.35% | 28 | 3 | 3 | 0 |
| adapters.ts | 90.57% | 48 | 5 | 0 | 0 |
| hoverProvider.ts | 70.00% | 7 | 3 | 0 | 0 |
| codeLensProvider.ts | 100.00% | 12 | 0 | 0 | 0 |
| decorationManager.ts | 64.71% | 11 | 6 | 0 | 0 |
| analyzeCommand.ts | 100.00% | 16 | 0 | 0 | 0 |
| extensionState.ts | 100.00% | 3 | 0 | 0 | 0 |
| analysisService.ts | 93.33% | 14 | 1 | 0 | 0 |
| loadJacocoIntoStore.ts | 78.26% | 18 | 5 | 0 | 0 |

<details>
<summary><code>cc</code> 93.81% (Killed: 91, Survived: 5, No Coverage: 1, Timeout: 0)</summary>

| File | Mutation Score | Killed | Survived | No Coverage | Timeout |
| --- | --- | --- | --- | --- | --- |
| eslintComplexity.ts | 100.00% | 17 | 0 | 0 | 0 |
| pmdComplexity.ts | 100.00% | 5 | 0 | 0 | 0 |
| radonCc.ts | 100.00% | 5 | 0 | 0 | 0 |
| pmdParse.ts | 100.00% | 20 | 0 | 0 | 0 |
| radonParse.ts | 86.67% | 13 | 2 | 0 | 0 |
| eslintParse.ts | 73.33% | 11 | 3 | 1 | 0 |
| radonSpawn.ts | 100.00% | 5 | 0 | 0 | 0 |
| pmdSpawn.ts | 100.00% | 8 | 0 | 0 | 0 |
| eslintSpawn.ts | 100.00% | 5 | 0 | 0 | 0 |
| parseComplexity.ts | 100.00% | 2 | 0 | 0 | 0 |

</details>

<details>
<summary><code>churn</code> 100.00% (Killed: 12, Survived: 0, No Coverage: 0, Timeout: 0)</summary>

| File | Mutation Score | Killed | Survived | No Coverage | Timeout |
| --- | --- | --- | --- | --- | --- |
| gitSpawn.ts | 100.00% | 7 | 0 | 0 | 0 |
| gitChurnAdapter.ts | 100.00% | 5 | 0 | 0 | 0 |

</details>

</details>

</details>

## Recommendations

| File | Survived | Mutation Score |
| --- | --- | --- |
| src/core/jacocoParse.ts | 12 | 80.33% |
| src/ddp/analysisOrchestrator.ts | 9 | 73.53% |
| src/ddp/decorationManager.ts | 6 | 64.71% |
| src/core/lcovParse.ts | 5 | 89.80% |
| src/ddp/adapters.ts | 5 | 90.57% |

