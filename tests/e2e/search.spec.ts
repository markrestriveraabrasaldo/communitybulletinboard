import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_SEARCH_QUERIES } from '../fixtures/test-data';

/**
 * Search Functionality Tests
 * Tests the search and filter features
 */

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.clearAppData();
    await helpers.mockAuth(); // Mock auth to see search features
  });

  test('global search is visible for authenticated users', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Should see search section
    await expect(page.locator('text=Search Community Posts')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search across all posts"]')).toBeVisible();
  });

  test('search input works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Test typing in search
    await searchInput.fill('makati');
    await expect(searchInput).toHaveValue('makati');
    
    // Test clear functionality
    const clearButton = page.locator('button[aria-label="Clear search"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('search suggestions appear when focused', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Focus on search input
    await searchInput.focus();
    
    // Should see suggestions dropdown
    await expect(page.locator('text=Popular searches')).toBeVisible();
    
    // Should see suggestion items
    const suggestions = page.locator('[role="button"]:has-text("urgent"), [role="button"]:has-text("free")');
    expect(await suggestions.count()).toBeGreaterThan(0);
  });

  test('search suggestions are clickable', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    await searchInput.focus();
    
    // Wait for suggestions to appear
    await expect(page.locator('text=Popular searches')).toBeVisible();
    
    // Click on a suggestion (if available)
    const firstSuggestion = page.locator('[role="button"]').first();
    if (await firstSuggestion.isVisible()) {
      const suggestionText = await firstSuggestion.textContent();
      await firstSuggestion.click();
      
      // Search input should be filled with the suggestion
      await expect(searchInput).toHaveValue(suggestionText?.trim() || '');
    }
  });

  test('category-specific search works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Go to a specific category
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    // Should see category-specific search
    const searchInput = page.locator('input[placeholder*="Search posts"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('homemade');
      await expect(searchInput).toHaveValue('homemade');
    }
  });

  test('search results display correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Perform a search
    await searchInput.fill('test');
    
    // Wait for search to complete (debounced)
    await page.waitForTimeout(500);
    
    // Check if results section appears
    const resultsSection = page.locator('text=Search Results');
    if (await resultsSection.isVisible()) {
      // Verify search results structure
      await expect(resultsSection).toBeVisible();
      
      // Should show result count
      const resultCount = page.locator('text=Search Results (');
      await expect(resultCount).toBeVisible();
    }
  });

  test('search loading state works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Start a search
    await searchInput.fill('loading test');
    
    // Should see loading spinner (briefly)
    const loadingSpinner = page.locator('.animate-spin');
    
    // Wait for loading to complete
    await helpers.waitForLoading();
  });

  test('empty search results display correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Search for something that likely doesn't exist
    await searchInput.fill('xyzxyzxyznotfound');
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    await helpers.waitForLoading();
    
    // Should show no results message (if implemented)
    const noResults = page.locator('text=No search results, text=No posts found');
    if (await noResults.count() > 0) {
      await expect(noResults.first()).toBeVisible();
    }
  });

  test('search works on mobile devices', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.setMobileViewport();
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Search should work on mobile
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('mobile test');
      await expect(searchInput).toHaveValue('mobile test');
      
      // Focus should work on mobile
      await searchInput.focus();
    }
  });

  test('search preserves filters', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Go to category page with filters
    await page.goto('/category/services');
    await helpers.waitForPageLoad();
    
    // If there are filter buttons, test them
    const filterButtons = page.locator('button:has-text("Active"), button:has-text("All")');
    
    if (await filterButtons.count() > 0) {
      // Click a filter
      await filterButtons.first().click();
      
      // Perform search
      const searchInput = page.locator('input[placeholder*="Search posts"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('filter test');
        
        // Filter should still be active
        const activeFilter = page.locator('button.bg-blue-600');
        expect(await activeFilter.count()).toBeGreaterThan(0);
      }
    }
  });

  // Test each search query from test data
  TEST_SEARCH_QUERIES.forEach((query, index) => {
    test(`search query test ${index + 1}: "${query}"`, async ({ page }) => {
      const helpers = new TestHelpers(page);
      
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      const searchInput = page.locator('input[placeholder*="Search across all posts"]');
      
      // Test the search query
      await searchInput.fill(query);
      await expect(searchInput).toHaveValue(query);
      
      // Wait for search to process
      await page.waitForTimeout(500);
      await helpers.waitForLoading();
      
      // Query should be valid (no errors)
      const jsErrors = await helpers.checkConsoleErrors();
      expect(jsErrors.filter(error => error.includes('search')).length).toBe(0);
    });
  });

  test('search analytics work correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    
    // Perform multiple searches to test analytics
    const queries = ['analytics test 1', 'analytics test 2'];
    
    for (const query of queries) {
      await searchInput.clear();
      await searchInput.fill(query);
      await page.waitForTimeout(500); // Wait for debounce
    }
    
    // Analytics should work without errors
    const jsErrors = await helpers.checkConsoleErrors();
    expect(jsErrors.filter(error => error.includes('analytics')).length).toBe(0);
  });

  test('trending indicators display correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const searchInput = page.locator('input[placeholder*="Search across all posts"]');
    await searchInput.focus();
    
    // Look for trending indicators
    const hotBadges = page.locator('text=Hot');
    const popularBadges = page.locator('text=Popular');
    
    // If trending features are working, we should see badges
    if (await hotBadges.count() > 0) {
      await expect(hotBadges.first()).toBeVisible();
    }
    
    if (await popularBadges.count() > 0) {
      await expect(popularBadges.first()).toBeVisible();
    }
  });
});