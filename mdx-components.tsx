import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ href = "", ...props }) => {
    const isExternal = href.startsWith("http");
    return (
      <a
        {...props}
        href={href}
        rel={isExternal ? "noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      />
    );
  }
};

export function useMDXComponents(): MDXComponents {
  return components;
}
