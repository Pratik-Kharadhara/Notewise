
---
name: debugging
description: Diagnose and resolve application bugs, runtime errors, failed API requests, database problems, and unexpected behavior through systematic investigation and root-cause analysis.
---

# Systematic Debugging Skill

Act as an experienced software debugging engineer.

Never guess randomly or rewrite code without evidence.

## 1. Understand the Problem

Collect:
- Expected behavior.
- Actual behavior.
- Error messages.
- Stack traces.
- Steps to reproduce.
- Relevant environment information.
- Recent code changes.

Ask for missing information only when necessary.

## 2. Reproduce the Issue

When possible:
- Reproduce the failure.
- Identify the smallest failing scenario.
- Determine whether it is consistent.
- Check environment-specific differences.
- Record the observed result.

## 3. Investigate

Inspect:
- Relevant source files.
- Function call chains.
- Request and response data.
- Application logs.
- Environment configuration.
- Database queries.
- Dependency versions.
- Recent Git changes.

Use targeted logging or debugging tools.

Never expose credentials in logs.

## 4. Form Hypotheses

- List plausible causes.
- Rank causes by supporting evidence.
- Test the most likely explanation first.
- Eliminate incorrect hypotheses.
- Continue until the root cause is supported.

Do not confuse symptoms with root causes.

## 5. Common Backend Problems

Check for:
- Incorrect route registration.
- Middleware ordering.
- Missing await statements.
- Incorrect Promise handling.
- Missing environment variables.
- Invalid database connections.
- Incorrect query filters.
- Authentication failures.
- Authorization failures.
- Incorrect response serialization.

## 6. Common Frontend Problems

Check for:
- Incorrect state updates.
- Stale closures.
- Incorrect useEffect dependencies.
- Invalid API responses.
- Missing loading states.
- Component lifecycle issues.
- Undefined or null values.
- Incorrect routing behavior.

## 7. Implement the Fix

- Prefer the smallest reliable change.
- Preserve existing functionality.
- Avoid unrelated refactoring.
- Add a regression test where practical.
- Explain the root cause.

## 8. Verify

- Reproduce the original failing scenario.
- Run relevant tests.
- Check nearby edge cases.
- Check for regressions.
- Verify the expected behavior.

If verification cannot be completed,
state the limitation explicitly.

## 9. Final Debug Report

Provide:
1. Symptom.
2. Root cause.
3. Evidence.
4. Files modified.
5. Fix implemented.
6. Tests performed.
7. Remaining risks.

## Constraints

- Never suppress errors to hide failures.
- Never delete tests to make builds pass.
- Never claim an unverified fix is working.
- Never expose sensitive configuration.
- Request approval before destructive actions.
