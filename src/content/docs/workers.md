# Workers

Workers are the units of work in Crank. Each worker implements a simple interface and is registered with the engine under a unique name.

## Worker Interface

```go
type Worker interface {
    Perform(ctx context.Context, args ...interface{}) error
}
```

- **ctx**: per-job context with a timeout set by the engine configuration. Workers should respect cancellation and deadlines.
- **args**: the variadic arguments passed when the job was enqueued.
- **Return**: `nil` for success. A non-nil `error` triggers retry or moves the job to the dead queue depending on the retry count.

## Implementing a Worker

```go
type EmailWorker struct{}

func (w EmailWorker) Perform(ctx context.Context, args ...interface{}) error {
    if len(args) < 1 {
        return fmt.Errorf("missing userID argument")
    }
    userID, ok := args[0].(string)
    if !ok {
        return fmt.Errorf("expected userID as string, got %T", args[0])
    }
    return sendEmail(ctx, userID)
}
```

## Registering Workers

Register a single worker:

```go
engine.Register("EmailWorker", EmailWorker{})
```

Register multiple workers at once with `RegisterMany`:

```go
engine.RegisterMany(map[string]crank.Worker{
    "EmailWorker":   EmailWorker{},
    "ReportWorker":  ReportWorker{},
    "CleanupWorker": CleanupWorker{},
})
```

Each worker name must be unique. The name is used when enqueuing jobs to route them to the correct handler.

## Global Worker Registry

For cases where you don't hold a reference to the engine (e.g. in libraries), you can use the global worker registry:

```go
crank.RegisterWorker("EmailWorker", EmailWorker{})
crank.ListWorkers() // returns registered worker names
```

The engine first looks up workers in its own registry. If not found, it falls back to the global registry. Prefer engine-local registration for most applications.

## Concurrency

Control how many jobs are processed simultaneously:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithConcurrency(20),
)
```

The default concurrency is `10`, with a maximum of `10000`. Crank runs each job in its own goroutine, up to the concurrency limit.

## Job Timeout

Set a per-job execution timeout:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithTimeout(15 * time.Second),
)
```

The default timeout is `8` seconds. The context passed to `Perform` will be cancelled when the timeout expires.
