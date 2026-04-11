# Advanced Topics

This covers Crank's advanced features: validation, redaction, circuit breaker, metrics, and job statistics.

## Validation

Validation enforces constraints on jobs before they are executed. The processor consults the global validator (if set) before worker lookup.

### Setting a Validator

```go
crank.SetValidator(validator)
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
crank.SafeClassPattern()                       // convenience: ^[A-Za-z0-9_]+$
```

### Composing Validators

Use `ChainValidator` to apply multiple validators in sequence:

```go
validators := crank.ChainValidator{
    crank.MaxArgsCount(5),
    crank.SafeClassPattern(),
}
crank.SetValidator(validators)
```

The first validator to return an error stops the chain. Validation failures trigger the normal retry/dead-letter path — the job is not dispatched to a worker.

---

## Redaction

Redaction controls how job arguments are logged when jobs fail. The logging middleware uses the current redactor to produce a safe representation of `job.Args`.

### Setting a Redactor

```go
crank.SetRedactor(redactor)
```

When `nil` is passed, it reverts to the built-in default (`MaskingRedactor`).

### Built-in Redactors

- **NoopRedactor** — logs raw args via `fmt.Sprintf`. Use only in trusted environments.
- **MaskingRedactor** (default) — replaces all args with `[REDACTED xN]`.
- **FieldMaskingRedactor** — masks specific map keys while leaving others visible.

### Field-Level Redaction

```go
redactor := crank.NewFieldMaskingRedactor([]string{
    "password",
    "secret",
    "token",
})
crank.SetRedactor(redactor)
```

When a job fails and `LoggingMiddleware` runs, map arguments with matching keys (case-insensitive) will be replaced with `[REDACTED]`.

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
- **Panics are localized** — `RecoveryMiddleware` catches panics in workers and converts them to errors. Metrics handler panics are caught and logged without stopping the engine.
- **Circuit breaker containment** — when a job class fails repeatedly, its circuit opens and the fetcher temporarily stops processing jobs of that class, protecting downstream systems while other classes continue.
