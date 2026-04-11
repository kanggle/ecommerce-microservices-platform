# Skill: Docker Build

Patterns for building Docker images in this repository.

Prerequisite: read `specs/platform/deployment-policy.md` before using this skill.

---

## Multi-Stage Build (Backend)

```dockerfile
# Stage 1: OpenTelemetry agent
FROM eclipse-temurin:21-jre-alpine AS otel
ARG OTEL_VERSION=2.12.0
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_VERSION}/opentelemetry-javaagent.jar /otel/opentelemetry-javaagent.jar

# Stage 2: Extract Spring Boot layers
FROM eclipse-temurin:21-jre-alpine AS layers
WORKDIR /app
COPY apps/{service}/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: Final image
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=otel /otel/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar
COPY --from=layers /app/dependencies ./
COPY --from=layers /app/spring-boot-loader ./
COPY --from=layers /app/snapshot-dependencies ./
COPY --from=layers /app/application ./
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8081/actuator/health || exit 1
ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-XX:MaxRAMPercentage=75.0", "org.springframework.boot.loader.launch.JarLauncher"]
```

---

## Frontend Build (Next.js)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/{app}/package.json apps/{app}/
COPY packages/*/package.json packages/*/
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter {app} build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/{app}/.next/standalone ./
COPY --from=builder /app/apps/{app}/.next/static ./apps/{app}/.next/static
COPY --from=builder /app/apps/{app}/public ./apps/{app}/public
EXPOSE 3000
CMD ["node", "apps/{app}/server.js"]
```

---

## Key Patterns

### Spring Boot Layer Extraction

Layer extraction enables efficient Docker layer caching:

```
dependencies/          ← rarely changes (cached)
spring-boot-loader/    ← rarely changes (cached)
snapshot-dependencies/ ← changes occasionally
application/           ← changes every build
```

### Non-Root User

Always run as non-root:

```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8081/actuator/health || exit 1
```

### JVM Memory

```
-XX:MaxRAMPercentage=75.0
```

Uses 75% of container memory limit. Set memory limits in Docker Compose or Kubernetes.

---

## Docker Compose Build

```yaml
services:
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Running as root | Always use `USER appuser` |
| No health check | Add `HEALTHCHECK` for orchestrator readiness |
| COPY entire project in one layer | Use multi-stage + layer extraction for caching |
| No memory limit | Set `-XX:MaxRAMPercentage` + container memory limit |
| Missing `.dockerignore` | Exclude `build/`, `node_modules/`, `.git/` |
