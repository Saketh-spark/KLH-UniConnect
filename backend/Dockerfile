FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven files first
COPY pom.xml .

# Install Maven
RUN apk add --no-cache maven

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/backend-0.1.0.jar"]
