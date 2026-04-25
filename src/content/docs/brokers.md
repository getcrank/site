# Brokers

Crank uses a broker to manage job storage and delivery. A broker must be specified explicitly — there is no default.

## Redis (Built-in)

Redis is supported natively. Pass a Redis connection string when creating the engine using `WithBroker("redis")`:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
)
```

### Redis Options

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithRedisTimeout(5 * time.Second),
    crank.WithTLS(true),
    crank.WithTLSInsecureSkipVerify(false),
)
```

### Redis via YAML

```yaml
broker: redis
redis:
  url: redis://localhost:6379/0
  network_timeout: 5
  use_tls: false
  tls_insecure_skip_verify: false
```

The `redis.url` field can also be set via the `REDIS_URL` environment variable.

## Custom Brokers

You can provide your own broker implementation via `WithCustomBroker()`. Implement the `crank.Broker` interface:

```go
type Broker interface {
    Enqueue(ctx context.Context, queue string, job *Job) error
    Dequeue(queues []string, timeout time.Duration) (*Job, string, error)
    Ack(job *Job) error
    ReapOrphanedJobs(lease time.Duration) ([]*Job, error)
    AddToRetry(job *Job, retryAt time.Time) error
    GetRetryJobs(limit int64) ([]*Job, error)
    RemoveFromRetry(job *Job) error
    AddToDead(job *Job) error
    GetQueueSize(queue string) (int64, error)
    DeleteKey(key string) error
    RecordSuccess(job *Job) error
    RecordFailure(job *Job) error
    GetStats() (map[string]interface{}, error)
    Close() error
}
```

Connect to your backend, then pass the broker when creating the engine:

```go
myBroker, err := mypackage.NewPostgresBroker("postgres://localhost:5432/jobs")
if err != nil {
    log.Fatal(err)
}

engine, client, err := crank.New("",
    crank.WithCustomBroker(myBroker),
)
```

You handle your own connection setup. Crank uses the broker as-is — `WithBroker` is not needed when `WithCustomBroker` is provided.

## Broker Selection

When using `QuickStart` with a YAML config, the `broker` field is required:

```yaml
broker: redis   # currently supported
# broker: nats  # coming soon
```

See [Configuration](/docs/configuration) for the full YAML format.

## Coming Soon

We're actively working on additional broker support. See [Coming Features](/docs/coming-features) for details on NATS and other planned backends.
