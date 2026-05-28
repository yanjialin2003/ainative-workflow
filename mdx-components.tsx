import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ href = "", rel, target, ...props }) => {
    const isExternal = href.startsWith("http");
    const externalRel = isExternal
      ? Array.from(new Set([...(rel?.split(" ") ?? []), "noopener", "noreferrer"])).join(" ")
      : rel;

    return (
      <a
        {...props}
        href={href}
        rel={externalRel}
        target={isExternal ? "_blank" : target}
      />
    );
  }
};

export function useMDXComponents(): MDXComponents {
  return components;
}
