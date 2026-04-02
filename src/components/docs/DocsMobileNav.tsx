import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { docSections, allDocPages } from "../../content/docs";

export function DocsMobileNav() {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);

  const currentPage = allDocPages.find((p) => p.slug === slug);

  return (
    <div className="md:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-foreground w-full py-2 border-b border-border"
      >
        {open ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
        {currentPage?.title ?? "Documentation"}
      </button>

      {open && (
        <nav className="py-3 space-y-4 border-b border-border">
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
                      onClick={() => setOpen(false)}
                      className={`block text-sm py-1 transition-colors ${
                        slug === page.slug
                          ? "text-foreground font-medium"
                          : "text-muted hover:text-foreground"
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
      )}
    </div>
  );
}
