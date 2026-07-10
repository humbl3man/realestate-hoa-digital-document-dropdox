import { test, expect } from '@playwright/test';

test.describe('Settings and Stripe', () => {
  test('should navigate to settings and display connect button', async ({ page }) => {
    await page.goto('/dashboard/settings');
    
    // Check if Settings page title is there
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Since our test user is given details_submitted = true via the mock in stripe.ts, 
    // it will show "Connected to Stripe" instead of "Connect Stripe".
    // We should assert that the Stripe integration section works.
    await expect(page.getByText('Payouts')).toBeVisible();
    await expect(page.getByText('Stripe account connected')).toBeVisible();
  });

  test('should display fee disclaimer', async ({ page }) => {
    await page.goto('/dashboard/settings');
    // We expect the fee disclaimer to be somewhere on the settings page
    // Example: "The platform retains a X% fee"
    await expect(page.getByText(/fee/i)).toBeVisible();
  });
});
