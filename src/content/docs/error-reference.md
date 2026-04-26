# Error Reference

A complete list of errors Crank can return, what causes them, and how to fix them.

## Configuration Errors

These errors occur when calling `crank.New()`, `crank.QuickStart()`, or loading a YAML config.

### `crank: no broker configured`

**Message:** `crank: no broker configured; use WithBroker("redis"|"nats"|"pgsql") or WithCustomBroker()`

**Cause:** Neither `WithBroker()` nor `WithCustomBroker()` was provided to `crank.New()`.

**Fix:** Add a broker option:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
)
```

### `config: "broker" field is required`

**Message:** `config: "broker" field is required (use redis, nats, or pgsql)`

**Cause:** The YAML config file is missing the `broker` field or it's empty.

**Fix:** Add the `broker` field to your YAML config:

```yaml
broker: redis
```

### `redis.url is empty`

**Message:** `config: broker is "redis" but redis.url (or REDIS_URL env) is empty`

**Cause:** Broker is set to `"redis"` but no URL was provided. Crank checks `redis.url` in YAML first, then the `REDIS_URL` environment variable.

**Fix:** Either set the URL in your config:

```yaml
broker: redis
redis:
  url: redis://localhost:6379/0
```

Or set the environment variable:

```bash
export REDIS_URL=redis://localhost:6379/0
```

### `nats.url is empty`

**Message:** `config: broker is "nats" but nats.url (or NATS_URL env) is empty`

**Cause:** Same as above, but for NATS. Set `nats.url` in YAML or `NATS_URL` env.

### `broker not yet implemented`

**Message:** `config: broker "pgsql" is not yet implemented`

**Cause:** The specified broker backend is not yet available.

**Fix:** Use `"redis"` or provide a custom broker via `WithCustomBroker()`.

### `unknown broker`

**Message:** `config: unknown broker "kafka" (use redis, nats, or pgsql)`

**Cause:** An unrecognized broker name was specified.

**Fix:** Use one of the supported values: `redis`, `nats`, `pgsql`, or use `WithCustomBroker()`.

### `unsupported broker` (programmatic)

**Message:** `broker: unsupported broker "kafka" (use redis, nats, or pgsql)`

**Cause:** Same as above, but triggered via `crank.New()` with `WithBroker()` instead of YAML config.

---

## Connection Errors

These errors occur when the broker can't be reached.

### `Redis URL is empty`

**Message:** `broker not available: Redis URL is empty (set redis.url in config or REDIS_URL)`

**Cause:** An empty URL was passed to the Redis broker constructor.

**Fix:** Provide a valid Redis connection string.

### `invalid Redis URL`

**Message:** `broker not available: invalid Redis URL <redacted-url>: <details>`

**Cause:** The Redis URL can't be parsed. Common issues: missing scheme, typos, invalid port. Credentials in the URL are automatically redacted in the error message.

**Fix:** Use a valid Redis URL format: `redis://host:port/db` or `rediss://host:port/db` for TLS.

### `Redis unreachable`

**Message:** `broker not available: Redis unreachable: <details>`

**Cause:** Crank connected to Redis but the PING failed. Redis may be down, the port may be wrong, or authentication may be required. The host address is not included in the error message to prevent leaking internal network topology.

**Fix:** Verify Redis is running and the connection string is correct. Check firewall rules and authentication.

### `UseTLS scheme mismatch`

**Message:** `broker: UseTLS is true but URL scheme is not redis:// or rediss://; provide a redis:// or rediss:// URL`

**Cause:** `WithTLS(true)` was set but the URL uses a non-standard scheme (e.g. bare hostname, `unix://`). Crank cannot safely upgrade the connection to TLS without a recognized scheme.

**Fix:** Use a `redis://` or `rediss://` URL. For TLS, `rediss://` is preferred.

---

## Engine Lifecycle Errors

### `engine already started`

**Message:** `engine already started`

**Cause:** `engine.Start()` was called more than once.

**Fix:** Only call `Start()` once. Use a sync primitive if starting from multiple goroutines.

### `Use must be called before Start`

**Message:** `Use must be called before Start`

**Cause:** `engine.Use(middleware)` was called after `engine.Start()`.

**Fix:** Register all middleware before starting the engine:

```go
engine.Use(myMiddleware)
engine.Start() // middleware must be added before this
```

### `SetMetricsHandler must be called before Start`

**Message:** `SetMetricsHandler must be called before Start`

**Cause:** `engine.SetMetricsHandler(h)` was called after `engine.Start()`.

**Fix:** Set the metrics handler before starting:

```go
engine.SetMetricsHandler(&MyMetrics{})
engine.Start()
```

---

## Worker Errors

### `worker not found`

**Message:** `worker not found for "MyWorker": worker class 'MyWorker' not found`

**Cause:** A job was dequeued for a worker class that hasn't been registered.

**Fix:** Register the worker before starting the engine:

```go
engine.Register("MyWorker", MyWorker{})
```

---

## Enqueue Errors

### `failed to enqueue job`

**Message:** `failed to enqueue job: <details>`

**Cause:** The broker rejected the enqueue operation. The wrapped error has specifics — typically a Redis connection error, a closed broker, or a validation failure.

**Fix:** Check that the broker is running and the connection is healthy. If the error wraps a validation message, see the validation errors section below.

### `invalid queue name`

**Message:** `failed to enqueue job: invalid queue name "...": must match [A-Za-z0-9_-]{1,128}`

**Cause:** The queue name contains invalid characters, is empty, or exceeds 128 characters. Queue names are validated at enqueue time.

**Fix:** Use only alphanumeric characters, underscores, and hyphens. Keep the name under 128 characters.

### `worker class must not be empty`

**Message:** `failed to enqueue job: worker class must not be empty`

**Cause:** An empty string was passed as the worker class name.

**Fix:** Provide a non-empty worker class name that matches a registered worker.

### `global client not initialized`

**Message:** `global client not initialized. Call SetGlobalClient first`

**Cause:** `crank.Enqueue()` or `crank.EnqueueWithOptions()` was called without first setting the global client.

**Fix:** Call `crank.SetGlobalClient(client)` after creating the client, or use `crank.QuickStart()` which does this automatically:

```go
engine, client, err := crank.New(...)
crank.SetGlobalClient(client)

// Now this works
crank.Enqueue(ctx, "MyWorker", "default", args...)
```

### `broker closed`

**Message:** `broker closed`

**Cause:** A job was enqueued after the broker was closed (e.g., after `engine.Stop()`).

**Fix:** Don't enqueue jobs after stopping the engine.

---

## Validation Errors

These errors occur when a job fails validation before being dispatched to a worker. The job follows the normal retry/dead-letter path.

### `job args count exceeds max`

**Message:** `job args count 10 exceeds max 5`

**Cause:** The job has more arguments than the `MaxArgsCount` validator allows.

**Fix:** Reduce the number of arguments, or increase the limit:

```go
crank.SetValidator(crank.MaxArgsCount(10))
```

### `job class not in allowlist`

**Message:** `job class 'DangerousWorker' not in allowlist`

**Cause:** The job class is not in the configured `ClassAllowlist`.

**Fix:** Add the worker class to the allowlist:

```go
crank.SetValidator(crank.ClassAllowlist(map[string]bool{
    "EmailWorker": true,
    "DangerousWorker": true,
}))
```

### `job class does not match allowed pattern`

**Message:** `job class 'bad-worker' does not match allowed pattern`

**Cause:** The job class name doesn't match the regex set by `ClassPattern`.

**Fix:** Rename the worker class to match the pattern, or adjust the pattern.

### `job payload size exceeds max`

**Message:** `job payload size 2048 exceeds max 1024 bytes`

**Cause:** The serialized job exceeds the `MaxPayloadSize` limit. For dequeued jobs, the original broker bytes are measured to avoid re-serialization artifacts.

**Fix:** Reduce the size of job arguments, or increase the limit:

```go
engine.SetValidator(crank.MaxPayloadSize(4096))
```

### `job metadata size exceeds max`

**Message:** `job metadata size 1024 exceeds max 512 bytes`

**Cause:** The serialized `Metadata` field exceeds the `MaxMetadataSize` limit.

**Fix:** Reduce the metadata size, or increase the limit:

```go
engine.SetValidator(crank.ChainValidator{
    crank.MaxPayloadSize(4096),
    crank.MaxMetadataSize(1024),
})
```

---

## Runtime Errors

### `circuit breaker is open`

**Message:** `circuit breaker is open`

**Cause:** A worker class has failed too many times within the configured window. The circuit breaker temporarily blocks new jobs of that class.

**Fix:** This is expected behavior. The circuit breaker will automatically transition to half-open after the reset timeout and allow a probe job through. If the probe succeeds, the circuit closes. Fix the underlying cause of worker failures to prevent the circuit from opening.

### `panic in job`

**Message:** `panic in job <jid> [<class>]: recovered (see logs for stack trace)`

**Cause:** A worker panicked during execution. `RecoveryMiddleware` caught the panic and converted it to an error. The raw panic value is not included in the error message to prevent leaking sensitive data — check the structured logs for a truncated stack trace.

**Fix:** Fix the panic in your worker code. The job will follow the normal retry/dead-letter path.
