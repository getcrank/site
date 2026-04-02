# Getting Started

Crank is a background job processing SDK built for Go. It gives you named queues, concurrent workers, middleware, retries, and observability — all in one package.

## Installation

```bash
go get github.com/getcrank/crank
```

## Quick Start

Create an engine, register a worker, and start processing:

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/getcrank/crank"
)

type EmailWorker struct{}

func (w EmailWorker) Perform(ctx context.Context, args ...interface{}) error {
    userID, ok := args[0].(string)
    if !ok {
        return fmt.Errorf("expected userID as string, got %T", args[0])
    }
    return sendEmail(ctx, userID)
}

func main() {
    engine, client, err := crank.New("redis://localhost:6379/0",
        crank.WithConcurrency(10),
        crank.WithQueues(crank.QueueOption{Name: "default", Weight: 1}),
    )
    if err != nil {
        log.Fatalf("New: %v", err)
    }

    crank.SetGlobalClient(client)
    engine.Register("EmailWorker", EmailWorker{})

    if err := engine.Start(); err != nil {
        log.Fatalf("Start: %v", err)
    }
    defer engine.Stop()

    // Enqueue a job
    jid, err := client.Enqueue("EmailWorker", "default", "user-123")
    if err != nil {
        log.Printf("enqueue failed: %v", err)
    }
    fmt.Println("Enqueued job:", jid)
}
```

## Quick Start with YAML

Alternatively, use `QuickStart` to load configuration from a YAML file. This also calls `SetGlobalClient` automatically:

```go
engine, client, err := crank.QuickStart("config/crank.yml")
if err != nil {
    log.Fatalf("QuickStart: %v", err)
}

engine.RegisterMany(map[string]crank.Worker{
    "EmailWorker":  EmailWorker{},
    "ReportWorker": ReportWorker{},
})

if err := engine.Start(); err != nil {
    log.Fatalf("Start: %v", err)
}
defer engine.Stop()
```

See [Configuration](/docs/configuration) for the full YAML format.

## Enqueuing Jobs

You can enqueue jobs directly using the client returned from `crank.New()`:

```go
jid, err := client.Enqueue("EmailWorker", "default", "user-123")
```

Or, if you've called `crank.SetGlobalClient(client)` (which `QuickStart` does automatically), you can enqueue from anywhere without passing the client around:

```go
jid, err := crank.Enqueue("EmailWorker", "default", "user-123")
```

Both return a job ID (string) and an error. Jobs are serialized and pushed to the broker for processing by the next available worker.

## What's Next

- [Queues](/docs/queues) — weighted queue configuration
- [Workers](/docs/workers) — worker interface and registration
- [Configuration](/docs/configuration) — YAML config with QuickStart
