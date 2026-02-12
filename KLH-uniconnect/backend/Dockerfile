FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/backend-0.1.0.jar"]
