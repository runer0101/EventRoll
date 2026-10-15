import { expect, test, type Page } from '@playwright/test';

async function loginAsDemo(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('demo@eventroll.dev');
  await page.getByLabel('Contraseña').fill('eventroll-demo');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('the organizer signs in, sees the plan and checks a ticket in', async ({ page }) => {
  await loginAsDemo(page);
  await expect(page.getByText('Bienvenido')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activar PRO' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/dashboard.png', fullPage: true });

  await page.getByRole('link', { name: 'Sunset Fest 2026' }).click();
  await expect(page.getByRole('heading', { name: 'Tipos de entrada' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/manage-event.png', fullPage: true });

  await page.getByRole('link', { name: 'Abrir check-in' }).click();
  await expect(page).toHaveURL(/\/checkin\/demo\//);

  await page.getByLabel('Código QR del ticket').fill('DEMO-CHECKIN-0001');
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(
    page.getByText('Check-in registrado para Lucía Fernández.'),
  ).toBeVisible();

  await page.getByLabel('Código QR del ticket').fill('DEMO-CHECKIN-0001');
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(page.getByText('Este ticket ya fue usado')).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/checkin.png', fullPage: true });
});
