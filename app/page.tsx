import Link from "next/link";
import { PostCard } from "@/app/components/post-card";
import { SiteShell } from "@/app/components/site-shell";
import { getPosts, getProfile } from "@/lib/content";

export default async function HomePage() {
  const [profile, posts] = await Promise.all([getProfile(), getPosts()]);
  const latestPosts = posts.slice(0, 3);

  return (
    <SiteShell>
      <section className="hero">
        <div className="hero-card hero-copy">
          <span className="eyebrow">个人技术站点</span>
          <h1>你好，我是 {profile.name}</h1>
          <p className="lead">
            {profile.role}。{profile.tagline}
          </p>
          <p>{profile.bio}</p>
          <div className="hero-actions">
            <Link className="button-primary" href={profile.heroCta.href}>
              {profile.heroCta.label}
            </Link>
            {profile.secondaryCta ? (
              <Link className="button-secondary" href={profile.secondaryCta.href} target="_blank">
                {profile.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="hero-card hero-aside">
          <div>
            <p className="eyebrow">当前关注</p>
            <p className="lead">
              把 AI 工作流、内容系统和前端体验做得可维护、可扩展，也写清楚。
            </p>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <strong>{posts.length}</strong>
              <span>示例文章</span>
            </div>
            <div className="stat-card">
              <strong>{profile.skills.length}</strong>
              <span>技术方向</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>个人信息</h2>
            <p>围绕公开资料展示当前角色、擅长方向和可访问的外部链接。</p>
          </div>
        </div>
        <div className="bio-grid">
          <article className="surface-card">
            <h3>简介</h3>
            <p>{profile.bio}</p>
          </article>
          <article className="surface-card">
            <h3>技术方向</h3>
            <div className="tag-list">
              {profile.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </article>
          <article className="surface-card">
            <h3>公开链接</h3>
            <div className="contact-list">
              {profile.contacts.map((contact) => (
                <Link
                  className="contact-link"
                  href={contact.href}
                  key={contact.label}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                >
                  {contact.label}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>最新文章</h2>
            <p>记录实践、问题拆解和工程笔记。</p>
          </div>
          <Link className="post-backlink" href="/blog">
            查看全部博客
          </Link>
        </div>
        {latestPosts.length > 0 ? (
          <div className="post-grid">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>博客内容准备中</h2>
            <p>文章正在整理，稍后可以从博客列表查看完整内容。</p>
            <div className="inline-actions">
              <Link className="button-primary" href="/blog">
                去博客页
              </Link>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
