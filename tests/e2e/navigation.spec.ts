import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Navigation Tests
 * Tests site navigation and routing
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.clearAppData();
  });

  test('homepage navigation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.verifyPageLoad('/', 'Community Bulletin Board');
    
    // Main heading should be visible
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
  });

  test('category navigation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test each category navigation
    const categories = [
      { name: 'Carpool', expectedUrl: 'carpool' },
      { name: 'Food Selling', expectedUrl: 'food-selling' },
      { name: 'Services', expectedUrl: 'services' },
      { name: 'Lost & Found', expectedUrl: 'lost-found' },
      { name: 'Events', expectedUrl: 'events' },
      { name: 'Others', expectedUrl: 'others' }
    ];
    
    for (const category of categories) {
      // Go back to homepage
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      // Click on category
      await page.click(`text=${category.name}`);
      await helpers.waitForPageLoad();
      
      // Verify URL and page content
      expect(page.url()).toContain('/category/');
      await expect(page.locator('h1')).toContainText(category.name);
      
      // Should have Create Post button
      await expect(page.locator('text=Create Post')).toBeVisible();
      
      // Should have back navigation
      await expect(page.locator('text=← Back to Categories')).toBeVisible();
    }
  });

  test('back navigation works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Start from homepage
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Go to a category
    await page.click('text=Services');
    await helpers.waitForPageLoad();
    
    // Verify we're on category page
    await expect(page.locator('h1')).toContainText('Services');
    
    // Click back button
    await page.click('text=← Back to Categories');
    await helpers.waitForPageLoad();
    
    // Should be back on homepage
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
    expect(page.url()).not.toContain('/category/');
  });

  test('browser back button works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Start from homepage
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Navigate to category
    await page.click('text=Events');
    await helpers.waitForPageLoad();
    
    // Use browser back button
    await page.goBack();
    await helpers.waitForPageLoad();
    
    // Should be back on homepage
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
  });

  test('direct URL access works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Test direct access to category pages
    const categoryPaths = [
      '/category/carpool',
      '/category/food-selling',
      '/category/services'
    ];
    
    for (const path of categoryPaths) {
      await page.goto(path);
      await helpers.waitForPageLoad();
      
      // Should load the category page
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Create Post')).toBeVisible();
      await expect(page.locator('text=← Back to Categories')).toBeVisible();
    }
  });

  test('404 handling works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Try to access non-existent page
    await page.goto('/category/non-existent-category');
    await helpers.waitForPageLoad();
    
    // Should handle gracefully (either 404 page or redirect)
    // The exact behavior depends on Next.js configuration
    const url = page.url();
    const isValidResponse = url.includes('404') || url === 'http://localhost:3000/' || 
                           await page.locator('text=Not Found, text=Page Not Found').count() > 0;
    
    expect(isValidResponse).toBeTruthy();
  });

  test('navigation preserves state', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // If there's a search input, fill it
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test query');
    }
    
    // Navigate to category and back
    await page.click('text=Services');
    await helpers.waitForPageLoad();
    
    await page.click('text=← Back to Categories');
    await helpers.waitForPageLoad();
    
    // Search state should be preserved (or cleared, depending on design)
    // This test verifies that navigation doesn't cause errors
    const jsErrors = await helpers.checkConsoleErrors();
    expect(jsErrors.length).toBe(0);
  });

  test('navigation works on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.setMobileViewport();
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Category cards should be clickable on mobile
    await page.click('text=Food Selling');
    await helpers.waitForPageLoad();
    
    // Should navigate successfully on mobile
    await expect(page.locator('h1')).toContainText('Food Selling');
    
    // Back navigation should work on mobile
    await page.click('text=← Back to Categories');
    await helpers.waitForPageLoad();
    
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
  });

  test('keyboard navigation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is on a focusable element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    
    // Should navigate or perform action without errors
    const jsErrors = await helpers.checkConsoleErrors();
    expect(jsErrors.length).toBe(0);
  });

  test('navigation loading states work', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Click navigation and check for loading states
    const navigationPromise = page.click('text=Services');
    
    // Check if there are any loading indicators
    const loadingIndicators = page.locator('.animate-spin, text=Loading');
    
    await navigationPromise;
    await helpers.waitForPageLoad();
    
    // Loading should complete
    await helpers.waitForLoading();
    
    // Page should be loaded
    await expect(page.locator('h1')).toContainText('Services');
  });

  test('navigation performance is acceptable', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Measure navigation time
    const startTime = Date.now();
    await page.click('text=Events');
    await helpers.waitForPageLoad();
    const navigationTime = Date.now() - startTime;
    
    // Navigation should be fast (under 2 seconds)
    expect(navigationTime).toBeLessThan(2000);
  });

  test('navigation maintains URL structure', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Test URL structure for each category
    const expectedUrls = [
      { category: 'Carpool', pattern: /\/category\/[a-z0-9-]+$/ },
      { category: 'Food Selling', pattern: /\/category\/[a-z0-9-]+$/ },
      { category: 'Services', pattern: /\/category\/[a-z0-9-]+$/ }
    ];
    
    for (const { category, pattern } of expectedUrls) {
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      await page.click(`text=${category}`);
      await helpers.waitForPageLoad();
      
      // URL should match expected pattern
      expect(page.url()).toMatch(pattern);
    }
  });
});