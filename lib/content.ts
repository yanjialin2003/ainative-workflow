import type { ComponentType } from "react";
import { blogRegistry } from "@/content/blog";

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  skills: string[];
  contacts: Array<{
    label: string;
    href: string;
  }>;
  heroCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  Content: ComponentType;
};

const profile: Profile = {
  name: "林言",
  role: "前端 / AI 应用工程师",
  tagline: "专注 AI 应用、工程效率与产品落地。",
  bio: "我关注内容型产品、Agent 工作流和高质量前端体验，日常记录从需求拆解到工程实现中的决策与踩坑。",
  skills: ["Next.js", "TypeScript", "AI Workflow", "Design Systems", "DX"],
  contacts: [
    {
      label: "GitHub",
      href: "https://github.com/yanjialin2003"
    },
    {
      label: "Email",
      href: "mailto:hello@example.com"
    }
  ],
  heroCta: {
    label: "查看博客",
    href: "/blog"
  },
  secondaryCta: {
    label: "访问 GitHub",
    href: "https://github.com/yanjialin2003"
  }
};

function sortPosts<T extends { publishedAt: string }>(posts: T[]): T[] {
  return posts.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function getProfile(): Promise<Profile> {
  return profile;
}

export async function getPosts(): Promise<BlogPostMeta[]> {
  const posts = Object.entries(blogRegistry).map(([slug, entry]) => ({
    slug,
    ...entry.metadata
  }));

  return sortPosts(posts);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const entry = blogRegistry[slug as keyof typeof blogRegistry];

  if (!entry) {
    return null;
  }

  return {
    slug,
    ...entry.metadata,
    Content: entry.Content
  };
}
