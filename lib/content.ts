import type { ComponentType } from "react";
import { blogRegistry } from "@/content/blog";
import { profile } from "@/content/profile";

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
