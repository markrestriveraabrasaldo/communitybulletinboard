# Search Analytics System Backup

## Core Analytics Functions

### 1. Search Logging
**Function**: `logSearch()`
- Logs meaningful queries (4+ chars, quality filtering)
- Tracks: query, category, results count, user, timestamp
- Database: `search_logs` table
- Quality filters: no repeating chars, vowel+consonant check, no partials

### 2. Popular Searches
**Function**: `getPopularSearches()`
- Returns most searched terms (last 7 days)
- Only includes searches with results
- Enhanced quality filtering
- Category-specific or global

### 3. Trending Searches  
**Function**: `getTrendingSearches()`
- Returns high-activity searches (last 24 hours)
- Trend score = count × recency factor
- Recency factor: (24 - hours_ago) / 24

### 4. Combined Suggestions
**Function**: `getSearchSuggestions()`
- Combines 70% popular + 30% trending
- Fallback to static suggestions if insufficient data
- Returns: `{ popular: [], trending: [], combined: [] }`

### 5. Quality Control
**Function**: `shouldLogQuery()`
- Min 4 characters
- No repeated characters (aaa, hhh)
- Must have vowels AND consonants
- Excludes partial words and numbers-only
- Filters incomplete typing patterns

### 6. Fallback Suggestions
**Function**: `getFallbackSuggestions()`
- Category-specific static suggestions
- Used when dynamic data insufficient
- Per category: Carpool, Food, Services, Events, etc.

## Key Features to Preserve

### Visual Indicators
- **Hot badge**: Red background, trending searches
- **Popular badge**: Blue background, popular searches  
- **Hover effects**: Badges appear on hover for popular items

### Analytics Data Structure
```typescript
interface SearchLog {
  id: string
  query: string
  category_id: string | null
  category_name: string | null
  user_id: string | null
  results_count: number
  searched_at: string
}
```

### Quality Thresholds
- **Minimum query length**: 4 characters
- **Popular searches timeframe**: 7 days
- **Trending searches timeframe**: 24 hours
- **Suggestion limits**: 8 total (70% popular, 30% trending)

### Database Integration
- **Table**: `search_logs`
- **Migration**: `migration-search-logs.sql`
- **Cleanup**: `cleanup-search-logs.sql`

### Error Handling
- Graceful fallback when table missing
- Silent logging failures (don't disrupt UX)
- Fallback to static suggestions on errors

## Migration Requirements for Server Actions

### 1. Server-Side Analytics Integration
- Move `logSearch()` calls to server actions
- Integrate with search result processing
- Maintain async logging (don't block search)

### 2. Suggestions API
- Create server action for `getSearchSuggestions()`
- Support real-time suggestion loading
- Cache suggestions for performance

### 3. Quality Preservation
- Keep all quality filtering logic
- Maintain trending/popular algorithms
- Preserve fallback suggestion system

### 4. Visual Components
- Migrate hot/popular badges to server actions component
- Keep hover effects and visual indicators
- Maintain suggestion dropdown UI

## Critical Migration Points

1. **Don't lose analytics logging** during search execution
2. **Preserve all quality filters** and thresholds
3. **Keep suggestion algorithms** (trending + popular mix)
4. **Maintain visual indicators** (Hot/Popular badges)
5. **Support category-specific** suggestions and analytics
6. **Handle database errors** gracefully with fallbacks

## Files to Integrate
- `src/lib/searchAnalytics.ts` → Integrate with `src/lib/actions/search.ts`
- Analytics UI patterns from `SearchBar.tsx` → Merge into `SearchWithServerActions.tsx`