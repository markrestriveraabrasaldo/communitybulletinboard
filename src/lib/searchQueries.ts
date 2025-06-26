import { createClient } from '@/lib/supabase-client'
import { PostWithCategory } from '@/types/database'
import { buildSearchConditions, sanitizeSearchQuery } from '@/utils/searchUtils'
import { logSearch } from '@/lib/searchAnalytics'

/**
 * Search posts across all categories
 */
export async function searchAllPosts(
  query: string,
  limit: number = 20,
  userId?: string
): Promise<PostWithCategory[]> {
  const supabase = createClient()
  const sanitizedQuery = sanitizeSearchQuery(query)
  
  if (!sanitizedQuery) {
    // Return all posts if no search query
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data || []
  }

  // Build search conditions for all fields
  const searchCondition = buildSearchConditions(sanitizedQuery)
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .or(searchCondition)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Search error:', error)
    return []
  }

  const results = data || []
  
  // Only log intentional searches (not every keystroke)
  if (sanitizedQuery && sanitizedQuery.length >= 4) {
    logSearch(sanitizedQuery, undefined, undefined, results.length, userId)
      .catch(err => console.warn('Search logging failed:', err))
  }

  return results
}

/**
 * Search posts within a specific category
 */
export async function searchPostsInCategory(
  query: string,
  categoryId: string,
  categoryName: string,
  limit: number = 20,
  userId?: string
): Promise<PostWithCategory[]> {
  const supabase = createClient()
  const sanitizedQuery = sanitizeSearchQuery(query)
  
  if (!sanitizedQuery) {
    // Return all posts in category if no search query
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data || []
  }

  // Build category-specific search conditions
  const searchCondition = buildSearchConditions(sanitizedQuery, categoryName)
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('category_id', categoryId)
    .or(searchCondition)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Category search error:', error)
    return []
  }

  const results = data || []
  
  // Only log intentional searches (not every keystroke)
  if (sanitizedQuery && sanitizedQuery.length >= 4) {
    logSearch(sanitizedQuery, categoryId, categoryName, results.length, userId)
      .catch(err => console.warn('Search logging failed:', err))
  }

  return results
}

/**
 * Search posts with status filtering
 */
export async function searchPostsWithFilters(
  query: string,
  categoryId?: string,
  categoryName?: string,
  status?: string,
  limit: number = 20
): Promise<PostWithCategory[]> {
  const supabase = createClient()
  const sanitizedQuery = sanitizeSearchQuery(query)
  
  let queryBuilder = supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)

  // Apply category filter if provided
  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }

  // Apply status filter if provided
  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  // Apply search conditions if query provided
  if (sanitizedQuery) {
    const searchCondition = buildSearchConditions(sanitizedQuery, categoryName)
    queryBuilder = queryBuilder.or(searchCondition)
  }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Filtered search error:', error)
    return []
  }

  return data || []
}

/**
 * Get search suggestions based on existing posts
 */
export async function getSearchSuggestions(
  partialQuery: string,
  categoryId?: string,
  limit: number = 5
): Promise<string[]> {
  const supabase = createClient()
  
  if (!partialQuery || partialQuery.length < 2) return []

  let queryBuilder = supabase
    .from('posts')
    .select('title, description')

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }

  const { data } = await queryBuilder
    .or(`title.ilike.%${partialQuery}%, description.ilike.%${partialQuery}%`)
    .limit(limit * 2) // Get more to extract keywords

  if (!data) return []

  // Extract unique words that start with the partial query
  const suggestions = new Set<string>()
  const regex = new RegExp(`\\b(${partialQuery}\\w*)`, 'gi')

  data.forEach(post => {
    const text = `${post.title} ${post.description}`.toLowerCase()
    const matches = text.match(regex)
    if (matches) {
      matches.forEach(match => {
        if (match.length > partialQuery.length && match.length <= 20) {
          suggestions.add(match.toLowerCase())
        }
      })
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

/**
 * Count search results without fetching full data
 */
export async function countSearchResults(
  query: string,
  categoryId?: string,
  categoryName?: string,
  status?: string
): Promise<number> {
  const supabase = createClient()
  const sanitizedQuery = sanitizeSearchQuery(query)
  
  let queryBuilder = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (sanitizedQuery) {
    const searchCondition = buildSearchConditions(sanitizedQuery, categoryName)
    queryBuilder = queryBuilder.or(searchCondition)
  }

  const { count, error } = await queryBuilder

  if (error) {
    console.error('Count search error:', error)
    return 0
  }

  return count || 0
}