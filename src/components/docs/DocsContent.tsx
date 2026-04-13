import { useParams, Navigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { allDocPages } from "../../content/docs";
import { SidekiqToCrank } from "./SidekiqToCrank";

export function DocsContent() {
  const { slug } = useParams();

  if (slug === "sidekiq-to-crank") {
    return <SidekiqToCrank />;
  }

  const page = allDocPages.find((p) => p.slug === slug);

  if (!page) {
    return <Navigate to="/docs/getting-started" replace />;
  }

  return (
    <article className="docs-prose min-w-0 flex-1">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {page.content}
      </Markdown>
    </article>
  );
}
