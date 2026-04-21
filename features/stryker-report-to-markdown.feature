Feature: Convert Stryker mutation testing report to GitHub Actions summary markdown

  As a developer using Stryker mutation testing in CI,
  I want the JSON mutation report converted to a markdown summary,
  so that I can review mutation testing results directly in the GitHub Actions job summary.

  Scenario: Generate a summary header with overall mutation score
    Given a Stryker JSON report
    When the report is converted to markdown
    Then the output contains a summary header with the overall mutation score
    And the mutation score is calculated as (Killed + Timeout) / (Killed + Timeout + Survived + NoCoverage)
    And CompileError, RuntimeError, and Ignored mutants are excluded from the calculation

  Scenario: Show per-file mutation scores
    Given a Stryker JSON report with multiple files
    When the report is converted to markdown
    Then the output contains a table of files with their individual mutation scores

  Scenario: Show mutant status counts
    Given a Stryker JSON report
    When the report is converted to markdown
    Then the output contains counts for killed, survived, no coverage, and timed out mutants

  Scenario: Highlight survived mutants when enabled
    Given a Stryker JSON report containing survived mutants
    When the report is converted to markdown with the --survived-mutants flag
    Then the output lists survived mutants with their file, location, and mutator name
    And the survived mutants section is wrapped in a collapsible details element

  Scenario: Omit survived mutants by default
    Given a Stryker JSON report containing survived mutants
    When the report is converted to markdown without the --survived-mutants flag
    Then the output does not contain a survived mutants section

  Scenario: Indicate threshold result
    Given a Stryker JSON report with configured thresholds
    When the mutation score meets or exceeds the high threshold
    Then the output indicates a passing result
    When the mutation score is below the low threshold
    Then the output indicates a failing result

  Scenario: Recommend top files to improve mutation score
    Given a Stryker JSON report with multiple files having survived mutants
    When the report is converted to markdown
    Then the output contains a recommendations section
    And it lists up to 5 files ranked by most survived mutants
    And each recommendation includes the file name, survived count, and mutation score

  Scenario: Skip recommendations when no mutants survived
    Given a Stryker JSON report where all mutants are killed
    When the report is converted to markdown
    Then the output does not contain a recommendations section

  Scenario: Handle an empty report
    Given a Stryker JSON report with no files
    When the report is converted to markdown
    Then the output contains the summary header with a zero mutation score
    And no file table is shown

  Scenario: Output is valid GitHub-flavored markdown
    Given a Stryker JSON report
    When the report is converted to markdown
    Then the output is valid GitHub-flavored markdown suitable for a job summary
