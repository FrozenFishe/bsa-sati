// Browser tests for the web app at iPhone size, in light and dark mode.
const { defineConfig } = require('@playwright/test');

const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  use: { baseURL: 'http://127.0.0.1:8765/', ...phone },
  projects: [
    { name: 'light', use: { colorScheme: 'light' } },
    { name: 'dark', use: { colorScheme: 'dark' } }
  ],
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1', url: 'http://127.0.0.1:8765/', reuseExistingServer: !process.env.CI, stderr: 'ignore' }
});
