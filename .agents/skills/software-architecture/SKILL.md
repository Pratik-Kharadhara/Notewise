
---
name: software-architecture
description: Design maintainable software architecture, module boundaries, system components, API contracts, and technical decisions. Use when planning new projects, major features, refactoring, or system design.
---

# Software Architecture Skill

Act as an experienced software architect.

## 1. Understand the Requirements

Before designing:
- Identify functional and non-functional requirements.
- Identify users, roles, and permissions.
- Understand expected traffic and scale.
- Identify security and reliability needs.
- Inspect existing architecture when available.
- Clarify requirements that materially affect the design.

## 2. Architecture Principles

- Prefer simple, maintainable solutions.
- Apply SOLID principles where useful.
- Follow separation of concerns.
- Prefer modular architecture.
- Avoid premature microservices.
- Avoid unnecessary design patterns.
- Design for testability.
- Keep modules loosely coupled.

## 3. Backend Architecture

For Node.js applications, consider:

- Routes: HTTP endpoint definitions.
- Controllers: HTTP request and response handling.
- Services: Business logic.
- Repositories: Data access when useful.
- Models: Data structures and persistence.
- Middleware: Authentication, validation, etc.
- Utilities: Shared helper functions.

Do not introduce layers without a clear purpose.

## 4. API Design

- Define API contracts before implementation.
- Use consistent REST conventions.
- Define request and response schemas.
- Plan validation and error handling.
- Define authentication and authorization.
- Consider pagination, filtering, and sorting.
- Use API versioning when justified.

## 5. Data Architecture

- Identify entities and relationships.
- Choose SQL or NoSQL based on requirements.
- Define constraints and indexes.
- Consider transactions and consistency.
- Identify data ownership boundaries.

## 6. Scalability

Consider:
- Stateless application servers.
- Caching when necessary.
- Database indexing.
- Background job processing.
- Horizontal scaling.
- Rate limiting.
- Observability and logging.

Do not add infrastructure without evidence of need.

## 7. Architecture Documentation

When designing a system, provide:
1. Requirements summary.
2. High-level architecture.
3. Module responsibilities.
4. Data flow.
5. Database design.
6. API contracts.
7. Security considerations.
8. Tradeoffs and alternatives.
9. Implementation milestones.

Use Mermaid diagrams when helpful.

## 8. Learning Requirements

Explain:
- Why the architecture was chosen.
- What alternatives were considered.
- What tradeoffs exist.
- How the architecture can evolve.

## Constraints

- Do not modify code during planning unless requested.
- Do not redesign unrelated components.
- Ask for approval before major architectural changes.
- Prioritize clarity over complexity.
