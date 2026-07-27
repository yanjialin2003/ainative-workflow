declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const metadata: {
    title: string;
    summary: string;
    publishedAt: string;
    tags: string[];
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
