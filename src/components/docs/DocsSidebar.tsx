import { Link, useParams } from "react-router";
import { docSections } from "../../content/docs";

export function DocsSidebar() {
  const { slug } = useParams();

  return (
    <aside className="w-56 shrink-0 pr-6 border-r border-border hidden md:block">
      <nav className="sticky top-6 space-y-6">
        {docSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted mb-2">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    to={`/docs/${page.slug}`}
                    className={`block text-sm py-1.5 pl-3 border-l-[1.5px] transition-colors ${
                      slug === page.slug
                        ? "text-foreground font-medium border-foreground"
                        : "text-muted hover:text-foreground border-transparent"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
