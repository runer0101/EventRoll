import { expect, test } from '@playwright/test';

test('the FREE plan blocks a second active event', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('demo@eventroll.dev');
  await page.getByLabel('Contraseña').fill('eventroll-demo');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto('/dashboard/eventos/nuevo');
  await page.getByLabel('Título').fill('Segundo evento E2E');
  await page
    .getByLabel('Descripción')
    .fill('Este evento no debería crearse con el plan FREE del organizador demo.');
  await page.getByLabel('Fecha y hora').fill('2027-03-20T20:00');
  await page.getByLabel('Lugar').fill('Sala E2E');
  await page.getByLabel('Capacidad').fill('50');
  await page.getByRole('button', { name: 'Crear evento' }).click();

  await expect(page.getByText(/Tu plan FREE permite 1 evento activo/)).toBeVisible();
});
