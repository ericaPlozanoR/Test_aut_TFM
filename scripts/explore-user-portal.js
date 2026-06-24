/**
 * Script de diagnóstico: explora el portal del usuario donante (antuan23)
 * Descubre selectores reales, URLs y estructura de cada sección.
 * Ejecutar: node scripts/explore-user-portal.js
 */
const { chromium } = require('playwright');

const BASE_URL = 'https://huellasdelcatatumbo.com';
const USER     = 'antuan23';
const PASS     = 'beta9023#';

async function explorar() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page    = await browser.newPage();

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  console.log('\n=== LOGIN USUARIO DONANTE ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Detectar campos de login
  const campos = await page.locator('input').evaluateAll(els =>
    els.map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
  );
  console.log('Campos de login:', JSON.stringify(campos, null, 2));

  const botones = await page.locator('button, input[type="submit"]').evaluateAll(els =>
    els.map(e => ({ tag: e.tagName, type: e.type, id: e.id, class: e.className, text: e.innerText?.trim().substring(0,40) }))
  );
  console.log('Botones login:', JSON.stringify(botones, null, 2));

  // Autenticar — usar #login_btn directamente (confirmado en el DOM)
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.locator('#login_btn').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('\n=== POST-LOGIN ===');
  console.log('URL actual:', page.url());
  console.log('Title:', await page.title());

  // ── ESTRUCTURA DEL HOME ───────────────────────────────────────────────────
  console.log('\n=== ESTRUCTURA USER-HOME ===');
  const nav = await page.locator('nav, header, [class*="nav"], [class*="sidebar"], [class*="menu"]').evaluateAll(els =>
    els.slice(0,5).map(e => ({ tag: e.tagName, class: e.className.substring(0,60), text: e.innerText?.trim().substring(0,100) }))
  );
  console.log('Navegación:', JSON.stringify(nav, null, 2));

  const links = await page.locator('a[href*="user-home"], nav a, header a').evaluateAll(els =>
    els.map(e => ({ href: e.href, text: e.innerText?.trim().substring(0,40) }))
  );
  console.log('Links de navegación:', JSON.stringify(links, null, 2));

  // Secciones visibles en el home
  const secciones = await page.locator('h1, h2, h3, [class*="title"], [class*="header"]').evaluateAll(els =>
    els.slice(0,15).map(e => ({ tag: e.tagName, text: e.innerText?.trim().substring(0,60) }))
  );
  console.log('Secciones/Títulos:', JSON.stringify(secciones, null, 2));

  // ── BOTONES Y ACCIONES ────────────────────────────────────────────────────
  const botonesHome = await page.locator('button, a.btn, a[class*="btn"]').evaluateAll(els =>
    els.slice(0,20).map(e => ({ tag: e.tagName, href: e.href, class: e.className.substring(0,60), text: e.innerText?.trim().substring(0,40) }))
  );
  console.log('Botones/Acciones en home:', JSON.stringify(botonesHome, null, 2));

  // ── DONACIONES DEL USUARIO ────────────────────────────────────────────────
  console.log('\n=== SECCIÓN DONACIONES ===');
  const donacionesUrls = [
    '/user-home/donations',
    '/user-home/donation',
    '/user-home/my-donations',
    '/user-home/donate',
  ];
  for (const url of donacionesUrls) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const urlReal = page.url();
    if (!urlReal.includes('login')) {
      console.log(`✓ URL válida: ${url} → ${urlReal}`);
      const titulos = await page.locator('h1, h2, h3').evaluateAll(els => els.map(e => e.innerText?.trim().substring(0,60)));
      console.log('  Títulos:', titulos);
      const tablasCount = await page.locator('table').count();
      console.log('  Tablas:', tablasCount);
      if (tablasCount > 0) {
        const cabeceras = await page.locator('table thead th, table th').evaluateAll(els => els.map(e => e.innerText?.trim()));
        console.log('  Cabeceras tabla:', cabeceras);
        const filas = await page.locator('table tbody tr').count();
        console.log('  Filas de datos:', filas);
      }
      const campos2 = await page.locator('input, select, textarea').evaluateAll(els =>
        els.slice(0,10).map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
      );
      if (campos2.length) console.log('  Campos de formulario:', JSON.stringify(campos2, null, 2));
    } else {
      console.log(`✗ Redirige a login: ${url}`);
    }
  }
  await page.goto(`${BASE_URL}/user-home`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ── PERFIL DEL USUARIO ────────────────────────────────────────────────────
  console.log('\n=== SECCIÓN PERFIL ===');
  const perfilUrls = [
    '/user-home/profile',
    '/user-home/settings',
    '/user-home/account',
    '/user-home/my-profile',
  ];
  for (const url of perfilUrls) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const urlReal = page.url();
    if (!urlReal.includes('login')) {
      console.log(`✓ Perfil URL válida: ${url} → ${urlReal}`);
      const campos2 = await page.locator('input, select, textarea').evaluateAll(els =>
        els.slice(0,15).map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, value: e.value?.substring(0,30), placeholder: e.placeholder }))
      );
      console.log('  Campos perfil:', JSON.stringify(campos2, null, 2));
      const botonesPerfil = await page.locator('button').evaluateAll(els =>
        els.slice(0,10).map(e => ({ id: e.id, class: e.className.substring(0,50), text: e.innerText?.trim().substring(0,40) }))
      );
      console.log('  Botones perfil:', JSON.stringify(botonesPerfil, null, 2));
    } else {
      console.log(`✗ Redirige a login: ${url}`);
    }
  }

  // ── HACER UNA DONACIÓN ────────────────────────────────────────────────────
  console.log('\n=== FORMULARIO NUEVA DONACIÓN ===');
  const donateUrls = [
    '/donate',
    '/donation',
    '/user-home/donate',
    '/user-home/new-donation',
    '/',  // home público
  ];
  for (const url of donateUrls) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const urlReal = page.url();
    const titulos = await page.locator('h1, h2').evaluateAll(els => els.map(e => e.innerText?.trim().substring(0,80)));
    const camposDonate = await page.locator('input, select').evaluateAll(els =>
      els.slice(0,15).map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
    );
    console.log(`URL: ${url} → ${urlReal}`);
    console.log('  Títulos:', titulos.slice(0,4));
    if (camposDonate.length) console.log('  Campos:', JSON.stringify(camposDonate.slice(0,8), null, 2));
  }

  // ── HEADER / AVATAR / LOGOUT ──────────────────────────────────────────────
  console.log('\n=== AVATAR / LOGOUT ===');
  await page.goto(`${BASE_URL}/user-home`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const avatarBtns = await page.locator('button[class*="avatar"], #userBtn, #profileBtn, [class*="user-btn"], [class*="dropdown"] button').evaluateAll(els =>
    els.slice(0,5).map(e => ({ id: e.id, class: e.className.substring(0,60), text: e.innerText?.trim().substring(0,40) }))
  );
  console.log('Avatar/User buttons:', JSON.stringify(avatarBtns, null, 2));

  // Intentar hacer clic en avatar para ver dropdown
  try {
    await page.locator('#userBtn, [class*="avatar"] button, [class*="user"] button').first().click();
    await page.waitForTimeout(800);
    const dropdownItems = await page.locator('[class*="dropdown"] a, [class*="dropdown"] button, [class*="menu"] a').evaluateAll(els =>
      els.slice(0,10).map(e => ({ href: e.href, text: e.innerText?.trim().substring(0,40) }))
    );
    console.log('Dropdown items:', JSON.stringify(dropdownItems, null, 2));
  } catch (e) {
    console.log('No se pudo abrir dropdown de usuario');
  }

  // ── CARDS / ESTADÍSTICAS DEL HOME ────────────────────────────────────────
  console.log('\n=== CARDS Y ESTADÍSTICAS DEL HOME ===');
  await page.goto(`${BASE_URL}/user-home`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const bodyText = (await page.locator('body').innerText()).substring(0, 2000);
  console.log('Body text (primeros 2000 chars):\n', bodyText);

  const cards = await page.locator('[class*="card"], [class*="stat"], [class*="widget"], [class*="summary"]').evaluateAll(els =>
    els.slice(0,10).map(e => ({ class: e.className.substring(0,60), text: e.innerText?.trim().substring(0,80) }))
  );
  console.log('Cards/Stats:', JSON.stringify(cards, null, 2));

  await browser.close();
  console.log('\n=== EXPLORACIÓN COMPLETADA ===');
}

explorar().catch(console.error);
