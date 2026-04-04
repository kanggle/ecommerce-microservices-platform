# Skill: Exception Handling

Patterns for exception classes and global error handling in Spring Boot services.

Prerequisite: read `specs/platform/error-handling.md` before using this skill.

---

## Exception Class Pattern

Extend `RuntimeException`. Use a descriptive message. Place in `application/exception/`.

```java
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found: " + id);
    }
}
```

**Rules:**
- One exception class per distinct error condition.
- Do not use generic `RuntimeException` or `IllegalStateException` for business errors.
- Exception messages are for logs, not for API responses — the handler maps them to error codes.

---

## Global Exception Handler

Each service has a `@RestControllerAdvice` in `presentation/advice/`.

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return ErrorResponse.of("VALIDATION_ERROR", message.isEmpty() ? "Validation failed" : message);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return ErrorResponse.of("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred");
    }
}
```

---

## ErrorResponse (Shared)

Use the shared `ErrorResponse` record from `libs/java-web`:

```java
public record ErrorResponse(String code, String message, String timestamp) {
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, Instant.now().toString());
    }
}
```

---

## Handler Ordering

Order handlers from most specific to least specific:

1. Business exceptions (`InvalidCredentialsException`, `ResourceNotFoundException`)
2. Validation exceptions (`MethodArgumentNotValidException`, `ConstraintViolationException`)
3. Security exceptions (`AccessDeniedException`, `AuthenticationException`)
4. Catch-all (`Exception`)

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Returning exception message directly in response | Map to an error code; use `ErrorResponse.of()` |
| Logging at WARN for unexpected errors | Use `log.error()` with the full stack trace |
| Catching and re-throwing with `new RuntimeException(e)` | Let the global handler catch the original exception |
| Missing handler for validation errors | Always handle `MethodArgumentNotValidException` |
| Exposing internal details (stack trace, SQL) in response | Return only error code and safe message |
