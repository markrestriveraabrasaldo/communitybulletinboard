import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Category, PostWithCategory } from '@/types/database'
import { getOptionalAuth } from '@/lib/auth-utils'
import CategoryPageClient from './CategoryPageClient'

interface CategoryPageProps {
  params: Promise<{
    id: string
  }>
}

async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient()
  
  try {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (categoryError || !categoryData) {
      // Use fallback data if database fetch fails
      const fallbackCategories = [
        { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', created_at: new Date().toISOString() },
        { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', created_at: new Date().toISOString() },
        { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', created_at: new Date().toISOString() },
        { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', created_at: new Date().toISOString() },
        { id: 'events', name: 'Events', description: 'Community events and gatherings', created_at: new Date().toISOString() },
        { id: 'others', name: 'Others', description: 'Everything else', created_at: new Date().toISOString() }
      ]
      
      return fallbackCategories.find(cat => cat.id === id) || null
    }

    return categoryData
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  try {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError || !categoriesData || categoriesData.length === 0) {
      // Use fallback categories if database fails
      return [
        { id: 'carpool', name: 'Carpool', description: 'Share rides and transportation', created_at: new Date().toISOString() },
        { id: 'food-selling', name: 'Food Selling', description: 'Buy and sell food items', created_at: new Date().toISOString() },
        { id: 'services', name: 'Services', description: 'Carpentry, plumbing, and other services', created_at: new Date().toISOString() },
        { id: 'lost-found', name: 'Lost & Found', description: 'Lost and found items', created_at: new Date().toISOString() },
        { id: 'events', name: 'Events', description: 'Community events and gatherings', created_at: new Date().toISOString() },
        { id: 'others', name: 'Others', description: 'Everything else', created_at: new Date().toISOString() }
      ]
    }

    return categoriesData
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getPosts(categoryId: string): Promise<PostWithCategory[]> {
  // Check authentication - posts are only visible to authenticated users
  const { user, supabase } = await getOptionalAuth()
  
  if (!user) {
    // Return empty array for unauthenticated users
    return []
  }
  
  try {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    return postsData || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params
  
  // Fetch all data in parallel
  const [category, categories, posts] = await Promise.all([
    getCategory(id),
    getCategories(),
    getPosts(id)
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Categories
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryPageClient
          initialPosts={posts}
          categories={categories}
          category={category}
          categoryId={id}
        />
      </main>
    </div>
  )
}