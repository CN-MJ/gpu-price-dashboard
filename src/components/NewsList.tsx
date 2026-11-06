import type { NewsRow } from "@/lib/queries";

export function NewsList({
  items,
  title,
}: {
  items: NewsRow[];
  title: string;
}) {
  return (
    <section className="rise">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--accent-2)]/40"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span>{item.source}</span>
                <span>·</span>
                <time dateTime={item.published_at}>
                  {new Date(item.published_at).toLocaleString("zh-CN")}
                </time>
              </div>
              <h3 className="text-base font-medium leading-snug hover:text-[var(--accent-2)]">
                {item.title}
              </h3>
              {item.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.summary}
                </p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
