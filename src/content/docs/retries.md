# Retries

Crank supports automatic retries with exponential backoff. Jobs that exhaust their retry count are moved to a dead set for inspection.

## Default Behavior

By default, each job gets `5` retry attempts (configurable up to a maximum of `25`). When a worker returns an error, the job is scheduled for retry.

## Configuring Retries Per Job

Override the retry count when enqueuing with `EnqueueWithOptions`:

```go
retries := 10
opts := &crank.JobOptions{Retry: &retries}
jid, err := client.EnqueueWithOptions("ReportWorker", "default", opts, 2024, "q1")
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
    crank.WithRetryPollInterval(10 * time.Second),
)
```

The default interval is `5` seconds.

## Dead Set

Jobs that fail after exhausting all retries are moved to the dead set. You can inspect dead job counts through the engine stats:

```go
stats, err := engine.Stats()
fmt.Printf("Dead jobs: %d\n", stats.Dead)
fmt.Printf("Retry jobs: %d\n", stats.Retry)
fmt.Printf("Processed: %d\n", stats.Processed)
```

In tests, use `TestBroker` to inspect dead and retry jobs directly:

```go
engine, client, testBroker, _ := crank.NewTestEngine()
// ... process jobs ...
deadJobs := testBroker.DeadJobs()
retryJobs := testBroker.RetryJobs()
```
