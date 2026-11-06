import Link from "next/link";

const NAV = [
  { href: "/", label: "总览" },
  { href: "/category/gpu", label: "显卡" },
  { href: "/category/ram", label: "内存" },
  { href: "/category/storage", label: "存储" },
  { href: "/category/cpu", label: "CPU" },
  { href: "/news", label: "新闻" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]/80 bg-[rgba(14,20,27,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--accent)] transition group-hover:text-[var(--accent-2)]"
          >
            硬价台
          </span>
          <span className="hidden text-xs text-[var(--muted)] sm:inline">
            PC 硬件最低价看板
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-[var(--muted)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
