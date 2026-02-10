# UniConnect

Modular stack for the UniConnect web application.

## Architecture
- `frontend/`: React SPA with feature folders, API client, and shared styles/components.
- `backend/`: Spring Boot REST API connecting to MongoDB for persistence.
- `database/mongodb/`: Scripts, models, or notes for MongoDB schema, seed data, and indexes.

## Next Steps
1. Scaffold the React app inside `frontend/` (e.g., Vite or CRA) and wire up routing/components.
2. Initialize the Spring Boot project under `backend/` with dependencies for Web, MongoDB, and Lombok.
3. Define MongoDB collections plus connector settings, seed scripts, or Docker compose if needed.
4. Document how the frontend and backend communicate and outline API contracts.
