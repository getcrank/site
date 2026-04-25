# Testing

Crank provides an in-memory test engine so you can test job processing without a running broker. No Redis required in CI.

## Test Engine

`NewTestEngine` returns an engine, client, and test broker backed by in-memory storage:

```go
engine, client, testBroker, err := crank.NewTestEngine()
if err != nil {
    t.Fatal(err)
}
```

It accepts the same options as `New`:

```go
engine, client, testBroker, err := crank.NewTestEngine(
    crank.WithConcurrency(5),
    crank.WithTimeout(2 * time.Second),
)
```

## Registering and Processing

Register workers and enqueue jobs using the returned client:

```go
func TestEmailWorker(t *testing.T) {
    engine, client, testBroker, err := crank.NewTestEngine()
    if err != nil {
        t.Fatal(err)
    }

    engine.Register("EmailWorker", EmailWorker{})

    jid, err := client.Enqueue(context.Background(), "EmailWorker", "default", "user-123")
    if err != nil {
        t.Fatalf("enqueue failed: %v", err)
    }

    if err := engine.Start(); err != nil {
        t.Fatal(err)
    }
    defer engine.Stop()

    // Give the worker time to process
    time.Sleep(100 * time.Millisecond)

    deadJobs := testBroker.DeadJobs()
    if len(deadJobs) != 0 {
        t.Errorf("expected 0 dead jobs, got %d", len(deadJobs))
    }
}
```

## Inspecting Job State

The `TestBroker` provides methods to inspect job state:

```go
testBroker.DeadJobs()   // jobs that exhausted all retries
testBroker.RetryJobs()  // jobs scheduled for retry
```

For aggregate statistics, use `engine.Stats()`:

```go
stats, err := engine.Stats()
fmt.Printf("Processed: %d\n", stats.Processed)
fmt.Printf("Failed: %d\n", stats.Failed)
fmt.Printf("Retry: %d\n", stats.Retry)
fmt.Printf("Dead: %d\n", stats.Dead)
fmt.Printf("Queue sizes: %v\n", stats.Queues)
```

## Testing Middleware

Middleware is applied in the test engine exactly as in production. Add middleware before starting:

```go
engine, client, testBroker, _ := crank.NewTestEngine()
engine.Use(myMiddleware)
engine.Register("Worker", MyWorker{})

if err := engine.Start(); err != nil {
    t.Fatal(err)
}
defer engine.Stop()
```
