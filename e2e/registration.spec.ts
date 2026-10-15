import { expect, test } from '@playwright/test';

test('a visitor registers for an event and receives a QR ticket', async ({ page }) => {
  await page.goto('/demo');
  await expect(
    page.getByRole('banner').getByRole('heading', { name: 'Demo Events Co.' }),
  ).toBeVisible();

  await page.getByRole('link', { name: /Sunset Fest 2026/ }).click();
  await expect(page.getByRole('heading', { name: 'Sunset Fest 2026' })).toBeVisible();
  await expect(page.getByLabel('Tipo de ticket')).toContainText('$25.50');
  await page.screenshot({ path: 'docs/screenshots/public-event.png', fullPage: true });

  await page.getByLabel('Nombre').fill('E2E Tester');
  await page.getByLabel('Email').fill('e2e@example.com');
  await page.getByLabel('Tipo de ticket').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page.getByRole('heading', { name: '¡Registro exitoso!' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('QR Code:')).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/ticket.png', fullPage: true });
});
