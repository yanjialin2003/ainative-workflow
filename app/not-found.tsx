import Link from "next/link";
import { SiteShell } from "@/app/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="not-found-panel">
        <p className="eyebrow">404</p>
        <h1>文章不存在或已下线</h1>
        <p>你访问的内容没有找到，可以先回到博客列表继续浏览，或者回首页看看最新文章。</p>
        <div className="inline-actions">
          <Link className="button-primary" href="/blog">
            返回博客列表
          </Link>
          <Link className="button-secondary" href="/">
            返回首页
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
