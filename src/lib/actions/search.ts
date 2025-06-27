'use server'

import { createClient } from '@/lib/supabase-server'
import { PostWithCategory } from '@/types/database'
import { searchSchema } from '@/lib/schemas'

export interface SearchResult {
  posts: PostWithCategory[]
  error?: string
}

export async function searchPosts(query: string): Promise<SearchResult> {
  try {
    const supabase = await createClient()

    // Validate using Zod schema
    const validationResult = searchSchema.safeParse({ query })
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { posts: [], error: errorMessages[0] }
    }

    const validatedQuery = validationResult.data.query

    // Search posts by title, description, and category name
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .or(`title.ilike.%${validatedQuery}%,description.ilike.%${validatedQuery}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching posts:', error)
      return { posts: [], error: 'Failed to search posts' }
    }

    return { posts: posts || [] }
  } catch (error) {
    console.error('Server error searching posts:', error)
    return { posts: [], error: 'Server error occurred' }
  }
}

export async function searchPostsInCategory(query: string, categoryId: string): Promise<SearchResult> {
  try {
    const supabase = await createClient()

    // Validate using Zod schema
    const validationResult = searchSchema.safeParse({ query, categoryId })
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { posts: [], error: errorMessages[0] }
    }

    const validatedData = validationResult.data

    if (!validatedData.query.trim()) {
      // Return all posts in category if no query
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('category_id', validatedData.categoryId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching category posts:', error)
        return { posts: [], error: 'Failed to fetch posts' }
      }

      return { posts: posts || [] }
    }

    // Search posts within specific category
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('category_id', validatedData.categoryId)
      .or(`title.ilike.%${validatedData.query}%,description.ilike.%${validatedData.query}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching posts in category:', error)
      return { posts: [], error: 'Failed to search posts' }
    }

    return { posts: posts || [] }
  } catch (error) {
    console.error('Server error searching posts in category:', error)
    return { posts: [], error: 'Server error occurred' }
  }
}

export async function getPostsByCategory(categoryId: string): Promise<SearchResult> {
  try {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
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
      console.error('Error fetching posts by category:', error)
      return { posts: [], error: 'Failed to fetch posts' }
    }

    return { posts: posts || [] }
  } catch (error) {
    console.error('Server error fetching posts by category:', error)
    return { posts: [], error: 'Server error occurred' }
  }
}