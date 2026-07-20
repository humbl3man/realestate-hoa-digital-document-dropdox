# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal.spec.ts >> Public Portal >> should display portal to public and allow checkout
- Location: e2e\public-portal.spec.ts:16:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Public Portal tk8iq')
Expected: visible
Error: strict mode violation: getByText('Public Portal tk8iq') resolved to 2 elements:
    1) <div data-slot="card-title" class="group-data-[size=sm]/card:text-sm text-3xl font-heading font-bold tracking-tight text-slate-900">Public Portal tk8iq</div> aka getByText('Public Portal tk8iq', { exact: true })
    2) <p>…</p> aka getByText('© 2026 Public Portal tk8iq')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Public Portal tk8iq')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img [ref=e7]
            - text: Official Document Portal
          - generic [ref=e10]: Public Portal tk8iq
          - generic [ref=e11]: Official document package for secure distribution and due diligence.
        - generic [ref=e12]:
          - generic [ref=e13]:
            - heading "Documents Included (0) 0 Bytes" [level=3] [ref=e14]:
              - generic [ref=e15]: Documents Included (0)
              - generic [ref=e16]: 0 Bytes
            - paragraph [ref=e17]: No files have been added to this bundle yet.
          - generic [ref=e18]:
            - generic [ref=e19]:
              - img [ref=e21]
              - generic [ref=e24]:
                - heading "Secure Access" [level=4] [ref=e25]
                - paragraph [ref=e26]: Time-limited download links via secure Stripe checkout.
            - generic [ref=e27]:
              - img [ref=e29]
              - generic [ref=e32]:
                - heading "Instant Delivery" [level=4] [ref=e33]
                - paragraph [ref=e34]: Link sent directly to your email instantly. No signup.
        - generic [ref=e35]:
          - generic [ref=e36]:
            - button "Purchase Bundle — $25.00" [disabled]:
              - text: Purchase Bundle — $25.00
              - img
          - generic [ref=e37]:
            - img [ref=e38]
            - generic [ref=e41]: Secure, encrypted checkout via Stripe
    - contentinfo [ref=e42]:
      - paragraph [ref=e43]: © 2026 Public Portal tk8iq
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e49] [cursor=pointer]:
    - img [ref=e50]
  - alert [ref=e54]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Public Portal', () => {
  4  |   const runId = Math.random().toString(36).substring(7);
  5  | 
  6  |   test.beforeEach(async ({ page }) => {
  7  |     // Intercept checkout API call
  8  |     await page.route('**/api/checkout', async (route) => {
  9  |       await route.fulfill({
  10 |         status: 200,
  11 |         json: { url: 'https://mock-stripe.com/checkout' }
  12 |       });
  13 |     });
  14 |   });
  15 | 
  16 |   test('should display portal to public and allow checkout', async ({ page }) => {
  17 |     // First create a portal
  18 |     await page.goto('/dashboard');
  19 |     await page.getByRole('button', { name: 'Create Portal' }).first().click();
  20 |     
  21 |     const portalName = `Public Portal ${runId}`;
  22 |     const slug = `public-${runId}`;
  23 |     
  24 |     await page.getByLabel('Portal Name').fill(portalName);
  25 |     await page.getByLabel('Public Link Slug').fill(slug);
  26 |     await page.getByLabel('Price').fill('25.00');
  27 |     await page.getByRole('button', { name: 'Create Portal', exact: true }).click();
  28 |     
  29 |     // Wait for the portal to be created and redirect to happen
  30 |     await page.waitForURL(/\/dashboard\/portals\/.+/);
  31 | 
  32 |     // Now navigate to the public portal URL directly
  33 |     await page.goto(`/p/${slug}`);
  34 | 
  35 |     // Verify it loads the public page
> 36 |     await expect(page.getByText(`${portalName}`)).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  37 |     await expect(page.getByText('$25.00')).toBeVisible();
  38 | 
  39 |     // Simulate clicking buy
  40 |     const buyButton = page.getByRole('button', { name: /Buy/i });
  41 |     if (await buyButton.isVisible()) {
  42 |       await buyButton.click();
  43 |       // It should navigate or do something (in this mock it might not navigate since it's intercepted or returns url)
  44 |       // We check if the request was made by ensuring no unhandled crash happens
  45 |     }
  46 |   });
  47 | });
  48 | 
```