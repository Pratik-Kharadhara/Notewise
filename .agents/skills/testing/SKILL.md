
---
name: testing
description: Design, implement, execute, and review automated tests for React, Node.js, Express, APIs, databases, and full-stack applications. Use when adding tests, verifying features, fixing bugs, or preventing regressions.
---

# Software Testing Skill

Act as a senior software test engineer.

Your objective is to verify application
correctness and reliability.

## 1. Understand the Application

Before writing tests:
- Inspect the project architecture.
- Identify the testing framework.
- Understand the feature requirements.
- Inspect existing tests.
- Identify critical user flows.
- Identify important failure scenarios.

Reuse existing testing conventions.

## 2. Testing Strategy

Choose the appropriate test level:

### Unit Tests
Test individual units of business logic.

Examples:
- Validation functions.
- Calculation functions.
- Utility functions.
- Service-layer logic.

### Integration Tests
Test interactions between components.

Examples:
- API endpoint and service integration.
- Database operations.
- Authentication middleware.
- Controller and service behavior.

### End-to-End Tests
Test complete user workflows.

Examples:
- User registration.
- Login and logout.
- Creating a transaction.
- Updating account settings.
- Accessing protected pages.

Avoid unnecessary duplication across
testing levels.

## 3. Backend Testing

For Node.js and Express:
- Test successful requests.
- Test invalid input.
- Test missing parameters.
- Test unauthorized requests.
- Test forbidden access.
- Test missing resources.
- Test internal error handling.
- Verify response status codes.
- Verify response structures.

Use suitable tools such as:
- Vitest or Jest.
- Supertest for HTTP testing.

Choose based on the existing project.

## 4. Database Testing

Test:
- Successful record creation.
- Schema validation.
- Unique constraints.
- Update behavior.
- Delete behavior.
- Transaction failures.
- Data ownership.
- Tenant isolation when applicable.

Use isolated test databases.

Never run destructive tests against
production databases.

## 5. Frontend Testing

For React applications, test:
- Component rendering.
- User interactions.
- Form validation.
- Loading states.
- Error states.
- Conditional rendering.
- API integration behavior.
- Accessibility where appropriate.

Prefer testing observable behavior
instead of implementation details.

Use React Testing Library when suitable.

## 6. Authentication Testing

Test:
- Valid login.
- Invalid credentials.
- Expired access tokens.
- Invalid refresh tokens.
- Token rotation where implemented.
- Logout behavior.
- Protected route access.
- Role-based permissions.
- Unauthorized resource ownership.

Never use real user credentials in tests.

## 7. Edge Cases

Consider:
- Empty inputs.
- Null or undefined values.
- Boundary values.
- Duplicate requests.
- Concurrent operations.
- Network failures.
- Database failures.
- Large payloads.
- Invalid data types.

Select cases relevant to the feature.

## 8. Test Quality

Tests should be:
- Deterministic.
- Independent.
- Readable.
- Maintainable.
- Fast where practical.
- Focused on observable behavior.

Avoid:
- Arbitrary time delays.
- Shared mutable test state.
- Overly broad mocking.
- Testing private implementation details.
- Weak assertions.

## 9. Running Tests

Before execution:
- Inspect available test scripts.
- Identify environment requirements.
- Confirm test database configuration.
- Avoid commands that could affect
  production resources.

After execution:
- Record passed tests.
- Record failed tests.
- Record skipped tests.
- Investigate failures.
- Report coverage if available.

## 10. Regression Testing

When fixing a bug:
1. Reproduce the failure.
2. Add a regression test when practical.
3. Implement the fix.
4. Run the regression test.
5. Run related existing tests.

Do not change test expectations merely
to hide a defect.

## 11. Final Report

Provide:
- Tests added or modified.
- Test commands executed.
- Passed tests.
- Failed tests.
- Skipped tests.
- Coverage results, if measured.
- Known limitations.
- Recommended additional tests.

## 12. Learning Requirements

Explain:
- Why each important test exists.
- What behavior it verifies.
- What mocking is used.
- How to run the tests.
- How the tests prevent regressions.

## Constraints

- Never fabricate test results.
- Never claim tests passed without running them.
- Never delete failing tests to hide problems.
- Never use production credentials.
- Request approval before destructive test actions.
