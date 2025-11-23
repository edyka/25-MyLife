const { test, expect } = require('@playwright/test');

test.describe('Viventiva Authentication Flow Debugging', () => {
  let consoleMessages = [];
  let consoleErrors = [];
  let consoleWarnings = [];
  let networkRequests = [];
  let networkFailures = [];

  test.beforeEach(async ({ page }) => {
    // Reset arrays for each test
    consoleMessages = [];
    consoleErrors = [];
    consoleWarnings = [];
    networkRequests = [];
    networkFailures = [];

    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();

      consoleMessages.push({ type, text, timestamp: new Date().toISOString() });

      if (type === 'error') {
        consoleErrors.push({ text, timestamp: new Date().toISOString() });
      } else if (type === 'warning') {
        consoleWarnings.push({ text, timestamp: new Date().toISOString() });
      }

      console.log(`[${type.toUpperCase()}] ${text}`);
    });

    // Capture network requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('api')) {
        networkRequests.push({
          url,
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Capture network failures
    page.on('requestfailed', (request) => {
      networkFailures.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
      console.log(`[NETWORK FAILURE] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Capture response errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkFailures.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
        console.log(`[HTTP ERROR] ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Initial page load and authentication state', async ({ page }) => {
    console.log('\n=== TASK 1 & 2: Navigate and check initial screen ===');

    // Navigate to the app
    await page.goto('http://localhost:3000/');

    // Wait for initial load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: '/Users/EdoM1/Documents/25 MyLife/tests/screenshots/01-initial-load.png', fullPage: true });

    // Check what's visible on screen
    const pageTitle = await page.title();
    console.log(`Page Title: ${pageTitle}`);

    // Check for login elements
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
    const hasLoginButton = await page.getByRole('button', { name: /login|sign in|prijavite/i }).count() > 0;

    console.log(`Has Login Form: ${hasLoginForm}`);
    console.log(`Has Login Button: ${hasLoginButton}`);

    // Check for main app elements
    const hasAppContent = await page.locator('[data-testid], .app-content, .dashboard, .mood-palette').count() > 0;
    console.log(`Has App Content: ${hasAppContent}`);

    // Determine current state
    if (hasLoginForm || hasLoginButton) {
      console.log('✓ Current State: LOGIN SCREEN');
    } else if (hasAppContent) {
      console.log('✓ Current State: MAIN APP SCREEN (User appears logged in)');
    } else {
      console.log('⚠ Current State: UNKNOWN - Taking screenshot for inspection');
    }
  });

  test('Console errors and warnings check', async ({ page }) => {
    console.log('\n=== TASK 3: Check browser console ===');

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`\nTotal Console Messages: ${consoleMessages.length}`);
    console.log(`Total Errors: ${consoleErrors.length}`);
    console.log(`Total Warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n🔴 CONSOLE ERRORS:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.timestamp}] ${error.text}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  CONSOLE WARNINGS:');
      consoleWarnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. [${warning.timestamp}] ${warning.text}`);
      });
    }

    // Save console output to file
    const consoleReport = {
      totalMessages: consoleMessages.length,
      errors: consoleErrors,
      warnings: consoleWarnings,
      allMessages: consoleMessages
    };

    await page.evaluate((report) => {
      console.log('=== CONSOLE REPORT ===');
      console.log(JSON.stringify(report, null, 2));
    }, consoleReport);
  });

  test('Network requests monitoring', async ({ page }) => {
    console.log('\n=== TASK 4: Monitor network requests ===');

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`\nTotal API Requests: ${networkRequests.length}`);
    console.log(`Total Network Failures: ${networkFailures.length}`);

    if (networkRequests.length > 0) {
      console.log('\n📡 API REQUESTS:');
      networkRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. [${req.timestamp}] ${req.method} ${req.url}`);
      });
    }

    if (networkFailures.length > 0) {
      console.log('\n🔴 NETWORK FAILURES:');
      networkFailures.forEach((fail, index) => {
        console.log(`  ${index + 1}. [${fail.timestamp}]`);
        console.log(`     URL: ${fail.url}`);
        console.log(`     Error: ${fail.failure || `HTTP ${fail.status} ${fail.statusText}`}`);
      });
    }
  });

  test('LocalStorage and SessionStorage inspection', async ({ page }) => {
    console.log('\n=== TASK 5: Check localStorage and sessionStorage ===');

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        const value = window.localStorage.getItem(key);
        items[key] = value;
      }
      return items;
    });

    // Get sessionStorage
    const sessionStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        const value = window.sessionStorage.getItem(key);
        items[key] = value;
      }
      return items;
    });

    console.log('\n💾 LOCAL STORAGE:');
    if (Object.keys(localStorage).length === 0) {
      console.log('  (empty)');
    } else {
      Object.entries(localStorage).forEach(([key, value]) => {
        const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    }

    console.log('\n💾 SESSION STORAGE:');
    if (Object.keys(sessionStorage).length === 0) {
      console.log('  (empty)');
    } else {
      Object.entries(sessionStorage).forEach(([key, value]) => {
        const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    }

    // Check for Supabase auth token
    const supabaseKeys = Object.keys(localStorage).filter(key =>
      key.includes('supabase') || key.includes('auth')
    );

    if (supabaseKeys.length > 0) {
      console.log('\n🔑 SUPABASE AUTH KEYS FOUND:');
      supabaseKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('\n⚠️  NO SUPABASE AUTH KEYS FOUND IN LOCALSTORAGE');
    }

    // Check for the logging_out flag
    const loggingOutFlag = sessionStorage['viventiva_logging_out'];
    if (loggingOutFlag !== undefined) {
      console.log(`\n🚪 LOGGING OUT FLAG: ${loggingOutFlag}`);
    }
  });

  test('Auto-logout monitoring (30 second watch)', async ({ page }) => {
    console.log('\n=== TASK 6, 7, 8: Monitor for auto-logout ===');

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Initial state check
    await page.waitForTimeout(2000);

    const initialUrl = page.url();
    const initialHasLogin = await page.locator('input[type="email"], input[type="password"]').count() > 0;

    console.log(`Initial URL: ${initialUrl}`);
    console.log(`Initial State: ${initialHasLogin ? 'LOGIN SCREEN' : 'LOGGED IN'}`);

    if (initialHasLogin) {
      console.log('\n⚠️  User is on login screen, cannot test auto-logout');
      return;
    }

    // Take initial screenshot
    await page.screenshot({ path: '/Users/EdoM1/Documents/25 MyLife/tests/screenshots/02-before-timeout.png', fullPage: true });

    // Monitor for changes every 5 seconds for 30 seconds
    console.log('\n⏱️  Starting 30-second monitoring period...');

    const checkInterval = 5000;
    const totalDuration = 30000;
    const checks = totalDuration / checkInterval;

    for (let i = 1; i <= checks; i++) {
      await page.waitForTimeout(checkInterval);

      const currentUrl = page.url();
      const hasLogin = await page.locator('input[type="email"], input[type="password"]').count() > 0;

      // Check storage for logging_out flag
      const loggingOutFlag = await page.evaluate(() =>
        window.sessionStorage.getItem('viventiva_logging_out')
      );

      console.log(`\n[${i * 5}s] Check ${i}/${checks}:`);
      console.log(`  URL: ${currentUrl}`);
      console.log(`  Has Login Form: ${hasLogin}`);
      console.log(`  Logging Out Flag: ${loggingOutFlag || 'not set'}`);

      if (hasLogin && !initialHasLogin) {
        console.log('\n🔴 AUTO-LOGOUT DETECTED!');
        console.log(`  Logged out at: ~${i * 5} seconds`);

        // Take screenshot at moment of logout
        await page.screenshot({
          path: `/Users/EdoM1/Documents/25 MyLife/tests/screenshots/03-after-logout-${i * 5}s.png`,
          fullPage: true
        });

        // Check what triggered it
        console.log('\n🔍 Checking for logout triggers...');

        // Check recent console messages
        const recentErrors = consoleErrors.slice(-5);
        if (recentErrors.length > 0) {
          console.log('Recent console errors:');
          recentErrors.forEach(err => console.log(`  - ${err.text}`));
        }

        // Check recent network failures
        const recentFailures = networkFailures.slice(-5);
        if (recentFailures.length > 0) {
          console.log('Recent network failures:');
          recentFailures.forEach(fail => console.log(`  - ${fail.url}`));
        }

        break;
      }
    }

    if (!await page.locator('input[type="email"], input[type="password"]').count() > 0) {
      console.log('\n✓ No auto-logout detected during 30-second monitoring period');
    }
  });

  test('Detect setTimeout/setInterval timers', async ({ page }) => {
    console.log('\n=== TASK 7: Detect timer-based auto-logout logic ===');

    // Inject code to intercept setTimeout and setInterval
    await page.addInitScript(() => {
      window.detectedTimers = [];

      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;

      window.setTimeout = function(callback, delay, ...args) {
        const stack = new Error().stack;
        window.detectedTimers.push({
          type: 'setTimeout',
          delay,
          stack: stack.split('\n').slice(2, 5).join('\n'),
          timestamp: new Date().toISOString()
        });
        return originalSetTimeout(callback, delay, ...args);
      };

      window.setInterval = function(callback, delay, ...args) {
        const stack = new Error().stack;
        window.detectedTimers.push({
          type: 'setInterval',
          delay,
          stack: stack.split('\n').slice(2, 5).join('\n'),
          timestamp: new Date().toISOString()
        });
        return originalSetInterval(callback, delay, ...args);
      };
    });

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get detected timers
    const timers = await page.evaluate(() => window.detectedTimers || []);

    console.log(`\n⏰ Detected ${timers.length} timer(s):\n`);

    timers.forEach((timer, index) => {
      console.log(`Timer ${index + 1}:`);
      console.log(`  Type: ${timer.type}`);
      console.log(`  Delay: ${timer.delay}ms`);
      console.log(`  Timestamp: ${timer.timestamp}`);
      console.log(`  Stack trace:\n${timer.stack}`);
      console.log('');
    });

    // Look for suspicious timers
    const suspiciousTimers = timers.filter(t =>
      t.delay >= 10000 && t.delay <= 60000
    );

    if (suspiciousTimers.length > 0) {
      console.log('⚠️  SUSPICIOUS TIMERS (potential auto-logout):');
      suspiciousTimers.forEach((timer, index) => {
        console.log(`  ${index + 1}. ${timer.type} with ${timer.delay}ms delay`);
      });
    }
  });

  test.afterEach(async ({ page }) => {
    // Generate final report
    console.log('\n\n=== FINAL DIAGNOSTIC REPORT ===');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    console.log(`Total Console Warnings: ${consoleWarnings.length}`);
    console.log(`Total Network Failures: ${networkFailures.length}`);
    console.log(`Total API Requests: ${networkRequests.length}`);

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      consoleErrors,
      consoleWarnings,
      networkFailures,
      networkRequests,
      summary: {
        totalErrors: consoleErrors.length,
        totalWarnings: consoleWarnings.length,
        totalNetworkFailures: networkFailures.length,
        totalApiRequests: networkRequests.length
      }
    };

    await page.evaluate((reportData) => {
      console.log('=== SAVING DIAGNOSTIC REPORT ===');
      console.log(JSON.stringify(reportData, null, 2));
    }, report);
  });
});
