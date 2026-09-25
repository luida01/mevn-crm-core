import { defineConfig, devices } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(frontendDir, '..');
const apiPort = Number(process.env.E2E_API_PORT || 5100);
const shopPort = Number(process.env.E2E_SHOP_PORT || 5183);
const adminPort = Number(process.env.E2E_ADMIN_PORT || 5184);
const adminUsername = process.env.ADMIN_USERNAME || 'e2e-admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'e2e-password-only-for-tests';
const serverEnv = {
  ...process.env,
  PORT: String(apiPort),
  MONGODB_URI: process.env.E2E_MONGODB_URI || 'mongodb://127.0.0.1:27017/mangago_e2e',
  JWT_SECRET: process.env.JWT_SECRET || 'e2e-only-secret-with-at-least-32-characters',
  ADMIN_USERNAME: adminUsername,
  ADMIN_PASSWORD: adminPassword,
  CORS_ORIGINS: `http://127.0.0.1:${shopPort},http://127.0.0.1:${adminPort}`,
  STRIPE_SECRET_KEY: '',
  STRIPE_WEBHOOK_SECRET: ''
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${shopPort}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run dev', cwd: resolve(repoDir, 'backend'), url: `http://127.0.0.1:${apiPort}/health/ready`, reuseExistingServer: !process.env.CI, timeout: 120_000, env: serverEnv },
    { command: `npm run dev -- --host 127.0.0.1 --port ${shopPort} --strictPort`, cwd: frontendDir, url: `http://127.0.0.1:${shopPort}/`, reuseExistingServer: !process.env.CI, timeout: 120_000, env: { ...process.env, VITE_API_URL: `http://127.0.0.1:${apiPort}/api` } },
    { command: `npm run dev -- --host 127.0.0.1 --port ${adminPort} --strictPort`, cwd: resolve(repoDir, 'frontend-admin'), url: `http://127.0.0.1:${adminPort}/`, reuseExistingServer: !process.env.CI, timeout: 120_000, env: { ...process.env, VITE_API_URL: `http://127.0.0.1:${apiPort}/api`, VITE_SHOP_URL: `http://127.0.0.1:${shopPort}` } }
  ]
});
