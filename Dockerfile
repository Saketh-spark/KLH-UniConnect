FROM openjdk:24-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY KLH-uniconnect/backend/pom.xml .
COPY KLH-uniconnect/backend/.mvn .mvn
COPY KLH-uniconnect/backend/mvnw .

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY KLH-uniconnect/backend/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/backend-0.1.0.jar"]
