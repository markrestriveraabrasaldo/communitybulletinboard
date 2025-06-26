import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Smoke Tests - Critical user flows that must always work
 * These tests verify the core functionality is working
 */

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page first
    await page.goto('/');
    
    // Clear any existing state after navigation
    const helpers = new TestHelpers(page);
    await helpers.clearAppData();
  });

  test('homepage loads successfully', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await helpers.verifyPageLoad('/', 'Community Bulletin Board');
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
    await expect(page.locator('text=Your neighborhood hub')).toBeVisible();
    
    // Verify no console errors
    const errors = await helpers.checkConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('categories are displayed', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await helpers.waitForPageLoad();
    
    // Check that category cards are visible
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards).toHaveCount(6); // Expected 6 categories
    
    // Verify specific categories exist
    await expect(page.locator('[data-testid="category-card"]:has-text("Carpool")')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]:has-text("Food Selling")')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]:has-text("Services")')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]:has-text("Lost & Found")')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]:has-text("Events")')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]:has-text("Others")')).toBeVisible();
  });

  test('can navigate to category pages', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await helpers.waitForPageLoad();
    
    // Wait for category cards to be visible first
    await expect(page.locator('[data-testid="category-card"]').first()).toBeVisible();
    
    // Click on a category
    await page.click('text=Food Selling');
    await helpers.waitForPageLoad();
    
    // Verify we're on the category page
    await expect(page.locator('h1')).toContainText('Food Selling');
    await expect(page.locator('text=Create Post')).toBeVisible();
    
    // Verify URL changed
    expect(page.url()).toContain('/category/');
  });

  test('search functionality is accessible', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await helpers.waitForPageLoad();
    
    // Check for search input (should be visible for authenticated users)
    const searchSection = page.locator('text=Search Community Posts');
    const isVisible = await searchSection.isVisible();
    
    if (isVisible) {
      // If search is visible, test it
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
      
      // Test typing in search
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Set mobile viewport
    await helpers.setMobileViewport();
    
    await helpers.waitForPageLoad();
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Community Bulletin Board')).toBeVisible();
    
    // Category cards should still be visible on mobile
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards.first()).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    // Wait for back navigation link to be visible
    await expect(page.locator('text=← Back to Categories')).toBeVisible();
    
    // Test back navigation
    await page.click('text=← Back to Categories');
    await helpers.waitForPageLoad();
    
    // Should be back on homepage
    await expect(page.locator('h1')).toContainText('Community Bulletin Board');
  });

  test('no critical JavaScript errors', async ({ page }) => {
    const helpers = new TestHelpers(page);
    const jsErrors: string[] = [];
    
    // Listen for JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Start testing from current page (already on homepage)
    await helpers.waitForPageLoad();
    
    // Go to a category page
    await page.click('text=Services');
    await helpers.waitForPageLoad();
    
    // Check for errors
    expect(jsErrors).toHaveLength(0);
  });

  test('page loads within acceptable time', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    const startTime = Date.now();
    await page.goto('/');
    await helpers.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('essential accessibility features', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await helpers.waitForPageLoad();
    
    // Check for proper headings
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for alt text on images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
    }
    
    // Check for button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) { // Check first 5 buttons
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});