import { test, expect } from '@playwright/test';

test('debug homepage content', async ({ page }) => {
  // Listen for console messages
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for page errors
  const pageErrors: string[] = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for React to hydrate
  await page.waitForTimeout(3000);
  
  // Check the page title
  const title = await page.title();
  console.log('=== PAGE TITLE ===');
  console.log(title);
  
  // Check what's actually visible on the page
  const bodyText = await page.locator('body').textContent();
  console.log('=== VISIBLE TEXT (first 500 chars) ===');
  console.log(bodyText?.substring(0, 500));
  
  // Check if we have the expected main content
  const h1Elements = await page.locator('h1').all();
  console.log('=== H1 ELEMENTS ===');
  for (const h1 of h1Elements) {
    console.log(await h1.textContent());
  }
  
  // Check for specific elements we expect
  console.log('=== EXPECTED ELEMENTS ===');
  console.log('Community Bulletin Board header:', await page.locator('text=Community Bulletin Board').count());
  console.log('Category cards:', await page.locator('[data-testid="category-card"]').count());
  console.log('Login button:', await page.locator('text=Sign in with Facebook').count());
  
  // Check console logs
  console.log('=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));
  
  // Check page errors
  console.log('=== PAGE ERRORS ===');
  pageErrors.forEach(error => console.log(error));
  
  // Check network requests
  const responses: string[] = [];
  page.on('response', response => {
    if (!response.url().includes('static') && !response.url().includes('chunk')) {
      responses.push(`${response.status()} ${response.url()}`);
    }
  });
  
  await page.waitForTimeout(1000);
  console.log('=== NETWORK RESPONSES ===');
  responses.forEach(response => console.log(response));
});