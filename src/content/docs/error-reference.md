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

**Message:** `broker not available: invalid Redis URL: <details>`

**Cause:** The Redis URL can't be parsed. Common issues: missing scheme, typos, invalid port.

**Fix:** Use a valid Redis URL format: `redis://host:port/db` or `rediss://host:port/db` for TLS.

### `Redis unreachable`

**Message:** `broker not available: Redis unreachable at "redis://host:6379/0": <details>`

**Cause:** Crank connected to Redis but the PING failed. Redis may be down, the port may be wrong, or authentication may be required.

**Fix:** Verify Redis is running and the connection string is correct. Check firewall rules and authentication.

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

**Cause:** The broker rejected the enqueue operation. The wrapped error has specifics — typically a Redis connection error or a closed broker.

**Fix:** Check that the broker is running and the connection is healthy.

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

**Cause:** The serialized job exceeds the `MaxPayloadSize` limit.

**Fix:** Reduce the size of job arguments, or increase the limit:

```go
crank.SetValidator(crank.MaxPayloadSize(4096))
```

---

## Runtime Errors

### `circuit breaker is open`

**Message:** `circuit breaker is open`

**Cause:** A worker class has failed too many times within the configured window. The circuit breaker temporarily blocks new jobs of that class.

**Fix:** This is expected behavior. The circuit breaker will automatically transition to half-open after the reset timeout and allow a probe job through. If the probe succeeds, the circuit closes. Fix the underlying cause of worker failures to prevent the circuit from opening.

### `panic: <details>`

**Message:** `panic: <value>`

**Cause:** A worker panicked during execution. `RecoveryMiddleware` caught the panic and converted it to an error.

**Fix:** Fix the panic in your worker code. The job will follow the normal retry/dead-letter path.
