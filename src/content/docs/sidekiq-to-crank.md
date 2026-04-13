# Sidekiq to Crank

A side-by-side cheat sheet for Ruby developers moving from Sidekiq to Crank. Each section shows the Sidekiq (Ruby) pattern followed by its Crank (Go) equivalent.

## Defining a Worker

**Sidekiq**

```ruby
class EmailWorker
  include Sidekiq::Job

  def perform(user_id)
    UserMailer.welcome(user_id).deliver_now
  end
end
```

**Crank**

```go
type EmailWorker struct{}

func (w EmailWorker) Perform(ctx context.Context, args ...interface{}) error {
    userID, ok := args[0].(string)
    if !ok {
        return fmt.Errorf("expected string, got %T", args[0])
    }
    return sendEmail(ctx, userID)
}
```

> Crank workers implement a single `Perform` method that receives a context and variadic args — no mixins needed.

## Registering Workers

**Sidekiq** — Workers are auto-discovered from the class hierarchy. No explicit registration.

**Crank** — Workers are registered explicitly by name:

```go
engine.Register("EmailWorker", EmailWorker{})

// Or register many at once
engine.RegisterMany(map[string]crank.Worker{
    "EmailWorker":  EmailWorker{},
    "ReportWorker": ReportWorker{},
})
```

## Enqueuing Jobs

**Sidekiq**

```ruby
EmailWorker.perform_async("user-123")

# With options
EmailWorker.set(queue: "critical").perform_async("user-123")
```

**Crank**

```go
jid, err := client.Enqueue("EmailWorker", "default", "user-123")

// Or use the global client from anywhere
jid, err := crank.Enqueue("EmailWorker", "critical", "user-123")
```

> In Crank, the queue name is always passed explicitly at enqueue time.

## Queues and Priorities

**Sidekiq**

```ruby
# In the worker
class EmailWorker
  include Sidekiq::Job
  sidekiq_options queue: :critical
end

# In sidekiq.yml
:queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]
```

**Crank**

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

```yaml
# Or in crank.yml
queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]
```

> Weights work the same way — higher weight means more frequent polling.

## Concurrency

**Sidekiq**

```ruby
# sidekiq.yml
:concurrency: 20
```

**Crank**

```go
engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithBroker("redis"),
    crank.WithConcurrency(20),
)
```

| | Sidekiq | Crank |
|---|---------|-------|
| Default | 10 threads | 10 goroutines |
| Maximum | No hard limit | 10,000 |
| Model | Thread pool | Goroutine pool |

## Retries

**Sidekiq**

```ruby
class EmailWorker
  include Sidekiq::Job
  sidekiq_options retry: 10
end
```

**Crank**

```go
retries := 10
opts := &crank.JobOptions{Retry: &retries}
jid, err := client.EnqueueWithOptions("EmailWorker", "default", opts, "user-123")
```

| | Sidekiq | Crank |
|---|---------|-------|
| Default retries | 25 | 5 |
| Max retries | 25 | 25 |
| Backoff | Polynomial + random | Exponential (2^n seconds) |
| Dead set | Yes (Dead tab in web UI) | Yes (`testBroker.DeadJobs()`) |

## Middleware

**Sidekiq**

```ruby
class MetricsMiddleware
  def call(worker, job, queue)
    start = Time.now
    yield
    duration = Time.now - start
    StatsD.timing("job.duration", duration, tags: ["class:#{worker.class}"])
  end
end

Sidekiq.configure_server do |config|
  config.server_middleware do |chain|
    chain.add MetricsMiddleware
  end
end
```

**Crank**

```go
engine.Use(func(next crank.Handler) crank.Handler {
    return func(ctx context.Context, job *crank.Job) error {
        start := time.Now()
        err := next(ctx, job)
        duration := time.Since(start)
        metrics.RecordJobDuration(job.Class, duration)
        return err
    }
})
```

> Both use a chain-of-responsibility pattern. Crank's `engine.Use()` must be called before `engine.Start()`.

## Testing

**Sidekiq**

```ruby
require "sidekiq/testing"

Sidekiq::Testing.fake! do
  EmailWorker.perform_async("user-123")
  assert_equal 1, EmailWorker.jobs.size
end
```

**Crank**

```go
engine, client, testBroker, err := crank.NewTestEngine()
engine.Register("EmailWorker", EmailWorker{})

jid, err := client.Enqueue("EmailWorker", "default", "user-123")
engine.Start()
defer engine.Stop()

time.Sleep(100 * time.Millisecond)
deadJobs := testBroker.DeadJobs()
```

> `NewTestEngine` uses in-memory storage — no Redis required in CI.

## Configuration

**Sidekiq** — `config/sidekiq.yml`

```yaml
:concurrency: 10
:queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]
```

**Crank** — `config/crank.yml`

```yaml
broker: redis
redis_url: redis://localhost:6379/0
concurrency: 10
queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]
```

```go
engine, client, err := crank.QuickStart("config/crank.yml")
```

## Quick Reference

| Concept | Sidekiq (Ruby) | Crank (Go) |
|---|---|---|
| Define worker | `include Sidekiq::Job` | Implement `Perform(ctx, args...)` |
| Enqueue | `Worker.perform_async(args)` | `client.Enqueue(name, queue, args)` |
| Queues | `sidekiq_options queue: :name` | `crank.WithQueues(...)` |
| Retries | `sidekiq_options retry: N` | `&crank.JobOptions{Retry: &n}` |
| Middleware | `chain.add MyMiddleware` | `engine.Use(myMiddleware)` |
| Test mode | `Sidekiq::Testing.fake!` | `crank.NewTestEngine()` |
| Start server | `bundle exec sidekiq` | `engine.Start()` |
| Config file | `config/sidekiq.yml` | `crank.QuickStart("crank.yml")` |
| Concurrency | `:concurrency: N` | `crank.WithConcurrency(N)` |
| Dead jobs | Web UI Dead tab | `testBroker.DeadJobs()` |
