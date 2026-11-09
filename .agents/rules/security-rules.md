---
trigger: always_on
---


# Application Security Rules

## General Security Principles
- Follow secure coding practices.
- Apply the principle of least privilege.
- Validate all untrusted input.
- Never trust client-side validation alone.
- Keep sensitive information private.
- Prefer secure defaults.

## Environment Variables
- Never hardcode API keys.
- Never hardcode database credentials.
- Never expose secrets in frontend code.
- Use environment variables.
- Maintain a .env.example file.
- Add actual .env files to .gitignore.
- Never commit credentials to GitHub.

## Authentication
- Hash passwords using bcrypt or Argon2.
- Never store plain-text passwords.
- Implement secure session or token handling.
- Set appropriate token expiration.
- Validate authentication on protected routes.
- Handle logout and token invalidation.
- Protect against brute-force attempts.

## Authorization
- Verify permissions on the backend.
- Check resource ownership.
- Enforce role-based access control where needed.
- Prevent privilege escalation.
- Never rely exclusively on frontend route guards.
- Prevent users from accessing another user's data.

## API Security
- Validate request bodies and parameters.
- Sanitize input where appropriate.
- Use parameterized database queries.
- Configure CORS explicitly.
- Apply rate limiting to sensitive endpoints.
- Use secure HTTP headers.
- Avoid leaking internal error details.
- Limit request payload sizes.

## Database Security
- Use least-privilege database accounts.
- Avoid unsafe raw queries.
- Protect sensitive information.
- Validate data before persistence.
- Restrict database network access.
- Use secure connection configuration.
- Avoid exposing internal database identifiers
  or sensitive fields unnecessarily.

## File Upload Security
- Validate file types.
- Restrict file sizes.
- Generate safe filenames.
- Avoid trusting file extensions alone.
- Store uploads securely.
- Prevent path traversal.
- Never execute uploaded files.

## Frontend Security
- Avoid unsafe HTML rendering.
- Prevent exposure of private API keys.
- Avoid storing sensitive tokens in insecure locations.
- Handle authentication failures safely.
- Avoid leaking sensitive information in logs.
- Follow secure cookie practices where applicable.

## Dependency Security
- Avoid unnecessary dependencies.
- Prefer maintained packages.
- Check dependency vulnerabilities.
- Do not blindly install unknown packages.
- Review dependency permissions and behavior.

## AI Integration Security
When integrating LLMs or AI agents:
- Treat user input as untrusted.
- Do not expose API keys to the browser.
- Enforce authorization before tool execution.
- Restrict access to user-specific data.
- Prevent cross-user data leakage.
- Validate AI-generated tool arguments.
- Never allow model output to bypass access controls.
- Apply appropriate rate and usage limits.

## Security Verification
Before completing a feature:
- Check authentication and authorization.
- Check input validation.
- Check sensitive data exposure.
- Check common injection risks.
- Check access control.
- Check error responses.
- Report unresolved security concerns.

## Critical Restrictions
- Never disable security checks to make code work.
- Never expose credentials in responses or logs.
- Never execute destructive operations without approval.
- Never access another user's private data without authorization.
- Never claim an application is completely secure.
