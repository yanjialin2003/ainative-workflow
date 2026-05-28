export function PostContent({ Content }: { Content: React.ComponentType }) {
  return (
    <article className="post-content">
      <Content />
    </article>
  );
}
