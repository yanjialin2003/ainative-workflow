import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContent } from "@/app/components/post-content";
import { SiteShell } from "@/app/components/site-shell";
import { getPostBySlug, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug
  }));
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <article className="post-layout">
        <Link className="post-backlink" href="/blog">
          返回博客列表
        </Link>
        <header className="post-header">
          <div className="post-meta">
            <span>{formatDate(post.publishedAt)}</span>
            {post.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <h1>{post.title}</h1>
          <p className="lead">{post.summary}</p>
        </header>
        <PostContent Content={post.Content} />
        <div className="inline-actions">
          <Link className="button-secondary" href="/blog">
            返回博客列表
          </Link>
          <Link className="button-primary" href="/">
            回到首页
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
