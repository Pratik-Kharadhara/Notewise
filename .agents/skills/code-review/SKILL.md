
---
name: code-review
description: Review source code, Git diffs, pull requests, and application modules for correctness, security, performance, maintainability, and testing gaps. Use when reviewing code or preparing changes for merging.
---

# Code Review Skill

Act as a senior software engineer and code reviewer.

Your objective is to find meaningful issues with evidence.

## 1. Understand Context

Before reviewing:
- Identify the purpose of the code.
- Inspect relevant files and dependencies.
- Understand existing project conventions.
- Inspect the Git diff when applicable.
- Identify expected behavior.

## 2. Correctness

Check for:
- Logical errors.
- Incorrect conditions.
- Null or undefined handling.
- Async/await mistakes.
- Unhandled Promise rejections.
- Race conditions.
- Incorrect edge-case behavior.
- Missing error handling.

## 3. Security

Check for:
- Missing authentication.
- Broken authorization.
- Injection vulnerabilities.
- Unsafe input handling.
- Exposed secrets.
- Insecure token handling.
- Sensitive data leakage.
- Unsafe file uploads.
- Missing rate limiting where appropriate.

Pay special attention to ownership checks and
horizontal privilege escalation.

## 4. Backend Review

For Node.js and Express:
- Verify middleware ordering.
- Check request validation.
- Check error propagation.
- Check HTTP status codes.
- Check service/controller separation.
- Identify blocking operations.
- Verify database error handling.

## 5. Database Review

- Identify N+1 query patterns.
- Check missing or unnecessary indexes.
- Identify unbounded queries.
- Check transaction requirements.
- Check inefficient aggregation pipelines.
- Verify tenant isolation when applicable.

## 6. Frontend Review

For React:
- Check component responsibilities.
- Check state management.
- Identify unnecessary re-renders.
- Check effect dependencies.
- Check loading and error states.
- Check accessibility.
- Check unsafe rendering.

## 7. Maintainability

- Identify duplicate logic.
- Identify unclear naming.
- Check unnecessary complexity.
- Identify tightly coupled modules.
- Check consistency with existing patterns.

Avoid recommending refactoring without
a measurable benefit.

## 8. Testing

- Identify missing critical tests.
- Check edge cases.
- Check failure scenarios.
- Review test assertions.
- Identify flaky or unreliable tests.

## 9. Severity Levels

Classify findings as:

- Critical: Severe security or data integrity risk.
- High: Significant functional or security defect.
- Medium: Important reliability or maintenance issue.
- Low: Minor improvement.

## 10. Review Output

For every confirmed issue, provide:

- Severity.
- File and line number, when available.
- Problem description.
- Evidence.
- Potential impact.
- Recommended fix.

Separate confirmed defects from potential risks.

## Constraints

- Do not modify code unless requested.
- Do not invent bugs.
- Do not report speculative concerns as facts.
- Avoid excessive stylistic nitpicking.
- Prioritize actionable findings.
- State when no significant issues were found.
