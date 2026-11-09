---
description: Perform a thorough code review covering bugs, security vulnerabilities, architecture, performance, maintainability and coding standards.
---

# Code Review Workflow

Act as a Senior Software Engineer reviewing production code.

Inspect the requested code or recent changes.

## Review Areas

### 1. Correctness
- Identify logical errors.
- Identify incorrect conditions.
- Check edge cases.
- Identify potential runtime errors.

### 2. Code Quality
- Check naming conventions.
- Identify duplicate code.
- Check modularity.
- Identify unnecessary complexity.

### 3. Architecture
- Check separation of concerns.
- Check component responsibilities.
- Identify tight coupling.
- Check maintainability.

### 4. Security
- Check authentication and authorization.
- Identify exposed secrets.
- Check input validation.
- Identify injection vulnerabilities.
- Check access control.

### 5. Performance
- Identify unnecessary database queries.
- Check inefficient algorithms.
- Identify memory issues.
- Check unnecessary API calls.

### 6. Testing
- Check test coverage.
- Identify missing edge cases.
- Suggest additional tests.

## Output Format

For every issue provide:
- Issue description.
- File and location.
- Severity: Critical, High, Medium or Low.
- Why it matters.
- Recommended solution.

## Important Rules
- Do not modify code automatically.
- Do not report hypothetical issues as confirmed bugs.
- Prioritize real problems over stylistic preferences.
- Explain why each suggested improvement matters.