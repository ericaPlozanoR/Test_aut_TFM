/**
 * Script de diagnóstico profundo: páginas específicas del portal donante.
 * Ejecutar: node scripts/explore-user-detail.js
 */
const { chromium } = require('playwright');

const BASE_URL = 'https://huellasdelcatatumbo.com';
const USER = 'antuan23';
const PASS = 'beta9023#';

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.locator('#login_btn').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

async function explorarPagina(page, url, nombre) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`=== ${nombre} (${url}) ===`);
  await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const urlReal = page.url();
  console.log('URL real:', urlReal);
  if (urlReal.includes('login')) { console.log('→ Redirige al login'); return; }

  const body = await page.locator('body').innerText();
  console.log('Body (primeros 1500 chars):\n', body.substring(0, 1500));

  const campos = await page.locator('input:not([type="hidden"]), select, textarea').evaluateAll(els =>
    els.map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, value: e.value?.substring(0,30) }))
  );
  if (campos.length) console.log('Campos:', JSON.stringify(campos, null, 2));

  const botones = await page.locator('button:visible, a.btn:visible').evaluateAll(els =>
    els.slice(0,12).map(e => ({ tag: e.tagName, id: e.id, class: e.className.substring(0,60), text: e.innerText?.trim().substring(0,40) }))
  );
  if (botones.length) console.log('Botones:', JSON.stringify(botones, null, 2));

  const tablas = await page.locator('table').count();
  if (tablas > 0) {
    const headers = await page.locator('table th').evaluateAll(els => els.map(e => e.innerText?.trim()));
    console.log('Tablas:', tablas, '| Headers:', headers);
    const filas = await page.locator('table tbody tr').count();
    console.log('Filas de datos:', filas);
    if (filas > 0) {
      const primeraFila = await page.locator('table tbody tr:first-child td').evaluateAll(els => els.map(e => e.innerText?.trim().substring(0,30)));
      console.log('Primera fila:', primeraFila);
    }
  }
}

async function explorar() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  await login(page);
  console.log('Logueado como:', USER, '| URL:', page.url());

  // ── SIDEBAR / LOGOUT ──────────────────────────────────────────────────────
  console.log('\n=== SIDEBAR Y LOGOUT ===');
  await page.goto(`${BASE_URL}/user-home`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const sidebarLinks = await page.locator('[class*="sidebar"] a, [class*="account"] a, [class*="panel"] a').evaluateAll(els =>
    els.map(e => ({ href: e.href, text: e.innerText?.trim(), class: e.className.substring(0,40) }))
  );
  console.log('Sidebar links:', JSON.stringify(sidebarLinks, null, 2));
  const logoutLink = await page.locator('a:has-text("Logout"), a:has-text("Log out"), button:has-text("Logout")').evaluateAll(els =>
    els.map(e => ({ tag: e.tagName, href: e.href, class: e.className.substring(0,60), text: e.innerText?.trim() }))
  );
  console.log('Logout elements:', JSON.stringify(logoutLink, null, 2));

  // ── PÁGINAS CLAVE ─────────────────────────────────────────────────────────
  await explorarPagina(page, '/user-home', 'DASHBOARD');
  await explorarPagina(page, '/user-home/donations', 'HISTORIAL DONACIONES');
  await explorarPagina(page, '/user-home/edit-profile', 'EDITAR PERFIL');
  await explorarPagina(page, '/user-home/change-password', 'CAMBIAR CONTRASEÑA');
  await explorarPagina(page, '/user-home/campaign-contribution-logs', 'CONTRIBUCIONES');
  await explorarPagina(page, '/user-home/reward-points', 'PUNTOS DE RECOMPENSA');
  await explorarPagina(page, '/user-home/support-tickets', 'TICKETS DE SOPORTE');
  await explorarPagina(page, '/user-home/events-booking', 'EVENTOS RESERVADOS');
  await explorarPagina(page, '/user-home/all/communities', 'COMUNIDADES');
  await explorarPagina(page, '/donation', 'CATÁLOGO DONACIONES PÚBLICAS');
  await explorarPagina(page, '/user-home/user-verify', 'VERIFICAR USUARIO');

  // ── BOTÓN DE DONACIÓN DESDE CAMPAÑA ──────────────────────────────────────
  console.log('\n=== PROCESO DE DONACIÓN ===');
  await page.goto(`${BASE_URL}/donation`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const campanasLinks = await page.locator('a[href*="/donation/"], a[href*="/campaign/"]').evaluateAll(els =>
    els.slice(0,5).map(e => ({ href: e.href, text: e.innerText?.trim().substring(0,50) }))
  );
  console.log('Links a campañas:', JSON.stringify(campanasLinks, null, 2));
  if (campanasLinks.length > 0) {
    const primeraUrl = campanasLinks[0].href;
    await page.goto(primeraUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    console.log('URL campaña:', page.url());
    const camposDonacion = await page.locator('input:not([type="hidden"]), select, button').evaluateAll(els =>
      els.slice(0,20).map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, class: e.className.substring(0,50), text: e.innerText?.trim().substring(0,40) }))
    );
    console.log('Campos/botones en página campaña:', JSON.stringify(camposDonacion, null, 2));
  }

  await browser.close();
  console.log('\n=== EXPLORACIÓN COMPLETADA ===');
}

explorar().catch(console.error);
