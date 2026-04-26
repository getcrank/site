# Advanced Topics

This covers Crank's advanced features: validation, redaction, circuit breaker, metrics, and job statistics.

## Validation

Validation enforces constraints on jobs at two points: at **enqueue time** (before the job reaches the broker) and at **execution time** (before worker dispatch). Queue names and worker class names are always validated at enqueue time. Custom validators run at both boundaries.

### Setting a Validator

Validators can be scoped to a single engine or set globally:

```go
// Engine-scoped (recommended for multi-engine processes)
engine.SetValidator(validator)
```

### Built-in Validators

```go
crank.MaxArgsCount(5)                          // max number of args
crank.ClassAllowlist(map[string]bool{          // whitelist job classes
    "EmailWorker": true,
    "ReportWorker": true,
})
crank.ClassPattern(regexp.MustCompile(`^[A-Za-z]+Worker$`))  // regex pattern
crank.MaxPayloadSize(1024)                     // max serialized job size in bytes
crank.MaxMetadataSize(512)                     // max serialized metadata size in bytes
crank.SafeClassPattern()                       // convenience: ^[A-Za-z0-9_]+$
crank.ValidateQueueName("my-queue")            // validate queue name format
```

`MaxPayloadSize` uses the original broker bytes (`RawPayload`) when available to avoid re-serialization artifacts. `MaxMetadataSize` is a separate check to prevent jobs with small args but oversized metadata from bypassing payload limits.

### Queue Name Validation

Queue names are validated automatically at enqueue time. They must match `[A-Za-z0-9_-]{1,128}`. Invalid names are rejected immediately with a clear error — they never reach the broker.

### Composing Validators

Use `ChainValidator` to apply multiple validators in sequence:

```go
validators := crank.ChainValidator{
    crank.MaxArgsCount(5),
    crank.SafeClassPattern(),
    crank.MaxPayloadSize(4096),
    crank.MaxMetadataSize(512),
}
engine.SetValidator(validators)
```

The first validator to return an error stops the chain. Validation failures trigger the normal retry/dead-letter path — the job is not dispatched to a worker.

---

## Redaction

Redaction controls how job arguments are logged when jobs fail. The logging middleware uses the current redactor to produce a safe representation of `job.Args`.

### Setting a Redactor

Redactors can be scoped to a single engine or set globally:

```go
// Engine-scoped (recommended for multi-engine processes)
engine.SetRedactor(redactor)

// Process-global (affects all engines without an engine-scoped redactor)
// Deprecated: prefer engine.SetRedactor for isolation.
crank.SetRedactor(redactor)
```

When `nil` is passed, it reverts to the built-in default (`MaskingRedactor`).

### Built-in Redactors

- **MaskingRedactor** (default) — replaces all args with `[REDACTED xN]`. Safe for production.
- **FieldMaskingRedactor** — masks specific map keys while leaving others visible. Non-map arguments are replaced with `[REDACTED non-map arg]` to prevent accidental leakage of bare string secrets.
- **DebugRedactor** — logs raw args via `fmt.Sprintf`. **Unsafe for production** — exposes all job arguments including passwords, tokens, and PII. Use only for local debugging.

> `NoopRedactor` is a deprecated alias for `DebugRedactor`. Prefer `MaskingRedactor` (default) or `FieldMaskingRedactor` in production.

### Field-Level Redaction

```go
redactor := crank.NewFieldMaskingRedactor([]string{
    "password",
    "secret",
    "token",
})
engine.SetRedactor(redactor)
```

When a job fails and `LoggingMiddleware` runs, map arguments with matching keys (case-insensitive) will be replaced with `[REDACTED]`. Non-map arguments (bare strings, numbers) are always replaced with `[REDACTED non-map arg]` regardless of the key list — this prevents secrets passed as plain arguments from leaking through the redactor.

---

## Circuit Breaker

The circuit breaker prevents cascading failures by temporarily halting processing of a repeatedly failing job class.

### How It Works

The circuit breaker tracks failures per job class within a sliding time window:

- **Closed** (normal): jobs execute normally. Failures are counted.
- **Open** (blocked): when failures reach the threshold within the window, the circuit opens. Jobs of that class are temporarily requeued.
- **Half-Open** (probing): after the reset timeout, one job is allowed through as a probe. Success closes the circuit; failure reopens it.

### Configuration

```go
breaker := crank.NewCircuitBreaker(crank.BreakerConfig{
    FailureThreshold: 5,               // failures to trigger open (default: 5)
    Window:           1 * time.Minute,  // sliding window (default: 1 min)
    ResetTimeout:     60 * time.Second, // cool-down before half-open (default: 60s)
})
```

The circuit breaker is built into the engine — it's wired automatically via `BreakerMiddleware` and consulted by the fetcher.

### Memory Protection

The circuit breaker tracks up to 10,000 unique job classes. When the map reaches capacity, entries are evicted in priority order: closed entries with no failures first, then any closed entry, then the oldest open entry. If the map is completely full with no evictable entries, new classes are denied (treated as open circuits) to prevent unbounded memory growth. The `failureTimes` slice per entry is also capped to prevent per-class memory exhaustion.

### Inspecting State

```go
breaker.IsOpen("EmailWorker")  // true if circuit is currently open
breaker.Allow("EmailWorker")   // true if job class can execute
```

---

## Metrics

### Job Events

The engine emits events during job processing:

```go
type EventType int

const (
    EventJobStarted
    EventJobSucceeded
    EventJobFailed
    EventJobRetryScheduled
    EventJobMovedToDead
)

type JobEvent struct {
    Type     EventType
    Job      *Job
    Queue    string
    Duration time.Duration
    Err      error
}
```

### Metrics Handler

Implement `MetricsHandler` to receive job events:

```go
type MetricsHandler interface {
    HandleJobEvent(ctx context.Context, event JobEvent)
}
```

Set it on the engine before calling `Start()`:

```go
engine.SetMetricsHandler(&PrometheusMetrics{})
```

**Example implementation:**

```go
type PrometheusMetrics struct {
    // your counters / histograms
}

func (p *PrometheusMetrics) HandleJobEvent(ctx context.Context, event crank.JobEvent) {
    switch event.Type {
    case crank.EventJobStarted:
        // increment in-flight counter
    case crank.EventJobSucceeded:
        // record latency and success count
    case crank.EventJobFailed:
        // record failure count
    case crank.EventJobRetryScheduled:
        // track retries
    case crank.EventJobMovedToDead:
        // track dead-letter promotions
    }
}
```

### Queue Statistics

Use `engine.Stats()` for aggregate statistics:

```go
stats, err := engine.Stats()
fmt.Printf("Processed: %d\n", stats.Processed)
fmt.Printf("Failed: %d\n", stats.Failed)
fmt.Printf("Retry: %d\n", stats.Retry)
fmt.Printf("Dead: %d\n", stats.Dead)
fmt.Printf("Queue sizes: %v\n", stats.Queues)
```

---

## Lifecycle Logging

When a logger is provided via `WithLogger()`, Crank logs structured events at each stage of a job's lifecycle:

| Event | Level | Fields | When |
|-------|-------|--------|------|
| `job enqueued` | Info | jid, class, queue | Job pushed to broker |
| `job dequeued` | Info | jid, class, queue | Job fetched by processor |
| `job processed` | Info | jid, class, queue, dur | Worker returned nil |
| `job failed` | Error | jid, class, queue, err, dur | Worker returned error |
| `job exceeded max retries, moving to dead queue` | Warn | jid, class, queue, retries | Retries exhausted |

All fields use structured key-value pairs compatible with `slog` and similar loggers. See [Configuration](/docs/configuration) for the `Logger` interface.

---

## Error Handling Patterns

- **Errors are returned, not panicked** — validators, redactors, and broker operations return errors; the engine converts them into job-level failures with retries and dead-lettering.
- **Panics are sanitized** — `RecoveryMiddleware` catches panics in workers and converts them to errors. Stack traces are capped at 4KB to reduce the risk of leaking sensitive in-scope variables. The raw panic value is not included in the returned error or log output to prevent sensitive data from bypassing the redactor.
- **Circuit breaker containment** — when a job class fails repeatedly, its circuit opens and the fetcher temporarily stops processing jobs of that class, protecting downstream systems while other classes continue.
- **Credential protection** — Redis URLs containing passwords are automatically redacted in error messages. Internal network topology (hostnames, ports) is not exposed in connection errors.
