---
trigger: always_on
---


# Backend Development Rules

## Technology Stack
Primary backend technologies:
- Node.js
- Express.js
- TypeScript or JavaScript
- MongoDB
- Mongoose
- PostgreSQL
- REST APIs

Use the technology appropriate to the project.
Do not introduce additional frameworks unnecessarily.

## Architecture
Follow modular architecture.

Organize backend responsibilities into:
- Routes: Endpoint definitions.
- Controllers: HTTP request and response handling.
- Services: Business logic.
- Models: Data structures and persistence.
- Middleware: Authentication and validation.
- Utilities: Shared helper functions.

Use repository layers only when they provide
a meaningful architectural benefit.

Keep controllers lightweight.

## API Development
- Follow REST API conventions.
- Use appropriate HTTP methods.
- Return meaningful HTTP status codes.
- Maintain consistent response structures.
- Validate request parameters and bodies.
- Handle invalid requests gracefully.
- Implement pagination for large collections.
- Use filtering and sorting where required.

## Authentication
- Hash passwords using bcrypt or Argon2.
- Never store plain-text passwords.
- Implement secure authentication.
- Handle access token expiration.
- Secure refresh token handling.
- Implement logout and token invalidation.
- Protect private routes.
- Never expose sensitive authentication data.

## Authorization
- Verify permissions on the server.
- Never trust frontend authorization alone.
- Check resource ownership.
- Implement RBAC where required.
- Prevent unauthorized data access.

## Database Integration
- Keep database logic organized.
- Use appropriate indexes.
- Avoid unnecessary queries.
- Handle database failures.
- Validate database inputs.
- Use transactions where necessary.
- Avoid returning sensitive database fields.

## Error Handling
- Implement centralized error handling.
- Avoid exposing internal stack traces in production.
- Return consistent error responses.
- Handle asynchronous errors properly.
- Log useful debugging information without secrets.

## Security
- Validate all external input.
- Protect against injection attacks.
- Apply rate limiting where appropriate.
- Configure CORS carefully.
- Use secure HTTP headers.
- Protect file upload endpoints.
- Store secrets in environment variables.

## Performance
- Avoid N+1 queries.
- Use pagination for large datasets.
- Avoid unnecessary database operations.
- Use caching when justified.
- Avoid blocking the Node.js event loop.

## Testing
Test:
- API success responses.
- Invalid inputs.
- Authentication.
- Authorization.
- Database failures.
- Edge cases.

## Important
Never sacrifice security for convenience.
Never modify production databases without approval.
Never hardcode credentials or secrets.
