'use server'

import { createClient } from '@/lib/supabase-server'
import { PostWithCategory } from '@/types/database'
import { searchSchema } from '@/lib/schemas'
import { buildSearchConditions } from '@/utils/searchUtils'
// Import analytics functions will be implemented inline for server actions

// Server-side analytics functions
async function logSearchServer(
  query: string,
  categoryId?: string,
  categoryName?: string,
  resultsCount: number = 0,
  userId?: string
): Promise<void> {
  const trimmedQuery = query.trim().toLowerCase()
  
  // Only log meaningful queries (same logic as client version)
  if (!trimmedQuery || trimmedQuery.length < 4) return
  
  const supabase = await createClient()
  
  try {
    await supabase
      .from('search_logs')
      .insert({
        query: trimmedQuery,
        category_id: categoryId || null,
        category_name: categoryName || null,
        user_id: userId || null,
        results_count: resultsCount
      })
  } catch (error: unknown) {
    // Fail silently for search logging to not disrupt user experience
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('relation "search_logs" does not exist')) {
      console.warn('search_logs table not found - search logging disabled until migration is applied')
    } else {
      console.warn('Failed to log search:', errorMessage)
    }
  }
}

async function getSearchSuggestionsServer(
  categoryId?: string,
  categoryName?: string
): Promise<{ popular: string[], trending: string[], combined: string[] }> {
  const supabase = await createClient()
  
  try {
    // Get popular searches (last 7 days)
    let popularQuery = supabase
      .from('search_logs')
      .select('query')
      .gte('searched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .gt('results_count', 0)
    
    if (categoryId) {
      popularQuery = popularQuery.eq('category_id', categoryId)
    }
    
    const { data: popularData } = await popularQuery
    
    // Get trending searches (last 24 hours)
    let trendingQuery = supabase
      .from('search_logs')
      .select('query, searched_at')
      .gte('searched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .gt('results_count', 0)
    
    if (categoryId) {
      trendingQuery = trendingQuery.eq('category_id', categoryId)
    }
    
    const { data: trendingData } = await trendingQuery
    
    // Process popular searches
    const queryCount: Record<string, number> = {}
    popularData?.forEach(log => {
      const q = log.query.trim()
      if (q.length >= 4) {
        queryCount[q] = (queryCount[q] || 0) + 1
      }
    })
    
    const popular = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([query]) => query)
    
    // Process trending searches
    const recentQueries: Record<string, { count: number, latestTime: number }> = {}
    trendingData?.forEach(log => {
      const q = log.query.trim()
      const time = new Date(log.searched_at).getTime()
      if (q.length >= 4) {
        if (!recentQueries[q]) {
          recentQueries[q] = { count: 0, latestTime: 0 }
        }
        recentQueries[q].count += 1
        recentQueries[q].latestTime = Math.max(recentQueries[q].latestTime, time)
      }
    })
    
    const now = Date.now()
    const trending = Object.entries(recentQueries)
      .map(([query, stats]) => {
        const recencyHours = (now - stats.latestTime) / (1000 * 60 * 60)
        const recencyFactor = Math.max(0, 24 - recencyHours) / 24
        const trendScore = stats.count * recencyFactor
        return { query, trendScore }
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 5)
      .map(item => item.query)
    
    // Combine trending and popular
    const combined = [...trending]
    popular.forEach(query => {
      if (!combined.includes(query) && combined.length < 8) {
        combined.push(query)
      }
    })
    
    // Fallback suggestions if not enough data
    if (combined.length < 4) {
      const fallback = getFallbackSuggestions(categoryName)
      fallback.forEach(suggestion => {
        if (!combined.includes(suggestion) && combined.length < 8) {
          combined.push(suggestion)
        }
      })
    }
    
    return { popular, trending, combined }
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return {
      popular: [],
      trending: [],
      combined: getFallbackSuggestions(categoryName).slice(0, 8)
    }
  }
}

function getFallbackSuggestions(categoryName?: string): string[] {
  if (categoryName) {
    switch (categoryName) {
      case 'Carpool':
        return ['downtown', 'morning', 'commute', 'shared ride', 'daily', 'pickup']
      case 'Food Selling':
        return ['homemade', 'fresh', 'delivery', 'vegan', 'organic', 'cooked']
      case 'Services':
        return ['plumbing', 'cleaning', 'repair', 'home', 'professional', 'experienced']
      case 'Lost & Found':
        return ['lost', 'found', 'keys', 'phone', 'wallet', 'bag']
      case 'Events':
        return ['party', 'meetup', 'community', 'gathering', 'celebration', 'workshop']
      default:
        return ['urgent', 'free', 'new', 'available', 'quality', 'local']
    }
  }
  return ['urgent', 'free', 'new', 'available', 'quality', 'local', 'community', 'today']
}

export interface SearchResult {
  posts: PostWithCategory[]
  error?: string
}

export interface SearchSuggestionsResult {
  popular: string[]
  trending: string[]
  combined: string[]
  error?: string
}

export async function searchPosts(query: string, userId?: string): Promise<SearchResult> {
  try {
    const supabase = await createClient()

    // Validate using Zod schema
    const validationResult = searchSchema.safeParse({ query })
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { posts: [], error: errorMessages[0] }
    }

    const validatedQuery = validationResult.data.query

    // Search posts by title, description, and all searchable fields
    const searchCondition = buildSearchConditions(validatedQuery)
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .or(searchCondition)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching posts:', error)
      return { posts: [], error: 'Failed to search posts' }
    }

    const results = posts || []

    // Log search analytics (async, don't block response)
    if (validatedQuery && validatedQuery.length >= 3) {
      logSearchServer(validatedQuery, undefined, undefined, results.length, userId)
        .catch(err => console.warn('Search logging failed:', err))
    }

    return { posts: results }
  } catch (error) {
    console.error('Server error searching posts:', error)
    return { posts: [], error: 'Server error occurred' }
  }
}

export async function searchPostsInCategoryAction(query: string, categoryId: string, userId?: string): Promise<SearchResult> {
  try {
    const supabase = await createClient()

    // Validate using Zod schema
    const validationResult = searchSchema.safeParse({ query, categoryId })
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message)
      return { posts: [], error: errorMessages[0] }
    }

    const validatedData = validationResult.data

    // Get category name for analytics
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', validatedData.categoryId)
      .single()

    const categoryName = category?.name

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
    const searchCondition = buildSearchConditions(validatedData.query, categoryName)
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
      .or(searchCondition)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching posts in category:', error)
      return { posts: [], error: 'Failed to search posts' }
    }

    const results = posts || []

    // Log search analytics (async, don't block response)
    if (validatedData.query && validatedData.query.length >= 3) {
      logSearchServer(validatedData.query, validatedData.categoryId, categoryName, results.length, userId)
        .catch(err => console.warn('Search logging failed:', err))
    }

    return { posts: results }
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

export async function getSearchSuggestionsAction(
  categoryId?: string,
  categoryName?: string
): Promise<SearchSuggestionsResult> {
  try {
    const suggestions = await getSearchSuggestionsServer(categoryId, categoryName)
    return {
      popular: suggestions.popular,
      trending: suggestions.trending,
      combined: suggestions.combined
    }
  } catch (error) {
    console.error('Server error fetching search suggestions:', error)
    return {
      popular: [],
      trending: [],
      combined: [],
      error: 'Failed to fetch search suggestions'
    }
  }
}