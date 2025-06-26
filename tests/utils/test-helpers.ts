import { Page, expect } from '@playwright/test';

/**
 * Utility functions for common test operations
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for React to finish rendering
   */
  async waitForReact() {
    // Wait for React hydration to complete
    await this.page.waitForFunction(() => {
      // Check if React has mounted
      return window.React !== undefined || document.querySelector('[data-reactroot]') !== null;
    }, { timeout: 10000 });
  }

  /**
   * Simulate mobile device
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate desktop device
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Check if element is visible and clickable
   */
  async isElementReady(selector: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
    return element;
  }

  /**
   * Fill form field with validation
   */
  async fillFormField(selector: string, value: string) {
    const field = await this.isElementReady(selector);
    await field.clear();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Select dropdown option
   */
  async selectOption(selector: string, value: string) {
    const dropdown = await this.isElementReady(selector);
    await dropdown.selectOption(value);
    await expect(dropdown).toHaveValue(value);
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message?: string) {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    
    if (message) {
      await expect(toast).toContainText(message);
    }
    
    return toast;
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];
    
    // Set up listener to capture future errors
    const errorListener = (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    };
    
    this.page.on('console', errorListener);
    
    // Wait a moment to capture any immediate errors
    await this.page.waitForTimeout(100);
    
    // Remove listener to avoid duplicates
    this.page.off('console', errorListener);

    return errors;
  }

  /**
   * Mock authentication for testing
   */
  async mockAuth(userData = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  }) {
    await this.page.addInitScript((user) => {
      // Mock Supabase auth
      (window as any).mockUser = user;
      
      // Mock localStorage auth state
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user,
        session: { access_token: 'mock-token' }
      }));
    }, userData);
  }

  /**
   * Clear all application data
   */
  async clearAppData() {
    try {
      await this.page.evaluate(() => {
        // Check if localStorage is accessible
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      });
    } catch (error) {
      // Silently handle cases where localStorage is not accessible (e.g., before navigation)
      // This is normal when called before page.goto()
    }
  }

  /**
   * Wait for specific text to appear
   */
  async waitForText(text: string, timeout = 10000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Check if page has loaded successfully
   */
  async verifyPageLoad(expectedUrl?: string, expectedTitle?: string) {
    await this.waitForPageLoad();
    
    if (expectedUrl) {
      expect(this.page.url()).toContain(expectedUrl);
    }
    
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle));
    }
  }

  /**
   * Simulate slow network conditions
   */
  async setSlowNetwork() {
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });
  }

  /**
   * Upload file to input
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Verify pricing display
   */
  async verifyPricing(expectedText: string) {
    const priceElement = this.page.locator('[data-testid="price-display"]');
    await expect(priceElement).toContainText(expectedText);
  }

  /**
   * Wait for loading states to complete
   */
  async waitForLoading() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 })
      .catch(() => {}); // Ignore if no spinner exists
    
    // Wait for loading text to disappear
    await this.page.waitForSelector('text=Loading...', { state: 'detached', timeout: 10000 })
      .catch(() => {}); // Ignore if no loading text exists
  }
}