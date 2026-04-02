import gettingStarted from "./getting-started.md?raw";
import configuration from "./configuration.md?raw";
import queues from "./queues.md?raw";
import workers from "./workers.md?raw";
import middleware from "./middleware.md?raw";
import retries from "./retries.md?raw";
import brokers from "./brokers.md?raw";
import testing from "./testing.md?raw";
import advanced from "./advanced.md?raw";
import comingFeatures from "./coming-features.md?raw";

export interface DocPage {
  readonly slug: string;
  readonly title: string;
  readonly content: string;
}

export interface DocSection {
  readonly label: string;
  readonly pages: readonly DocPage[];
}

export const docSections: readonly DocSection[] = [
  {
    label: "Introduction",
    pages: [
      { slug: "getting-started", title: "Getting Started", content: gettingStarted },
      { slug: "configuration", title: "Configuration", content: configuration },
    ],
  },
  {
    label: "Core Concepts",
    pages: [
      { slug: "queues", title: "Queues", content: queues },
      { slug: "workers", title: "Workers", content: workers },
      { slug: "middleware", title: "Middleware", content: middleware },
      { slug: "retries", title: "Retries", content: retries },
    ],
  },
  {
    label: "Infrastructure",
    pages: [
      { slug: "brokers", title: "Brokers", content: brokers },
      { slug: "testing", title: "Testing", content: testing },
      { slug: "advanced", title: "Advanced", content: advanced },
    ],
  },
  {
    label: "Roadmap",
    pages: [
      { slug: "coming-features", title: "Coming Features", content: comingFeatures },
    ],
  },
];

export const allDocPages: readonly DocPage[] = docSections.flatMap(
  (section) => section.pages,
);
