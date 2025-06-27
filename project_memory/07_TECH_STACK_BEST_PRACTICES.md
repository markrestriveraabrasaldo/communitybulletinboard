# Tech Stack Best Practices Guide

This document outlines the latest best practices for our complete tech stack, based on 2024-2025 industry standards and patterns already implemented in this codebase.

## Table of Contents
1. [Next.js 15 App Router](#nextjs-15-app-router)
2. [React 19 + TypeScript](#react-19--typescript)
3. [Supabase Integration](#supabase-integration)
4. [Tailwind CSS 4](#tailwind-css-4)
5. [Zod Validation](#zod-validation)
6. [Playwright Testing](#playwright-testing)
7. [Code Organization](#code-organization)
8. [Performance & Security](#performance--security)

---

## Next.js 15 App Router

### Core Principles
- **Server Components by Default**: Use Server Components as the default choice for better performance and SEO
- **Client Components Only When Needed**: Use `"use client"` directive only for browser APIs, event handlers, or state management
- **App Router Architecture**: Leverage the file-system based routing with React Server Components

### Server vs Client Components

**Use Server Components for:**
```typescript
// ✅ Server Component (default)
export default async function PostList() {
  const posts = await fetchPosts() // Direct database access
  return <div>{posts.map(post => <PostCard key={post.id} post={post} />)}</div>
}
```

**Use Client Components for:**
```typescript
// ✅ Client Component
"use client"
import { useState } from 'react'

export default function SearchForm() {
  const [query, setQuery] = useState('')
  // Browser APIs, event handlers, state management
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### Server Actions Best Practices
```typescript
// ✅ Server Action with proper validation
'use server'

export async function createPost(formData: FormData) {
  // Validate input
  const result = postSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { success: false, error: 'Invalid data' }
  }
  
  // Process server-side
  const { user } = await getAuthenticatedUser()
  // ... database operations
  
  revalidatePath('/posts')
  return { success: true }
}
```

### File Organization
```
src/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx          # Server Component
│   │   ├── loading.tsx       # Loading UI
│   │   └── error.tsx         # Error UI
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── server/               # Server Components
│   └── client/               # Client Components
└── lib/
    ├── actions/              # Server Actions
    ├── utils/
    └── types/
```

---

## React 19 + TypeScript

### New Hooks (React 19)

**useActionState for Forms:**
```typescript
import { useActionState } from 'react'

function ContactForm() {
  const [state, formAction] = useActionState(createContact, { message: '' })
  
  return (
    <form action={formAction}>
      <input name="email" required />
      {state.error && <p>{state.error}</p>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

**useOptimistic for UI Updates:**
```typescript
import { useOptimistic } from 'react'

function PostList({ posts }) {
  const [optimisticPosts, addOptimistic] = useOptimistic(
    posts,
    (state, newPost) => [...state, newPost]
  )
  
  async function createPost(formData) {
    addOptimistic({ id: Date.now(), ...formData })
    await serverCreatePost(formData)
  }
  
  return (
    <div>
      {optimisticPosts.map(post => <Post key={post.id} post={post} />)}
    </div>
  )
}
```

### Component Patterns

**Composition over Inheritance:**
```typescript
// ✅ Good: Composition
interface CardProps {
  children: React.ReactNode
  className?: string
}

function Card({ children, className }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

function PostCard({ post }: { post: Post }) {
  return (
    <Card className="post-card">
      <h3>{post.title}</h3>
      <p>{post.description}</p>
    </Card>
  )
}
```

**Custom Hooks for Logic Reuse:**
```typescript
// ✅ Custom hook for reusable logic
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Auth logic
  }, [])
  
  return { user, loading, signIn, signOut }
}
```

### TypeScript Best Practices

**Strict Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

**Interface Design:**
```typescript
// ✅ Well-defined interfaces
interface Post {
  id: string
  title: string
  description: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
  }
}

// ✅ Discriminated unions for state
type AsyncState<T> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

---

## Supabase Integration

### SSR Client Configuration

**Server Client:**
```typescript
// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Handle Server Component limitation
          }
        },
      },
    }
  )
}
```

**Client Component Client:**
```typescript
// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Authentication Patterns

**Middleware for Token Refresh:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )
  
  await supabase.auth.getUser()
  return response
}
```

### Database Type Safety

**Generated Types:**
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
        }
        Update: {
          title?: string
          description?: string
        }
      }
    }
  }
}
```

---

## Tailwind CSS 4

### Configuration (CSS-based)

**Main CSS File:**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-family-sans: "Inter", sans-serif;
}

/* Custom utilities */
@utility {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90;
  }
}
```

### Component Patterns

**Utility-First Approach:**
```typescript
// ✅ Good: Utility classes for styling
function Button({ variant, children, ...props }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Responsive Design:**
```typescript
// ✅ Mobile-first responsive design
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</div>
```

### PostCSS Configuration

**postcss.config.mjs:**
```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

---

## Zod Validation

### Schema Design

**Basic Schema:**
```typescript
import { z } from 'zod'

export const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

// Type inference
export type PostInput = z.infer<typeof postSchema>
```

### Server Action Integration

**Validation in Server Actions:**
```typescript
'use server'

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  // Validate input
  const result = postSchema.safeParse(Object.fromEntries(formData))
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues
        .map(issue => issue.message)
        .join(', ')
    }
  }
  
  // Use validated data
  const validatedData = result.data
  // ... process data
}
```

### Error Handling

**Safe Parsing:**
```typescript
function validatePost(data: unknown) {
  const result = postSchema.safeParse(data)
  
  if (!result.success) {
    // Handle validation errors
    const errors = result.error.format()
    return { success: false, errors }
  }
  
  return { success: true, data: result.data }
}
```

### Custom Validations

**Refinements:**
```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
```

---

## Playwright Testing

### Test Organization

**Configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

### Testing Patterns

**Page Object Model:**
```typescript
// tests/pages/HomePage.ts
export class HomePage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/')
  }
  
  async searchPosts(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.click('[data-testid="search-button"]')
  }
  
  async getPostTitles() {
    return await this.page.locator('[data-testid="post-title"]').allTextContents()
  }
}
```

**Authentication State:**
```typescript
// tests/auth.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('[type="submit"]')
  
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: 'auth.json' })
})
```

### Test Structure

**E2E Test Example:**
```typescript
// tests/e2e/post-creation.spec.ts
test.describe('Post Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/posts/new')
  })
  
  test('should create a new post', async ({ page }) => {
    // Arrange
    const postData = {
      title: 'Test Post',
      description: 'Test Description',
      category: 'services'
    }
    
    // Act
    await page.fill('[name="title"]', postData.title)
    await page.fill('[name="description"]', postData.description)
    await page.selectOption('[name="categoryId"]', postData.category)
    await page.click('[type="submit"]')
    
    // Assert
    await expect(page).toHaveURL(/\/posts\/\w+/)
    await expect(page.locator('h1')).toContainText(postData.title)
  })
})
```

---

## Code Organization

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form components
│   └── features/          # Feature-specific components
├── lib/
│   ├── actions/           # Server Actions
│   ├── auth-utils.ts      # Authentication utilities
│   ├── schemas.ts         # Zod schemas
│   └── supabase-*.ts      # Supabase clients
├── types/
│   ├── database.ts        # Database types
│   └── index.ts           # General types
└── utils/
    ├── formHelpers.ts     # Form utilities
    └── searchUtils.ts     # Search utilities
```

### Naming Conventions

**Files and Folders:**
- `kebab-case` for files and folders
- `PascalCase` for React components
- `camelCase` for functions and variables

**Components:**
```typescript
// ✅ Good naming
export function PostCard({ post }: PostCardProps) {}
export function SearchWithServerActions() {}
export function EditPostModal() {}
```

### Error Handling

**Error Boundaries:**
```typescript
'use client'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

export default function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryPrimitive
      fallback={({ error }) => 
        Fallback ? <Fallback error={error} /> : <DefaultError error={error} />
      }
    >
      {children}
    </ErrorBoundaryPrimitive>
  )
}
```

---

## Performance & Security

### Performance Optimization

**Image Optimization:**
```typescript
import Image from 'next/image'

// ✅ Optimized images
<Image
  src={post.imageUrl}
  alt={post.title}
  width={300}
  height={200}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### Security Best Practices

**Environment Variables:**
```typescript
// ✅ Clean environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim().replace(/\s+/g, '')
```

**Input Sanitization:**
```typescript
// ✅ Always validate server-side
export async function createPost(formData: FormData) {
  const result = postSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    throw new Error('Invalid input')
  }
  // Process validated data only
}
```

**CSP Headers:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
          }
        ]
      }
    ]
  }
}
```

---

## Development Workflow

### ESLint Configuration

**eslint.config.mjs:**
```javascript
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn"
    }
  }
]
```

### Git Workflow

**Pre-commit Hooks:**
```json
// package.json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "pre-commit": "npm run lint && npm run typecheck"
  }
}
```

### Environment Management

**.env.local:**
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development
NODE_ENV=development
```

---

## Summary

This tech stack provides a modern, type-safe, and performant foundation for web applications. Key principles:

1. **Server-first**: Leverage Server Components and Server Actions for better performance
2. **Type Safety**: Use TypeScript strict mode and Zod for runtime validation
3. **Performance**: Optimize images, bundles, and use efficient caching strategies
4. **Testing**: Comprehensive E2E testing with Playwright
5. **Security**: Validate all inputs and use secure authentication patterns
6. **Maintainability**: Clear project structure and consistent patterns

Regular updates to this guide ensure alignment with the latest best practices and framework updates.