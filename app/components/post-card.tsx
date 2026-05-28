import Link from "next/link";
import type { BlogPostMeta } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <span>{formatDate(post.publishedAt)}</span>
        {post.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.summary}</p>
      </div>
      <div>
        <Link className="post-backlink" href={`/blog/${post.slug}`}>
          阅读全文
        </Link>
      </div>
    </article>
  );
}
