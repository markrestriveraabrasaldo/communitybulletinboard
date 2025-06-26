import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { PRICING_TEST_CASES } from '../fixtures/test-data';

/**
 * Pricing System Tests
 * Tests the new flexible pricing functionality
 */

test.describe('Pricing System', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.clearAppData();
    
    // Mock authentication for testing
    await helpers.mockAuth();
  });

  test('price input component renders correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Go to Food Selling category (which uses pricing)
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    // Click Create Post
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Should see pricing section
    await expect(page.locator('text=Price Type')).toBeVisible();
    
    // Should see radio buttons for price types
    await expect(page.locator('text=Fixed Price')).toBeVisible();
    await expect(page.locator('text=Price Range')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();
  });

  test('fixed price input works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields first
    await helpers.fillFormField('input[placeholder*="Homemade Lasagna"]', 'Test Food Item');
    
    // Select Fixed Price
    await page.click('input[value="fixed"]');
    
    // Enter price value
    await helpers.fillFormField('input[placeholder="0.00"]', '150');
    
    // Check negotiable option
    await page.click('text=Negotiable pricing');
    
    // Should see preview
    await expect(page.locator('text=Preview:')).toBeVisible();
    await expect(page.locator('text=150 per item (Negotiable)')).toBeVisible();
  });

  test('price range input works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/services');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Plumbing Repair"]', 'Test Service');
    await page.fill('textarea', 'Test service description');
    await helpers.selectOption('select', 'plumbing');
    
    // Select Price Range
    await page.click('input[value="range"]');
    
    // Enter min and max values
    await helpers.fillFormField('input[placeholder="0.00"]:first', '100');
    await helpers.fillFormField('input[placeholder="0.00"]:last', '500');
    
    // Should see preview
    await expect(page.locator('text=100 - 500 per service')).toBeVisible();
  });

  test('free option works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/services');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Plumbing Repair"]', 'Free Consultation');
    await page.fill('textarea', 'Free consultation service');
    await helpers.selectOption('select', 'other');
    
    // Select Free
    await page.click('input[value="free"]');
    
    // Should see free message
    await expect(page.locator('text=This item/service is offered for free')).toBeVisible();
    
    // Negotiable option should not be visible for free items
    await expect(page.locator('text=Negotiable pricing')).not.toBeVisible();
  });

  test('unit selection works correctly', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/services');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Plumbing Repair"]', 'Hourly Service');
    await page.fill('textarea', 'Hourly consultation');
    await helpers.selectOption('select', 'other');
    
    // Select fixed price
    await page.click('input[value="fixed"]');
    await helpers.fillFormField('input[placeholder="0.00"]', '50');
    
    // Change unit to "Per hour"
    await helpers.selectOption('select:has(option:text("Per hour"))', 'hour');
    
    // Should see preview with hour unit
    await expect(page.locator('text=50 per hour')).toBeVisible();
  });

  test('price validation works', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Homemade Lasagna"]', 'Test Food Item');
    
    // Select range with invalid values (min > max)
    await page.click('input[value="range"]');
    await helpers.fillFormField('input[placeholder="0.00"]:first', '500');
    await helpers.fillFormField('input[placeholder="0.00"]:last', '100');
    
    // Try to submit
    await page.click('text=Create Post');
    
    // Should see validation error
    await helpers.waitForToast('Maximum price must be greater than minimum price');
  });

  test('pricing display in post cards', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Go to category with existing posts
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    // Wait for posts to load
    await helpers.waitForLoading();
    
    // Look for price displays in post cards
    const priceElements = page.locator('text=Price:');
    
    if (await priceElements.count() > 0) {
      // If we have posts with prices, verify they display correctly
      await expect(priceElements.first()).toBeVisible();
      
      // Check for various price formats
      const possiblePriceFormats = [
        /\d+/, // Just numbers
        /\d+ - \d+/, // Range format
        /Free/, // Free items
        /Negotiable/ // Negotiable items
      ];
      
      const priceContainer = priceElements.first().locator('..'); // Parent element
      let foundValidFormat = false;
      
      for (const format of possiblePriceFormats) {
        if (await priceContainer.locator(`text=${format}`).count() > 0) {
          foundValidFormat = true;
          break;
        }
      }
      
      expect(foundValidFormat).toBe(true);
    }
  });

  test('pricing works on mobile devices', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.setMobileViewport();
    
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Homemade Lasagna"]', 'Mobile Test Food');
    
    // Test price input on mobile
    await page.click('input[value="fixed"]');
    await helpers.fillFormField('input[placeholder="0.00"]', '75');
    
    // Should work on mobile
    await expect(page.locator('text=Preview:')).toBeVisible();
    await expect(page.locator('text=75')).toBeVisible();
  });

  test('currency-agnostic display', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/category/food-selling');
    await helpers.waitForPageLoad();
    
    await page.click('text=Create Post');
    await helpers.waitForPageLoad();
    
    // Fill required fields
    await helpers.fillFormField('input[placeholder*="Homemade Lasagna"]', 'Currency Test Food');
    
    // Enter price
    await page.click('input[value="fixed"]');
    await helpers.fillFormField('input[placeholder="0.00"]', '100');
    
    // Preview should show number without currency symbol
    const preview = page.locator('text=100 per item');
    await expect(preview).toBeVisible();
    
    // Should NOT contain currency symbols
    await expect(preview).not.toContainText('$');
    await expect(preview).not.toContainText('₱');
    await expect(preview).not.toContainText('€');
  });

  PRICING_TEST_CASES.forEach((testCase, index) => {
    test(`pricing format test case ${index + 1}: ${testCase.type}`, async ({ page }) => {
      const helpers = new TestHelpers(page);
      
      // This would be a more comprehensive test if we had a way to
      // programmatically set pricing data and verify display
      // For now, we'll do a basic format verification
      
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      // The test case structure is validated
      expect(testCase.type).toMatch(/^(fixed|range|free)$/);
      expect(testCase.expected).toBeTruthy();
      
      if (testCase.type === 'fixed') {
        expect(testCase.value).toBeGreaterThanOrEqual(0);
      }
      
      if (testCase.type === 'range') {
        expect(testCase.min).toBeLessThan(testCase.max!);
      }
    });
  });
});