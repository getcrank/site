import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fadeInUp, fadeIn } from "../../lib/motion";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Comparison {
  readonly title: string;
  readonly ruby: string;
  readonly go: string;
  readonly insight?: string;
}

const comparisons: readonly Comparison[] = [
  {
    title: "Defining a Worker",
    ruby: `class EmailWorker
  include Sidekiq::Job

  def perform(user_id)
    UserMailer.welcome(user_id).deliver_now
  end
end`,
    go: `type EmailWorker struct{}

func (w EmailWorker) Perform(
    ctx context.Context,
    args ...interface{},
) error {
    userID := args[0].(string)
    return sendEmail(ctx, userID)
}`,
    insight:
      "Crank workers implement a single Perform method with context and variadic args \u2014 no mixins needed.",
  },
  {
    title: "Registering Workers",
    ruby: `# Workers auto-discovered from the
# Sidekiq::Job class hierarchy.
# No explicit registration step.`,
    go: `engine.Register("EmailWorker", EmailWorker{})

// Or register many at once
engine.RegisterMany(map[string]crank.Worker{
    "EmailWorker":  EmailWorker{},
    "ReportWorker": ReportWorker{},
})`,
    insight:
      "Explicit registration means no runtime surprises \u2014 you control exactly what runs.",
  },
  {
    title: "Enqueuing Jobs",
    ruby: `EmailWorker.perform_async("user-123")

# Target a specific queue
EmailWorker
  .set(queue: "critical")
  .perform_async("user-123")`,
    go: `client.Enqueue(
    "EmailWorker", "default", "user-123",
)

// Global client \u2014 enqueue from anywhere
crank.Enqueue(
    "EmailWorker", "critical", "user-123",
)`,
    insight:
      "Queue name is always explicit at enqueue time \u2014 no default queue hiding in class options.",
  },
  {
    title: "Queues & Priorities",
    ruby: `# config/sidekiq.yml
:queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]`,
    go: `crank.WithQueues(
    crank.QueueOption{Name: "critical", Weight: 5},
    crank.QueueOption{Name: "default",  Weight: 3},
    crank.QueueOption{Name: "low",      Weight: 1},
)`,
    insight:
      "Weights work the same way \u2014 higher weight means more frequent polling.",
  },
  {
    title: "Retries",
    ruby: `class EmailWorker
  include Sidekiq::Job
  sidekiq_options retry: 10
end

# Default: 25 retries
# Backoff: polynomial + random jitter`,
    go: `retries := 10
opts := &crank.JobOptions{Retry: &retries}
client.EnqueueWithOptions(
    "EmailWorker", "default", opts, "user-123",
)
// Default: 5 retries (max 25)
// Backoff: exponential (2^n seconds)`,
    insight:
      "Retries are per-job in Crank, not per-worker class \u2014 finer-grained control.",
  },
  {
    title: "Middleware",
    ruby: `class MetricsMiddleware
  def call(worker, job, queue)
    start = Time.now
    yield
    duration = Time.now - start
    StatsD.timing("job.duration", duration)
  end
end

Sidekiq.configure_server do |config|
  config.server_middleware do |chain|
    chain.add MetricsMiddleware
  end
end`,
    go: `engine.Use(func(next crank.Handler) crank.Handler {
    return func(
        ctx context.Context, job *crank.Job,
    ) error {
        start := time.Now()
        err := next(ctx, job)
        duration := time.Since(start)
        metrics.RecordJobDuration(
            job.Class, duration,
        )
        return err
    }
})`,
    insight:
      "Both use chain-of-responsibility. Call engine.Use() before engine.Start().",
  },
  {
    title: "Testing",
    ruby: `require "sidekiq/testing"

Sidekiq::Testing.fake! do
  EmailWorker.perform_async("user-123")
  assert_equal 1, EmailWorker.jobs.size
end`,
    go: `engine, client, tb, _ := crank.NewTestEngine()
engine.Register("EmailWorker", EmailWorker{})

client.Enqueue("EmailWorker", "default", "user-123")
engine.Start()
defer engine.Stop()

dead := tb.DeadJobs()`,
    insight:
      "NewTestEngine uses in-memory storage \u2014 no Redis required in CI.",
  },
  {
    title: "Configuration",
    ruby: `# config/sidekiq.yml
:concurrency: 10
:queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]`,
    go: `# config/crank.yml
broker: redis
redis_url: redis://localhost:6379/0
concurrency: 10
queues:
  - [critical, 5]
  - [default, 3]
  - [low, 1]`,
    insight:
      'Load with crank.QuickStart("config/crank.yml") \u2014 sets up engine, client, and global client in one call.',
  },
];

interface QuickRefRow {
  readonly concept: string;
  readonly sidekiq: string;
  readonly crank: string;
}

const quickRef: readonly QuickRefRow[] = [
  {
    concept: "Define worker",
    sidekiq: "include Sidekiq::Job",
    crank: "implement Perform(ctx, args...)",
  },
  {
    concept: "Enqueue job",
    sidekiq: "Worker.perform_async(args)",
    crank: "client.Enqueue(name, queue, args)",
  },
  {
    concept: "Queue routing",
    sidekiq: "sidekiq_options queue: :name",
    crank: "crank.WithQueues(...)",
  },
  {
    concept: "Retry config",
    sidekiq: "sidekiq_options retry: N",
    crank: "&crank.JobOptions{Retry: &n}",
  },
  {
    concept: "Middleware",
    sidekiq: "chain.add MyMiddleware",
    crank: "engine.Use(middleware)",
  },
  {
    concept: "Test mode",
    sidekiq: "Sidekiq::Testing.fake!",
    crank: "crank.NewTestEngine()",
  },
  {
    concept: "Start processing",
    sidekiq: "bundle exec sidekiq",
    crank: "engine.Start()",
  },
  {
    concept: "Config file",
    sidekiq: "config/sidekiq.yml",
    crank: 'crank.QuickStart("crank.yml")',
  },
  {
    concept: "Concurrency",
    sidekiq: ":concurrency: N",
    crank: "crank.WithConcurrency(N)",
  },
  {
    concept: "Dead jobs",
    sidekiq: "Web UI \u2192 Dead tab",
    crank: "testBroker.DeadJobs()",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ComparisonCard({
  comparison,
  index,
}: {
  readonly comparison: Comparison;
  readonly index: number;
}) {
  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {comparison.title}
        </h3>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Ruby / Sidekiq */}
        <div className="bg-red-50/40 border-b md:border-b-0 md:border-r border-border/50">
          <div className="px-4 py-2 border-b border-red-100/50">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">
              Sidekiq
            </span>
          </div>
          <pre className="px-4 py-4 overflow-x-auto">
            <code className="text-[12.5px] leading-[1.65] font-mono text-foreground/75">
              {comparison.ruby}
            </code>
          </pre>
        </div>

        {/* Go / Crank */}
        <div className="bg-sky-50/40">
          <div className="px-4 py-2 border-b border-sky-100/50">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-500">
              Crank
            </span>
          </div>
          <pre className="px-4 py-4 overflow-x-auto">
            <code className="text-[12.5px] leading-[1.65] font-mono text-foreground/75">
              {comparison.go}
            </code>
          </pre>
        </div>
      </div>

      {comparison.insight && (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[13px] text-muted leading-relaxed">
            <span className="text-sky-400 mr-1.5">&rarr;</span>
            {comparison.insight}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function SidekiqToCrank() {
  return (
    <div className="min-w-0 flex-1">
      {/* Hero */}
      <motion.div className="mb-10" {...fadeInUp}>
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted mb-4">
          Migration Guide
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          <span className="text-red-500">Sidekiq</span>
          <motion.span
            className="inline-block mx-3 text-muted"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            &rarr;
          </motion.span>
          <span className="text-foreground">Crank</span>
        </h1>
        <p className="mt-3 text-[15px] text-muted max-w-lg leading-relaxed">
          Map your Ruby mental models to Go. Every Sidekiq pattern you know has
          a Crank equivalent.
        </p>
        <div className="h-0.5 w-24 mt-5 rounded-full bg-gradient-to-r from-red-400 to-sky-400" />
      </motion.div>

      {/* Quick Reference */}
      <motion.div
        className="bg-card border border-border rounded-xl overflow-hidden mb-10"
        {...fadeIn(0.2)}
      >
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Quick Reference
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Concept
                </th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">
                  Sidekiq
                </th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-500">
                  Crank
                </th>
              </tr>
            </thead>
            <tbody>
              {quickRef.map((row, i) => (
                <tr
                  key={row.concept}
                  className={
                    i < quickRef.length - 1 ? "border-b border-border/60" : ""
                  }
                >
                  <td className="px-5 py-2.5 font-medium text-foreground text-[13px] whitespace-nowrap">
                    {row.concept}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-muted whitespace-nowrap">
                    {row.sidekiq}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-muted whitespace-nowrap">
                    {row.crank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Side by Side
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Comparison cards */}
      <div className="space-y-6">
        {comparisons.map((comparison, index) => (
          <ComparisonCard
            key={comparison.title}
            comparison={comparison}
            index={index}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        className="mt-10 mb-4 bg-card border border-border rounded-xl p-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-muted mb-3">Ready to make the switch?</p>
        <Link
          to="/docs/getting-started"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </div>
  );
}
