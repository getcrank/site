import { motion } from "motion/react";
import { fadeInUp, fadeIn } from "../../lib/motion";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface ErrorEntry {
  readonly error: string;
  readonly cause: string;
  readonly fix: string;
}

interface ErrorSection {
  readonly title: string;
  readonly description: string;
  readonly errors: readonly ErrorEntry[];
}

const sections: readonly ErrorSection[] = [
  {
    title: "Configuration Errors",
    description:
      "Occur when calling crank.New(), crank.QuickStart(), or loading a YAML config.",
    errors: [
      {
        error: "crank: no broker configured",
        cause:
          "Neither WithBroker() nor WithCustomBroker() was provided to crank.New()",
        fix: 'Add a broker option: crank.WithBroker("redis")',
      },
      {
        error: 'config: "broker" field is required',
        cause: "YAML config is missing the broker field or it\u2019s empty",
        fix: "Add broker: redis to your YAML config",
      },
      {
        error: "config: redis.url is empty",
        cause:
          'Broker is "redis" but no URL was provided via YAML or REDIS_URL env',
        fix: "Set redis.url in YAML or export REDIS_URL",
      },
      {
        error: "config: nats.url is empty",
        cause:
          'Broker is "nats" but no URL was provided via YAML or NATS_URL env',
        fix: "Set nats.url in YAML or NATS_URL env var",
      },
      {
        error: 'config: broker "pgsql" is not yet implemented',
        cause: "The specified broker backend is not yet available",
        fix: 'Use "redis" or provide a custom broker via WithCustomBroker()',
      },
      {
        error: 'config: unknown broker "kafka"',
        cause: "An unrecognized broker name was specified in YAML",
        fix: "Use redis, nats, pgsql, or WithCustomBroker()",
      },
      {
        error: 'broker: unsupported broker "kafka"',
        cause: "Unrecognized broker via WithBroker() instead of YAML config",
        fix: "Use redis, nats, pgsql, or WithCustomBroker()",
      },
    ],
  },
  {
    title: "Connection Errors",
    description: "Occur when the broker can\u2019t be reached.",
    errors: [
      {
        error: "broker not available: Redis URL is empty",
        cause: "An empty URL was passed to the Redis broker constructor",
        fix: "Provide a valid Redis connection string",
      },
      {
        error: "broker not available: invalid Redis URL",
        cause:
          "The Redis URL can\u2019t be parsed (missing scheme, typos, invalid port). Credentials are auto-redacted",
        fix: "Use format: redis://host:port/db or rediss://host:port/db for TLS",
      },
      {
        error: "broker not available: Redis unreachable",
        cause:
          "PING failed. Redis may be down, wrong port, or auth required. Host excluded from message",
        fix: "Verify Redis is running, check connection string, firewall, and auth",
      },
      {
        error: "broker: UseTLS scheme mismatch",
        cause:
          "WithTLS(true) was set but the URL uses a non-standard scheme",
        fix: "Use a redis:// or rediss:// URL",
      },
    ],
  },
  {
    title: "Engine Lifecycle Errors",
    description: "Occur when engine methods are called in the wrong order.",
    errors: [
      {
        error: "engine already started",
        cause: "engine.Start() was called more than once",
        fix: "Only call Start() once. Use a sync primitive if starting from multiple goroutines",
      },
      {
        error: "Use must be called before Start",
        cause: "engine.Use(middleware) was called after engine.Start()",
        fix: "Register all middleware before calling engine.Start()",
      },
      {
        error: "SetMetricsHandler must be called before Start",
        cause: "engine.SetMetricsHandler(h) was called after engine.Start()",
        fix: "Set the metrics handler before calling engine.Start()",
      },
    ],
  },
  {
    title: "Worker Errors",
    description: "Occur when a job targets a missing worker.",
    errors: [
      {
        error: 'worker not found for "MyWorker"',
        cause: "A job was dequeued for a worker class that hasn\u2019t been registered",
        fix: 'Register before starting: engine.Register("MyWorker", MyWorker{})',
      },
    ],
  },
  {
    title: "Enqueue Errors",
    description: "Occur when a job can\u2019t be added to the queue.",
    errors: [
      {
        error: "failed to enqueue job: <details>",
        cause:
          "Broker rejected the operation (connection error, closed broker, or validation failure)",
        fix: "Check that the broker is running and the connection is healthy",
      },
      {
        error: "failed to enqueue job: invalid queue name",
        cause:
          "Queue name contains invalid characters, is empty, or exceeds 128 characters",
        fix: "Use only [A-Za-z0-9_-], max 128 characters",
      },
      {
        error: "worker class must not be empty",
        cause: "An empty string was passed as the worker class name",
        fix: "Provide a non-empty worker class name matching a registered worker",
      },
      {
        error: "global client not initialized",
        cause: "crank.Enqueue() was called without setting the global client",
        fix: "Call crank.SetGlobalClient(client) first, or use crank.QuickStart()",
      },
      {
        error: "broker closed",
        cause:
          "A job was enqueued after the broker was closed (e.g. after engine.Stop())",
        fix: "Don\u2019t enqueue jobs after stopping the engine",
      },
    ],
  },
  {
    title: "Validation Errors",
    description:
      "Occur when a job fails validation before dispatch. The job follows the normal retry/dead-letter path.",
    errors: [
      {
        error: "job args count N exceeds max M",
        cause: "The job has more arguments than MaxArgsCount allows",
        fix: "Reduce arguments or increase: crank.MaxArgsCount(10)",
      },
      {
        error: "job class not in allowlist",
        cause: "The job class is not in the configured ClassAllowlist",
        fix: "Add the worker class to the allowlist map",
      },
      {
        error: "job class does not match allowed pattern",
        cause:
          "The job class name doesn\u2019t match the regex set by ClassPattern",
        fix: "Rename the worker to match, or adjust the pattern",
      },
      {
        error: "job payload size N exceeds max M bytes",
        cause: "The serialized job exceeds the MaxPayloadSize limit",
        fix: "Reduce argument size or increase: crank.MaxPayloadSize(4096)",
      },
      {
        error: "job metadata size N exceeds max M bytes",
        cause: "The serialized Metadata field exceeds MaxMetadataSize",
        fix: "Reduce metadata or increase: crank.MaxMetadataSize(1024)",
      },
    ],
  },
  {
    title: "Runtime Errors",
    description: "Occur during job execution.",
    errors: [
      {
        error: "circuit breaker is open",
        cause:
          "A worker class has failed too many times within the configured window",
        fix: "Auto-recovers after reset timeout. Fix the underlying worker failures",
      },
      {
        error: "panic in job <jid>: recovered",
        cause:
          "A worker panicked. RecoveryMiddleware caught it. Check structured logs for the stack trace",
        fix: "Fix the panic in your worker code. The job follows the retry/dead-letter path",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ErrorTable({
  section,
  index,
}: {
  readonly section: ErrorSection;
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
          {section.title}
        </h3>
        <p className="text-[12px] text-muted mt-0.5">{section.description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">
                Error
              </th>
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                Cause
              </th>
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-500">
                Fix
              </th>
            </tr>
          </thead>
          <tbody>
            {section.errors.map((entry, i) => (
              <tr
                key={entry.error}
                className={
                  i < section.errors.length - 1
                    ? "border-b border-border/60"
                    : ""
                }
              >
                <td className="px-5 py-2.5 font-mono text-[12px] text-foreground align-top">
                  {entry.error}
                </td>
                <td className="px-5 py-2.5 text-[13px] text-muted align-top">
                  {entry.cause}
                </td>
                <td className="px-5 py-2.5 text-[13px] text-muted align-top">
                  {entry.fix}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ErrorReference() {
  return (
    <div className="min-w-0 flex-1">
      {/* Hero */}
      <motion.div className="mb-10" {...fadeInUp}>
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted mb-4">
          Reference
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          Error Reference
        </h1>
        <p className="mt-3 text-[15px] text-muted max-w-lg leading-relaxed">
          Every error Crank can return, what causes it, and how to fix it.
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
                  Category
                </th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  When
                </th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, i) => (
                <tr
                  key={section.title}
                  className={
                    i < sections.length - 1 ? "border-b border-border/60" : ""
                  }
                >
                  <td className="px-5 py-2.5 font-medium text-foreground text-[13px] whitespace-nowrap">
                    {section.title}
                  </td>
                  <td className="px-5 py-2.5 text-[13px] text-muted">
                    {section.description}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-muted whitespace-nowrap">
                    {section.errors.length}
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
          All Errors
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Error tables */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <ErrorTable key={section.title} section={section} index={index} />
        ))}
      </div>
    </div>
  );
}
