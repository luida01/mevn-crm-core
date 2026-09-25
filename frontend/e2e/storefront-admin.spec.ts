import { expect, request, test, type APIRequestContext } from '@playwright/test';

const apiPort = Number(process.env.E2E_API_PORT || 5100);
const adminPort = Number(process.env.E2E_ADMIN_PORT || 5184);
const apiBase = `http://127.0.0.1:${apiPort}/api`;
const adminBase = `http://127.0.0.1:${adminPort}`;
const username = process.env.ADMIN_USERNAME || 'e2e-admin';
const password = process.env.ADMIN_PASSWORD || 'e2e-password-only-for-tests';
const mangaTitle = 'Playwright Checkout Manga';
let mangaId = '';
let apiContext: APIRequestContext;

test.beforeAll(async () => {
  apiContext = await request.newContext();
  const login = await apiContext.post(`${apiBase}/auth/login`, { data: { username, password } });
  expect(login.ok()).toBeTruthy();
  const { token } = await login.json() as { token: string };
  const created = await apiContext.post(`${apiBase}/mangas`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: mangaTitle, volume: 987, author: 'Test Author', genre: 'Testing', price: 12, rentalPrice: 0.75, stock: 3 }
  });
  expect(created.ok()).toBeTruthy();
  mangaId = (await created.json() as { _id: string })._id;
});

test.afterAll(async () => {
  if (mangaId && apiContext) {
    const login = await apiContext.post(`${apiBase}/auth/login`, { data: { username, password } });
    if (login.ok()) {
      const { token } = await login.json() as { token: string };
      await apiContext.delete(`${apiBase}/mangas/${mangaId}`, { headers: { Authorization: `Bearer ${token}` } });
    }
  }
  await apiContext?.dispose();
});

test('catalog adds purchase and rental of one volume to the mixed cart', async ({ page }) => {
  await page.goto('/catalogo');
  const search = page.getByRole('searchbox', { name: 'Buscar' });
  await search.fill(mangaTitle);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const mangaCard = page.getByRole('button', { name: new RegExp(mangaTitle) });
  await expect(mangaCard).toBeVisible();
  await mangaCard.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Añadir compra' }).click();
  await page.getByRole('link', { name: 'Ver carrito' }).click();
  await expect(page.getByRole('heading', { name: 'Tu carrito' })).toBeVisible();

  await page.getByRole('link', { name: 'Seguir explorando' }).click();
  await page.getByRole('searchbox', { name: 'Buscar' }).fill(mangaTitle);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(mangaTitle) }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Añadir alquiler' }).click();
  await page.getByRole('link', { name: 'Ver carrito' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(2);
  await expect(page.locator('.cart-line__type--purchase')).toBeVisible();
  await expect(page.locator('.cart-line__type--rental')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar al pago' }).click();
  await expect(page.getByRole('heading', { name: 'Completa tu pedido' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continuar a Stripe/ })).toBeDisabled();
  await expect(page.getByText(/faltan sus claves/i)).toBeVisible();
});

test('admin can authenticate and open the orders workspace', async ({ page }) => {
  await page.goto(`${adminBase}/login`);
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(`${adminBase}/`);
  await page.getByRole('link', { name: 'Pedidos' }).click();
  await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible();
  await expect(page.getByText('No hay pedidos para estos filtros.')).toBeVisible();
});
