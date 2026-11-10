/** Central site configuration — feeds metadata, sitemap, JSON-LD and navigation. */
export const siteConfig = {
  name: "Keystone",
  title: "Keystone — Secure user management for modern teams",
  description:
    "Keystone is a fast, accessible user management console: role-based access, account lifecycle and audit-ready controls in one place.",
  url: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
  keywords: ["user management", "admin dashboard", "role-based access control", "RBAC", "Next.js"],
  creator: "Keystone",
  links: {
    github: "https://github.com/almamun2b/next-app-prisma",
  },
} as const;

export const marketingNav = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
] as const;
