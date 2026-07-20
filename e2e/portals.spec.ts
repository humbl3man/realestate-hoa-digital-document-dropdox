import { test, expect } from '@playwright/test';

test.describe('Portals Management', () => {
  // Generate a random string to avoid duplicate slugs in parallel test runs
  const runId = Math.random().toString(36).substring(7);

  test.beforeEach(async ({ page }) => {
    // Intercept Supabase upload API calls in case we upload a file
    await page.route('**/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        json: { success: true, url: 'https://mock-supabase.co/storage/v1/object/public/hoa-documents/mock-file.pdf' }
      });
    });
  });

  test('should open Create Portal dialog and handle validation errors', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if we're on the dashboard
    await expect(page.getByRole('heading', { name: 'Portal Manager' })).toBeVisible();
    
    // Open dialog
    await page.getByRole('button', { name: 'Create Portal' }).first().click();
    await expect(page.getByRole('heading', { name: 'Create Document Portal' })).toBeVisible();

    // Try submitting empty
    await page.getByRole('button', { name: 'Create Portal', exact: true }).click();
    // HTML5 validation will likely catch empty fields, but if it doesn't we might see an error.
  });

  test('should create a portal and redirect to management page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.getByRole('button', { name: 'Create Portal' }).first().click();
    
    const portalName = `Test Portal ${runId}`;
    
    await page.getByLabel('Portal Name').fill(portalName);
    // Slug should auto-fill to test-portal-[runId]
    await page.getByLabel('Price').fill('45.00');

    await page.getByRole('button', { name: 'Create Portal', exact: true }).click();

    // After creation, we expect a redirect to /dashboard/portals/[id]
    await page.waitForURL(/\/dashboard\/portals\/.+/);
    
    // The page should have a settings tab or similar
    await expect(page.getByText('Portal Settings', { exact: true })).toBeVisible();
    // Verify the name is there
    await expect(page.getByLabel('Portal Name')).toHaveValue(portalName);
  });

  test('should not allow duplicate portal slugs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create first one
    const duplicateSlug = `duplicate-${runId}`;
    await page.getByRole('button', { name: 'Create Portal' }).first().click();
    await page.getByLabel('Portal Name').fill('First Portal');
    await page.getByLabel('Public Link Slug').fill(duplicateSlug);
    await page.getByLabel('Price').fill('10.00');
    await page.getByRole('button', { name: 'Create Portal', exact: true }).click();
    
    await page.waitForURL(/\/dashboard\/portals\/.+/);

    // Go back and create second one with same slug
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Create Portal' }).first().click();
    await page.getByLabel('Portal Name').fill('Second Portal');
    await page.getByLabel('Public Link Slug').fill(duplicateSlug);
    await page.getByLabel('Price').fill('10.00');
    await page.getByRole('button', { name: 'Create Portal', exact: true }).click();

    // Expect an error from the server
    await expect(page.getByText('Slug is already taken. Please choose another one.')).toBeVisible();
  });
});
