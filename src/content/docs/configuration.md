# Configuration

Crank can be configured programmatically with functional options or from a YAML file using `QuickStart`.

## Programmatic Configuration

Pass options to `crank.New()`:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithConcurrency(20),
    crank.WithTimeout(15 * time.Second),
    crank.WithQueues(
        crank.QueueOption{Name: "critical", Weight: 5},
        crank.QueueOption{Name: "default", Weight: 3},
    ),
    crank.WithRetryPollInterval(10 * time.Second),
    crank.WithLogger(myLogger),
)
```

### Available Options

| Option | Default | Description |
|--------|---------|-------------|
| `WithBroker(kind)` | **required** | Broker type: `"redis"`, `"nats"`, `"pgsql"` |
| `WithCustomBroker(b)` | — | Use a custom `Broker` implementation |
| `WithConcurrency(n)` | 10 | Number of worker goroutines (max 10000) |
| `WithTimeout(d)` | 8s | Per-job execution timeout |
| `WithQueues(qs...)` | `default:1` | Queue names and weights |
| `WithRetryPollInterval(d)` | 5s | How often to check the retry set |
| `WithLogger(l)` | noop | Custom logger implementation |
| `WithRedisTimeout(d)` | 5s | Redis connection timeout |
| `WithTLS(bool)` | false | Enable TLS for Redis |
| `WithTLSInsecureSkipVerify(bool)` | false | Skip TLS cert verification |

Either `WithBroker` or `WithCustomBroker` must be provided. Omitting both returns an error.

## YAML Configuration with QuickStart

`QuickStart` loads configuration from a YAML file and creates the engine and client:

```go
engine, client, err := crank.QuickStart("config/crank.yml")
if err != nil {
    log.Fatalf("QuickStart: %v", err)
}
// QuickStart calls SetGlobalClient automatically,
// so crank.Enqueue works from anywhere
engine.RegisterMany(map[string]crank.Worker{
    "EmailWorker":  EmailWorker{},
    "ReportWorker": ReportWorker{},
})
if err := engine.Start(); err != nil {
    log.Fatalf("Start: %v", err)
}
defer engine.Stop()
```

### YAML Structure

**Minimal configuration:**

```yaml
broker: redis
redis:
  url: redis://localhost:6379/0
```

**Full configuration:**

```yaml
broker: redis

concurrency: 20
timeout: 15

queues:
  - [critical, 10]
  - [default, 5]
  - [low, 1]

redis:
  url: redis://localhost:6379/0
  network_timeout: 5
  use_tls: false
  tls_insecure_skip_verify: false
```

### YAML Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `broker` | string | **required** | Backend to use (`redis`, `nats`, `pgsql`) |
| `broker_url` | string | — | Fallback URL when backend URL is empty |
| `concurrency` | int | 10 | Number of concurrent workers |
| `timeout` | int | 8 | Per-job timeout in seconds |
| `queues` | list | `default:1` | Queue definitions |

### Queue Formats

Short form:

```yaml
queues:
  - [critical, 5]
  - [default, 3]
```

Long form:

```yaml
queues:
  - name: critical
    weight: 5
  - name: default
    weight: 3
```

## Environment Variables

When `redis.url` is empty in the YAML config, Crank falls back to the `REDIS_URL` environment variable:

```bash
export REDIS_URL=redis://my-host:6379/0
```

## Custom Logger

Implement the `Logger` interface to integrate with your logging system:

```go
type Logger interface {
    Debug(msg string, args ...any)
    Info(msg string, args ...any)
    Warn(msg string, args ...any)
    Error(msg string, args ...any)
}
```

Pass it via options:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithLogger(myLogger),
)
```

When a logger is provided, Crank logs job lifecycle events: enqueue, dequeue, processed, failed, and dead queue transitions.
