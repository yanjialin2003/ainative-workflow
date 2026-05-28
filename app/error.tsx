"use client";

import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SiteShell>
      <section className="error-panel">
        <p className="eyebrow">Error</p>
        <h1>内容加载失败，请刷新重试</h1>
        <p>页面内容暂时不可用。你可以重新尝试当前页面，或者先回到首页和博客列表。</p>
        <div className="inline-actions">
          <button className="button-primary" onClick={() => reset()} type="button">
            重新加载
          </button>
          <Link className="button-secondary" href="/blog">
            去博客列表
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
