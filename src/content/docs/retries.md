# Retries

Crank supports automatic retries with exponential backoff. Jobs that exhaust their retry count are moved to a dead set for inspection.

## Default Behavior

By default, each job gets `5` retry attempts (configurable up to a maximum of `25`). When a worker returns an error, the job is scheduled for retry.

## Configuring Retries Per Job

Override the retry count when enqueuing with `EnqueueWithOptions`:

```go
retries := 10
opts := &crank.JobOptions{Retry: &retries}
jid, err := client.EnqueueWithOptions(ctx, "ReportWorker", "default", opts, 2024, "q1")
```

## Backoff Strategy

Crank uses exponential backoff based on the retry count:

```
delay = 2^retry_count seconds
```

The delay is capped at `2^30` seconds (~34 years), ensuring retries don't overflow. Early retries happen quickly (2s, 4s, 8s, 16s...) while later retries space out significantly.

## Retry Poll Interval

The engine periodically checks the retry set for jobs that are ready to be re-enqueued. Configure the poll interval:

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithRetryPollInterval(10 * time.Second),
)
```

The default interval is `5` seconds.

## Broker Failure During Retry

If the broker itself is unavailable when the retry loop tries to re-enqueue a job, the retry count is incremented on each failed attempt. Once retries are exhausted, the job is moved to the dead set. This prevents infinite retry loops under sustained broker instability.

## Graceful Shutdown

During engine shutdown, any in-flight job that hasn't been dispatched to a worker is re-enqueued immediately. If re-enqueue fails, the job is added to the retry set for pickup on the next startup. In all cases, the job is acknowledged from the processing set to prevent it from being stuck for the full lease duration.

## Dead Set

Jobs that fail after exhausting all retries are moved to the dead set. You can inspect dead job counts through the engine stats:

```go
stats, err := engine.Stats()
fmt.Printf("Processed: %d\n", stats.Processed)
fmt.Printf("Failed: %d\n", stats.Failed)
fmt.Printf("Retry jobs: %d\n", stats.Retry)
fmt.Printf("Dead jobs: %d\n", stats.Dead)
```

In tests, use `TestBroker` to inspect dead and retry jobs directly:

```go
engine, client, testBroker, _ := crank.NewTestEngine()
// ... process jobs ...
deadJobs := testBroker.DeadJobs()
retryJobs := testBroker.RetryJobs()
```
