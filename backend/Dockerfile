FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/backend-0.1.0.jar"]
