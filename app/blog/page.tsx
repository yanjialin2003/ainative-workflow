import Link from "next/link";
import { PostCard } from "@/app/components/post-card";
import { SiteShell } from "@/app/components/site-shell";
import { getPosts } from "@/lib/content";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <SiteShell>
      <section className="page-title">
        <p className="eyebrow">Blog</p>
        <h1>技术博客</h1>
        <p>记录实践、问题拆解与工程笔记，默认按发布时间倒序展示。</p>
      </section>

      {posts.length > 0 ? (
        <section className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>还没有公开文章</h2>
          <p>文章正在筹备中，你可以先回到首页查看个人资料，或稍后再回来。</p>
          <div className="inline-actions">
            <Link className="button-primary" href="/">
              返回首页
            </Link>
            <Link className="button-secondary" href="/blog">
              稍后再看
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
