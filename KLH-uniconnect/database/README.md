# MongoDB Layer

Use this directory for any MongoDB-specific artifacts:
- Schema diagrams or JSON schema validation rules.
- Seed data (`*.json`) that can be imported with `mongoimport`.
- MongoDB indexes or aggregation samples that the backend relies on.
- Docker Compose snippet referencing a MongoDB service if desired.

## Suggested files
- `mongodb/schema.json` for document structure.
- `mongodb/seed-users.json` for initial data.
- `mongodb/indexes.md` to track compound indexes and TTLs.
