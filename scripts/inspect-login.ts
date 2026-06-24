/**
 * Script de diagnóstico: accede a la URL real, captura el HTML del login
 * y extrae los selectores reales del formulario.
 * Ejecutar con:  npx ts-node scripts/inspect-login.ts
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://huellasdelcatatumbo.com';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`\nConectando a ${BASE_URL}/login …`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30_000 });

  // Captura de pantalla del login
  const outDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: path.join(outDir, 'login-page.png'), fullPage: true });
  console.log('Screenshot guardado en scripts/output/login-page.png');

  // Extraer información de todos los inputs del formulario
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button, select, textarea')).map(el => ({
      tag: el.tagName.toLowerCase(),
      type: (el as HTMLInputElement).type ?? '',
      id: el.id,
      name: (el as HTMLInputElement).name ?? '',
      placeholder: (el as HTMLInputElement).placeholder ?? '',
      className: el.className,
      dataTestId: el.getAttribute('data-testid') ?? '',
      ariaLabel: el.getAttribute('aria-label') ?? '',
      textContent: el.textContent?.trim().substring(0, 50) ?? '',
    }));
  });

  console.log('\n═══ ELEMENTOS DEL FORMULARIO DE LOGIN ═══');
  inputs.forEach((el, i) => console.log(`[${i}]`, JSON.stringify(el)));

  // Guardar HTML completo
  const html = await page.content();
  fs.writeFileSync(path.join(outDir, 'login-page.html'), html, 'utf-8');
  console.log('\nHTML guardado en scripts/output/login-page.html');

  // Intentar login y capturar el resultado
  console.log('\nProbando login con super_admin …');
  try {
    // Selectores confirmados por el diagnóstico del DOM real
    const userInput = page.locator('input[name="username"]');
    await userInput.fill(process.env.ADMIN_USER ?? 'super_admin');
    console.log('  ✓ Campo usuario (name="username") llenado');

    const passInput = page.locator('input[type="password"]');
    await passInput.fill(process.env.ADMIN_PASS ?? '');
    console.log('  ✓ Campo contraseña llenado');

    // Botón confirmado: id="login_btn", texto "Login"
    await page.locator('#login_btn').click();
    console.log('  ✓ Clic en #login_btn');

    await page.waitForLoadState('networkidle', { timeout: 15_000 });
    const urlDespues = page.url();
    console.log(`  URL después del login: ${urlDespues}`);

    await page.screenshot({ path: path.join(outDir, 'after-login.png'), fullPage: true });
    console.log('  Screenshot post-login: scripts/output/after-login.png');

    // Extraer menú lateral
    const menuItems = await page.evaluate(() =>
      Array.from(document.querySelectorAll('nav a, aside a, .sidebar a, .side-menu a, [class*="menu"] a, [class*="nav"] a')).map(a => ({
        text: a.textContent?.trim(),
        href: (a as HTMLAnchorElement).href,
        class: a.className,
      }))
    );
    console.log('\n═══ ELEMENTOS DEL MENÚ LATERAL ═══');
    menuItems.slice(0, 20).forEach((m, i) => console.log(`[${i}]`, JSON.stringify(m)));
    fs.writeFileSync(path.join(outDir, 'menu-items.json'), JSON.stringify(menuItems, null, 2), 'utf-8');

    // HTML del dashboard
    const dashHtml = await page.content();
    fs.writeFileSync(path.join(outDir, 'dashboard.html'), dashHtml, 'utf-8');
    console.log('HTML del dashboard guardado en scripts/output/dashboard.html');

  } catch (err) {
    console.error('  ✗ Error en el flujo de login:', err);
    await page.screenshot({ path: path.join(outDir, 'login-error.png'), fullPage: true });
  }

  await browser.close();
  console.log('\nDiagnóstico completado.');
}

main().catch(console.error);
