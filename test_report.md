
> stryker-gha-ci-report@0.2.0 report
> node dist/cli.js example_report/mutation.json

# ­ƒº¼ Mutation Testing Report

**Mutation Score: 58.33% ÔØî failing**

| Status | Count |
| --- | --- |
| Killed | 6 |
| Survived | 4 |
| No Coverage | 1 |
| Timeout | 1 |

<details>
<summary>ÔØî <code>src</code> 58.33% (Killed: 6, Survived: 4, No Coverage: 1, Timeout: 1)</summary>

| File | Mutation Score | Killed | Survived | No Coverage | Timeout |
| --- | --- | --- | --- | --- | --- |
| math.ts | 60.00% | 3 | 2 | 0 | 0 |
| strings.ts | 66.67% | 2 | 0 | 1 | 0 |
| validate.ts | 50.00% | 1 | 2 | 0 | 1 |

</details>

## ­ƒÆí Recommendations

| File | Survived | Mutation Score |
| --- | --- | --- |
| src/math.ts | 2 | 60.00% |
| src/validate.ts | 2 | 50.00% |

