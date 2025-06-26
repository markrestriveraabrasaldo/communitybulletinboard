import { createClient } from '@/lib/supabase-client'

export interface SearchLog {
  id: string
  query: string
  category_id: string | null
  category_name: string | null
  user_id: string | null
  results_count: number
  searched_at: string
}

export interface PopularSearch {
  query: string
  search_count: number
  last_searched: string
  avg_results: number
}

/**
 * Log a search query for analytics and suggestions
 * Only logs meaningful queries (3+ characters, not just partial typing)
 */
export async function logSearch(
  query: string,
  categoryId?: string,
  categoryName?: string,
  resultsCount: number = 0,
  userId?: string
): Promise<void> {
  const trimmedQuery = query.trim().toLowerCase()
  
  // Only log meaningful queries
  if (!shouldLogQuery(trimmedQuery)) return

  const supabase = createClient()
  
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
    // Special handling for missing table
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('relation "search_logs" does not exist')) {
      console.warn('search_logs table not found - search logging disabled until migration is applied')
    } else {
      console.warn('Failed to log search:', errorMessage)
    }
  }
}

/**
 * Determine if a query should be logged based on quality criteria
 */
function shouldLogQuery(query: string): boolean {
  // Don't log empty queries
  if (!query) return false
  
  // More aggressive minimum length for quality
  if (query.length < 4) return false
  
  // Don't log queries that are just single repeated characters
  if (/^(.)\1+$/.test(query)) return false
  
  // Don't log queries that look like incomplete typing (all same character)
  if (query.split('').every(char => char === query[0])) return false
  
  // Don't log queries with only special characters or numbers
  if (/^[^a-zA-Z]*$/.test(query)) return false
  
  // Don't log common partial words that are likely incomplete typing
  const partialWords = ['mak', 'maka', 'makata', 'halo', 'hal', 'urgen', 'fre', 'ne']
  if (partialWords.some(partial => query.startsWith(partial) && query.length < partial.length + 3)) {
    return false
  }
  
  // Don't log if it's all consonants or all vowels (likely incomplete)
  const vowels = 'aeiouAEIOU'
  const hasVowel = query.split('').some(char => vowels.includes(char))
  const hasConsonant = query.split('').some(char => /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(char))
  
  if (!hasVowel || !hasConsonant) return false
  
  return true
}

/**
 * Get popular search suggestions for a specific category
 */
export async function getPopularSearches(
  categoryId?: string,
  limit: number = 8
): Promise<string[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('search_logs')
      .select('query')
      .gte('searched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .gt('results_count', 0) // Only include searches that returned results
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) {
      // If search_logs table doesn't exist, return empty array instead of erroring
      if (error.message?.includes('relation "search_logs" does not exist') || error.code === 'PGRST116') {
        console.warn('search_logs table not found - please run migration-search-logs.sql')
        return []
      }
      console.error('Error fetching popular searches:', error)
      return []
    }

    // Count occurrences and get most popular (with enhanced quality filtering)
    const queryCount: Record<string, number> = {}
    data?.forEach(log => {
      const q = log.query.trim()
      // Enhanced quality check
      if (shouldLogQuery(q)) {
        queryCount[q] = (queryCount[q] || 0) + 1
      }
    })

    // Sort by popularity and return top results
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query)
  } catch (error) {
    console.error('Error fetching popular searches:', error)
    return []
  }
}

/**
 * Get recent trending searches (searches with high recent activity)
 */
export async function getTrendingSearches(
  categoryId?: string,
  limit: number = 5
): Promise<string[]> {
  const supabase = createClient()
  
  try {
    // Get searches from last 24 hours
    let query = supabase
      .from('search_logs')
      .select('query, searched_at')
      .gte('searched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .gt('results_count', 0)
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) {
      // If search_logs table doesn't exist, return empty array instead of erroring
      if (error.message?.includes('relation "search_logs" does not exist') || error.code === 'PGRST116') {
        console.warn('search_logs table not found - please run migration-search-logs.sql')
        return []
      }
      console.error('Error fetching trending searches:', error)
      return []
    }

    // Count recent searches and calculate trend score
    const recentQueries: Record<string, { count: number, latestTime: number }> = {}
    
    data?.forEach(log => {
      const q = log.query.trim()
      const time = new Date(log.searched_at).getTime()
      
      // Enhanced quality check for trending searches
      if (shouldLogQuery(q)) {
        if (!recentQueries[q]) {
          recentQueries[q] = { count: 0, latestTime: 0 }
        }
        recentQueries[q].count += 1
        recentQueries[q].latestTime = Math.max(recentQueries[q].latestTime, time)
      }
    })

    // Calculate trend score (count * recency factor)
    const now = Date.now()
    return Object.entries(recentQueries)
      .map(([query, stats]) => {
        const recencyHours = (now - stats.latestTime) / (1000 * 60 * 60)
        const recencyFactor = Math.max(0, 24 - recencyHours) / 24 // Higher for more recent
        const trendScore = stats.count * recencyFactor
        return { query, trendScore }
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit)
      .map(item => item.query)
  } catch (error) {
    console.error('Error fetching trending searches:', error)
    return []
  }
}

/**
 * Get search suggestions combining popular and trending searches
 */
export async function getSearchSuggestions(
  categoryId?: string,
  categoryName?: string,
  limit: number = 8
): Promise<{ popular: string[], trending: string[], combined: string[] }> {
  try {
    const [popular, trending] = await Promise.all([
      getPopularSearches(categoryId, Math.ceil(limit * 0.7)), // 70% popular
      getTrendingSearches(categoryId, Math.ceil(limit * 0.3))  // 30% trending
    ])

    // Combine and deduplicate, prioritizing trending over popular
    const combined = [...trending]
    popular.forEach(query => {
      if (!combined.includes(query) && combined.length < limit) {
        combined.push(query)
      }
    })

    // If we don't have enough dynamic suggestions, fall back to static ones
    if (combined.length < 4) {
      const fallbackSuggestions = getFallbackSuggestions(categoryName)
      fallbackSuggestions.forEach(suggestion => {
        if (!combined.includes(suggestion) && combined.length < limit) {
          combined.push(suggestion)
        }
      })
    }

    return {
      popular,
      trending,
      combined: combined.slice(0, limit)
    }
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return {
      popular: [],
      trending: [],
      combined: getFallbackSuggestions(categoryName).slice(0, limit)
    }
  }
}

/**
 * Seed the database with high-quality search suggestions
 * Call this to populate with meaningful searches instead of waiting for user typing
 */
export async function seedQualitySearches(): Promise<void> {
  const supabase = createClient()
  
  const qualitySearches = [
    // Global searches
    { query: 'makati', category_id: null, category_name: null },
    { query: 'urgent', category_id: null, category_name: null },
    { query: 'available', category_id: null, category_name: null },
    { query: 'downtown', category_id: null, category_name: null },
    { query: 'fresh food', category_id: null, category_name: null },
    { query: 'cleaning service', category_id: null, category_name: null },
    { query: 'lost phone', category_id: null, category_name: null },
    { query: 'community event', category_id: null, category_name: null },
  ]
  
  try {
    // Insert quality searches with simulated usage
    for (const search of qualitySearches) {
      await supabase
        .from('search_logs')
        .insert({
          query: search.query,
          category_id: search.category_id,
          category_name: search.category_name,
          results_count: Math.floor(Math.random() * 5) + 1, // 1-5 results
          searched_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        })
    }
    console.log('Quality searches seeded successfully')
  } catch (error) {
    console.warn('Failed to seed quality searches:', error)
  }
}

/**
 * Fallback suggestions when dynamic data is insufficient
 */
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

/**
 * Clean up low-quality search logs (partial words, short queries)
 * Call this once to clean existing data
 */
export async function cleanUpSearchLogs(): Promise<void> {
  const supabase = createClient()
  
  try {
    // Delete logs with queries shorter than 3 characters
    await supabase
      .from('search_logs')
      .delete()
      .lt('char_length(query)', 3)
    
    // Delete logs with repeated characters only (like 'aaa', 'hhh')
    await supabase
      .from('search_logs')
      .delete()
      .like('query', 'a%')
      .like('query', '%a')
      .eq('char_length(query)', 1)
    
    // You can add more specific cleanup patterns here
    console.log('Search logs cleanup completed')
  } catch (error) {
    console.error('Failed to cleanup search logs:', error)
  }
}

/**
 * Get search analytics for admin dashboard (optional feature)
 */
export async function getSearchAnalytics(
  categoryId?: string,
  days: number = 7
): Promise<{
  totalSearches: number
  uniqueQueries: number
  avgResultsPerSearch: number
  topQueries: Array<{ query: string, count: number, avg_results: number }>
}> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('search_logs')
      .select('query, results_count')
      .gte('searched_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) throw error

    const queryStats: Record<string, { count: number, totalResults: number }> = {}
    let totalSearches = 0
    let totalResults = 0
    
    data?.forEach(log => {
      const q = log.query.trim()
      totalSearches++
      totalResults += log.results_count
      
      if (!queryStats[q]) {
        queryStats[q] = { count: 0, totalResults: 0 }
      }
      queryStats[q].count += 1
      queryStats[q].totalResults += log.results_count
    })

    const topQueries = Object.entries(queryStats)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avg_results: stats.totalResults / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalSearches,
      uniqueQueries: Object.keys(queryStats).length,
      avgResultsPerSearch: totalSearches > 0 ? totalResults / totalSearches : 0,
      topQueries
    }
  } catch (error) {
    console.error('Error fetching search analytics:', error)
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      avgResultsPerSearch: 0,
      topQueries: []
    }
  }
}