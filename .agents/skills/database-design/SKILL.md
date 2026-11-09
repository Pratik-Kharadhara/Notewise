
---
name: database-design
description: Design, review, and optimize MongoDB, Mongoose, and PostgreSQL databases, including schemas, relationships, indexes, transactions, migrations, and query performance. Use for data modeling and database-related implementation.
---

# Database Design Skill

Act as a senior database engineer.

Design databases that are correct, secure,
maintainable, and efficient.

## 1. Requirements Analysis

Before designing:
- Identify the entities.
- Identify relationships.
- Understand access patterns.
- Identify read and write operations.
- Determine consistency requirements.
- Understand expected data volume.
- Identify security requirements.

Do not select a database solely based
on developer familiarity.

## 2. Database Selection

### PostgreSQL
Prefer when the application needs:
- Strong relational integrity.
- Complex relationships.
- ACID transactions.
- Structured data.
- Complex joins and reporting.

### MongoDB
Consider when the application needs:
- Flexible document structures.
- Document-oriented access patterns.
- Embedded related data.
- Evolving schemas.

Explain the tradeoffs before recommending
a database.

## 3. PostgreSQL Design

Follow these practices:
- Use appropriate data types.
- Define primary keys.
- Define foreign keys.
- Apply unique constraints.
- Use NOT NULL where appropriate.
- Normalize data when beneficial.
- Avoid unnecessary denormalization.
- Design indexes based on query patterns.
- Use transactions for atomic operations.
- Plan safe database migrations.

Consider:
- Referential integrity.
- Cascade behavior.
- Transaction isolation.
- Query execution plans.
- Connection pooling.

## 4. MongoDB and Mongoose Design

Follow these practices:
- Design collections around access patterns.
- Choose embedding versus referencing carefully.
- Define schema validation.
- Use appropriate field types.
- Add timestamps where useful.
- Create indexes for frequent queries.
- Avoid unbounded document growth.
- Use projections to limit returned fields.
- Avoid unnecessary populate operations.
- Use transactions when required.

For Mongoose:
- Validate required fields.
- Define meaningful constraints.
- Handle duplicate-key errors.
- Use lean queries for read-only operations
  when appropriate.
- Avoid exposing internal database fields.

## 5. Relationships

Identify:
- One-to-one relationships.
- One-to-many relationships.
- Many-to-many relationships.

Explain how relationships are represented
in the selected database.

## 6. Index Optimization

For every proposed index:
- Identify the query it supports.
- Consider selectivity.
- Consider sorting requirements.
- Consider index maintenance cost.
- Avoid redundant indexes.

Use EXPLAIN or query plans when available.

Never claim an index improves performance
without considering the actual workload.

## 7. Multi-Tenant Applications

When applicable:
- Define a clear tenant isolation strategy.
- Associate tenant-owned records with a tenant.
- Enforce tenant authorization server-side.
- Scope every tenant-specific query correctly.
- Prevent cross-tenant data access.
- Test tenant isolation explicitly.

Do not trust client-provided tenant IDs
without authorization checks.

## 8. Data Security

- Apply least-privilege database access.
- Protect sensitive fields.
- Avoid exposing credentials.
- Use parameterized SQL queries.
- Validate database inputs.
- Protect against injection attacks.
- Consider encryption where appropriate.
- Plan backup and recovery procedures.

## 9. Transactions and Consistency

- Identify operations requiring atomicity.
- Define transaction boundaries.
- Handle transaction failures.
- Consider concurrent updates.
- Prevent lost updates where relevant.
- Avoid unnecessary long transactions.

## 10. Schema Changes

Before modifying an existing database:
- Inspect the current schema.
- Identify affected queries.
- Consider backward compatibility.
- Plan migrations.
- Consider rollback strategies.
- Identify potential data loss.

Never execute destructive migrations
without explicit approval.

## 11. Output Requirements

For database design tasks, provide:

1. Entity or collection definitions.
2. Fields and data types.
3. Relationships.
4. Constraints and validation.
5. Index recommendations.
6. Example query patterns.
7. Security considerations.
8. Migration requirements, if applicable.

Provide an ER diagram or Mermaid diagram
when useful.

## 12. Learning Requirements

Explain:
- Why the schema was designed this way.
- Why specific indexes are needed.
- Why embedding or referencing was chosen.
- How the design affects query performance.
- What tradeoffs exist.

## Constraints

- Do not modify production data without approval.
- Do not perform destructive operations automatically.
- Do not introduce unnecessary indexes.
- Do not optimize without understanding access patterns.
- Prioritize correctness before performance.
