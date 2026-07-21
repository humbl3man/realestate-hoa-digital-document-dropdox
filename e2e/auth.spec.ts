import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Clear any authenticated state for this suite
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the login form is rendered
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500); // Wait for React hydration
    
    await page.getByPlaceholder('name@example.com').fill('not-an-email');
    await page.getByRole('button', { name: /send magic link/i }).click({ force: true });

    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  });

  test('should submit successfully and show success message', async ({ page }) => {
    // Intercept the API call to mock the response
    await page.route('**/api/auth/**', async (route) => {
      const json = { data: { success: true }, error: null };
      await route.fulfill({ json });
    });

    await page.goto('/login');
    await page.waitForTimeout(500); // Wait for React hydration
    
    await page.getByPlaceholder('name@example.com').fill('e2e-test@example.com');
    await page.getByRole('button', { name: /send magic link/i }).click({ force: true });

    await expect(page.getByText('Check your email')).toBeVisible();
    await expect(page.getByText('e2e-test@example.com')).toBeVisible();
  });
});
