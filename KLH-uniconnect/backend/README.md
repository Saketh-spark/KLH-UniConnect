# UniConnect Backend

## Structure
- `src/main/java/com/uniconnect`: Java entry point, controllers, services, repositories.
- `src/main/resources`: runtime config (`application.properties`), static resources.
- `src/test/java/com/uniconnect`: integration/unit tests.

## Tech stack
- Spring Boot 3.4, Java 21, MongoDB driver via Spring Data.
- Lombok for boilerplate reduction, validation starter for bean validation.

## Next steps
1. Define MongoDB document models under `model` and connect via repositories.
2. Build REST controllers under `controller` and service/mapper layers as needed.
3. Secure the API, configure CORS, and expose health/metrics endpoints.
