# Coming Features

Features we're actively working on or planning for future releases.

## NATS Broker

NATS JetStream support is currently in development. This will allow Crank to operate over NATS for use cases where Redis is not available or where NATS is already part of your infrastructure.

The configuration shape is already defined:

```yaml
broker: nats
nats:
  url: nats://localhost:4222
  timeout: 5
```

The `NATS_URL` environment variable will be supported as a fallback.


## Dead Job Management

Currently, dead jobs (those that exhaust all retries) can be inspected via `engine.Stats()` and `TestBroker.DeadJobs()`. We plan to add a public client API for:

- Listing dead jobs with pagination
- Retrying specific dead jobs
- Clearing the dead set

## Job Discarding

A `DiscardError` type that lets workers signal a job should be permanently discarded without retrying:

```go
func (w MyWorker) Perform(ctx context.Context, args ...interface{}) error {
    if invalidInput(args) {
        return crank.DiscardError("invalid input, skipping")
    }
    return process(ctx, args)
}
```

## Web Dashboard

A web-based UI for monitoring queues, inspecting jobs, and managing the dead set — similar to Sidekiq's web interface.

## Scheduled Jobs

Support for enqueuing jobs to run at a specific time in the future:

```go
client.EnqueueAt(time.Now().Add(1*time.Hour), "ReportWorker", "default", reportID)
client.EnqueueIn(30*time.Minute, "CleanupWorker", "low", batchID)
```

## Unique Jobs

Deduplication support to prevent the same job from being enqueued multiple times within a configurable window.
