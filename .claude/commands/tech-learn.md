# Tech Stack Context - Community Bulletin Board

## 🛠 Current Tech Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage + SSR)
- **Validation**: Zod schemas with TypeScript integration
- **Testing**: Playwright E2E testing across browsers
- **Deployment**: Vercel with automatic deployments

## 🏗 Architecture Patterns Used
- **Server Components** as default for performance
- **Server Actions** for all form handling and mutations
- **SSR Authentication** with @supabase/ssr package
- **Type Safety** with strict TypeScript and Zod validation
- **Utility-First CSS** with Tailwind component patterns

## 📚 Comprehensive Best Practices
For detailed implementation patterns, code examples, and 2024-2025 best practices:

**📖 See**: `project_memory/07_TECH_STACK_BEST_PRACTICES.md`

This file contains:
- Next.js 15 App Router patterns (Server vs Client Components)
- React 19 new hooks (useActionState, useOptimistic)
- Supabase SSR authentication setup
- Tailwind CSS 4 optimization
- Zod validation patterns
- Playwright testing strategies
- Performance & security guidelines

---
*Use `/quick-learn` for project status or `/full-learn` for complete context*