#FROM openjdk:17-jdk-alpine
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY *backend*.jar /app/app.jar
COPY start.sh /app/start.sh

RUN addgroup -S spring && adduser -S spring -G spring
RUN chown -R spring:spring /app
RUN chmod 755 /app
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["sh","/app/start.sh"]