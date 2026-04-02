# Brokers

Crank uses a broker to manage job storage and delivery. Redis is the built-in broker, with more backends planned.

## Redis (Built-in)

Redis is supported natively. Pass a Redis connection string when creating the engine:

```go
engine, client, err := crank.New("redis://localhost:6379/0")
```

The broker type is inferred from the URL scheme. You can also set it explicitly:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
)
```

### Redis Options

```go
engine, client, err := crank.New("redis://localhost:6379/0",
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

## Broker Selection

When using `QuickStart` with a YAML config, set the `broker` field:

```yaml
broker: redis   # currently supported
# broker: nats  # coming soon
```

See [Configuration](/docs/configuration) for the full YAML format.

## Coming Soon

We're actively working on additional broker support. See [Coming Features](/docs/coming-features) for details on NATS and other planned backends.
