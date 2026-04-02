# Middleware

Crank provides a middleware chain that wraps job execution. Built-in middleware handles recovery, logging, and circuit breaking. You can add your own.

## Types

```go
type Handler func(ctx context.Context, job *Job) error
type Middleware func(next Handler) Handler
```

## Built-in Middleware

These are already wired into the engine's chain:

- **RecoveryMiddleware** — catches panics in workers, logs the stack trace, and converts them to errors
- **LoggingMiddleware** — logs failed jobs with redacted args (see [Advanced](/docs/advanced))
- **BreakerMiddleware** — records success/failure per job class for the circuit breaker

## Adding Custom Middleware

Use `engine.Use()` before calling `Start()`:

```go
engine.Use(func(next crank.Handler) crank.Handler {
    return func(ctx context.Context, job *crank.Job) error {
        start := time.Now()
        err := next(ctx, job)
        duration := time.Since(start)

        metrics.RecordJobDuration(job.Class, duration)
        if err != nil {
            metrics.IncrementJobFailure(job.Class)
        }
        return err
    }
})
```

## Registering Multiple Middleware

`engine.Use()` accepts multiple middleware in a single call:

```go
engine.Use(loggingMiddleware, metricsMiddleware, rateLimitMiddleware)
```

This is equivalent to calling `engine.Use()` separately for each one. You can mix both styles freely:

```go
engine.Use(loggingMiddleware, metricsMiddleware)
engine.Use(rateLimitMiddleware)
```

## Middleware Order

Middleware executes in the order it is added. The first middleware added is the outermost wrapper:

```go
engine.Use(loggingMiddleware)    // runs first
engine.Use(metricsMiddleware)    // runs second
engine.Use(rateLimitMiddleware)  // runs third (closest to the worker)
```

**Important:** `engine.Use()` must be called before `engine.Start()`.
