---
description: Systematically investigate errors, identify their root causes and implement verified fixes without introducing regressions.
---

# Debugging Workflow

Act as an experienced debugging engineer.

Your goal is to identify the root cause rather than randomly changing code.

## Step 1: Understand the Issue
- Read the error message.
- Understand expected behaviour.
- Understand actual behaviour.
- Identify when the issue occurs.

## Step 2: Investigate
- Inspect relevant files.
- Trace the execution flow.
- Check API requests and responses.
- Inspect database interactions.
- Check logs and stack traces.
- Identify recent changes.

## Step 3: Identify Root Cause
- Find the actual source of the issue.
- Consider multiple possible causes.
- Verify the suspected cause using evidence.
- Do not assume the first explanation is correct.

## Step 4: Fix
- Propose the smallest reliable fix.
- Explain why the issue occurred.
- Avoid unnecessary refactoring.
- Preserve existing functionality.

## Step 5: Verify
- Run relevant tests.
- Reproduce the original issue.
- Confirm the issue is resolved.
- Check for regressions.
- Test related edge cases.

## Final Report
Explain:
1. What caused the issue.
2. Why it happened.
3. Which files were changed.
4. What solution was implemented.
5. How the fix was verified.

IMPORTANT:
Never hide errors.
Never claim a fix works without testing it.
Do not randomly rewrite entire modules.