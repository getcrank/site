# Queues

Crank supports named queues with configurable weights. Higher weight means more frequent polling, allowing you to route critical jobs to fast lanes.

## Defining Queues

Pass queue options when creating the engine:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithQueues(
        crank.QueueOption{Name: "critical", Weight: 5},
        crank.QueueOption{Name: "default", Weight: 3},
        crank.QueueOption{Name: "low", Weight: 1},
    ),
)
```

If no queues are specified, a single queue named `"default"` with weight `1` is created.

## How Weights Work

Weights determine how often a queue is polled relative to others. In the example above:

- `critical` is polled **5x** as often as `low`
- `default` is polled **3x** as often as `low`

This ensures high-priority jobs are picked up first without starving lower-priority queues.

## Enqueuing to a Specific Queue

Specify the queue name when enqueuing:

```go
// High priority
jid, err := client.Enqueue(ctx,"PaymentWorker", "critical", paymentID)

// Normal priority
jid, err := client.Enqueue(ctx,"EmailWorker", "default", userID)

// Low priority
jid, err := client.Enqueue(ctx,"CleanupWorker", "low", batchID)
```

## YAML Configuration

Queues can also be defined in a YAML config file when using `QuickStart`:

```yaml
queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]
```

See [Configuration](/docs/configuration) for the full YAML format.
