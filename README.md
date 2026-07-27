# Personal Site MVP

一个基于 `Next.js App Router + TypeScript` 的个人网站 MVP，包含首页、博客列表、博客详情、本地内容源适配层，以及可直接复跑的 `lint` / 构建 / 冒烟测试脚本。

## Local Setup

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:3000`。

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

- `npm run lint`: 使用 ESLint CLI 执行可复用的前端检查，不再触发 Next.js 初始化交互。
- `npm run typecheck`: 执行 TypeScript 静态检查。
- `npm run build`: 执行生产构建，验证静态路由和 MDX 编译。
- `npm test`: 先构建，再启动生产服务做端到端冒烟，覆盖首页、博客列表、有效文章详情和无效 slug 的真实 `404`。

## Content Source

当前站点完全依赖仓库内的本地内容源，没有独立 CMS 或后端接口。页面层只应通过 `lib/content.ts` 暴露的读取函数访问数据：

- `getProfile()`
- `getPosts()`
- `getPostBySlug(slug)`

内容目录如下：

```text
content/
  profile.ts
  blog/
    index.ts
    *.mdx
lib/
  content.ts
```

- `content/profile.ts`: 个人资料、技能、联系方式和首页 CTA。
- `content/blog/*.mdx`: 每篇博客正文与 frontmatter。
- `content/blog/index.ts`: 文章注册表。这里的 object key 就是站点路由使用的真实 `slug`。
- `lib/content.ts`: 统一的内容访问层，负责读取注册表、排序文章，并给页面返回 `Profile` / `BlogPostMeta` / `BlogPost`。

## Data Contract

### `Profile`

```ts
type Profile = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  skills: string[];
  contacts: Array<{ label: string; href: string }>;
  heroCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};
```

### `BlogPostMeta`

```ts
type BlogPostMeta = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
};
```

`BlogPost` 在 `BlogPostMeta` 基础上增加 `Content`，用于渲染 MDX 正文。

## Maintain Content

### 更新个人资料

直接编辑 `content/profile.ts`，保持字段完整即可。页面会自动消费最新内容。

### 新增文章

1. 在 `content/blog/` 新建 `your-post.mdx`。
2. 导出默认 MDX 组件和 `metadata`：

```mdx
export const metadata = {
  title: "文章标题",
  summary: "摘要",
  publishedAt: "2026-05-28",
  tags: ["Next.js", "MDX"]
};
```

3. 在 `content/blog/index.ts` 中导入新文件，并把它注册到 `blogRegistry`。
4. 把注册表 key 设成最终访问路径使用的 slug，例如：

```ts
export const blogRegistry = {
  "your-post": {
    Content: yourPost,
    metadata: yourPostMetadata
  }
};
```

如果漏掉第 3 步，文章不会出现在博客列表，也不会被静态生成到 `/blog/[slug]`。

### 下线文章

从 `content/blog/index.ts` 移除对应条目即可。由于详情页设置了 `dynamicParams = false`，未注册 slug 会直接返回真实 `404`。
