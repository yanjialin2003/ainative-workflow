import type { Profile } from "@/lib/content";

export const profile: Profile = {
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
