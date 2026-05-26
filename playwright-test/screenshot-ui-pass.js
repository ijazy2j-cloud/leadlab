const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Login page screenshot (no auth needed)
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'ui-pass-login.png') });

  // Set auth using the real user ID from the seeded DB
  await page.evaluate(() => localStorage.setItem('userId', 'cmpha9ls7000n7kpsrez2k7fy'));

  // 2. Dashboard
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(__dirname, 'ui-pass-dashboard.png') });

  // 3. 4Qs form
  await page.goto('http://localhost:5173/practice/4qs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'ui-pass-4qs.png'), fullPage: true });

  // 4. My Practice board view
  await page.goto('http://localhost:5173/my-practice');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const boardBtn = page.getByRole('button', { name: 'Board' });
  if (await boardBtn.count() > 0) await boardBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'ui-pass-board.png') });

  await browser.close();
  console.log('Done.');
})();
