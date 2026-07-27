"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" }
];

export function SiteShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="page-shell site-header__inner">
          <Link className="site-logo" href="/">
            Lin Yan
          </Link>
          <nav className="site-nav" aria-label="主导航">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link key={item.href} href={item.href} data-active={isActive}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="site-main">
        <div className="page-shell">{children}</div>
      </main>
      <footer className="site-footer">
        <div className="page-shell">© 2026 林言. Built with Next.js and local MDX content.</div>
      </footer>
    </>
  );
}
