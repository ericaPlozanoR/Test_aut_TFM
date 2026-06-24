const { chromium } = require("playwright");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const BASE = "https://huellasdelcatatumbo.com";
const OUT  = "scripts/output";
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function extractElements(p, label) {
  const inputs = await p.evaluate(() =>
    Array.from(document.querySelectorAll("input, button, select, textarea, a.btn, a[class*='btn']")).map(el => ({
      tag: el.tagName.toLowerCase(), type: el.type || "",
      id: el.id, name: el.name || "",
      placeholder: el.placeholder || "",
      cls: el.className.substring(0, 80),
      text: el.textContent.trim().substring(0, 50),
      href: el.href || ""
    }))
  );
  console.log(`\n=== ${label} ===`);
  inputs.forEach((el, i) => { if (el.text || el.placeholder || el.id || el.name) console.log(`[${i}]`, JSON.stringify(el)); });
  return inputs;
}

async function extractTable(p) {
  return p.evaluate(() => {
    const tables = Array.from(document.querySelectorAll("table"));
    return tables.map(t => ({
      id: t.id, cls: t.className.substring(0,60),
      headers: Array.from(t.querySelectorAll("th")).map(th => th.textContent.trim()),
      rowCount: t.querySelectorAll("tbody tr").length
    }));
  });
}

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, locale: "es-CO" });
  const p = await ctx.newPage();

  // ── 1. LOGIN ADMIN ────────────────────────────────────────────────────────
  await p.goto(`${BASE}/login/admin`, { waitUntil: "networkidle" });
  await p.locator("#username").fill(process.env.ADMIN_USER || "super_admin");
  await p.locator("#password").fill(process.env.ADMIN_PASS || "beta9023#");
  await p.locator("#loginBtn").click();
  await p.waitForURL(`${BASE}/admin-home`, { timeout: 20000 });
  console.log("✓ Login admin OK →", p.url());

  // ── 2. DASHBOARD ──────────────────────────────────────────────────────────
  await p.screenshot({ path: `${OUT}/dash-full.png`, fullPage: true });
  const dashCards = await p.evaluate(() =>
    Array.from(document.querySelectorAll(".card, [class*='card'], .stat, [class*='stat'], .widget, [class*='count'], [class*='total']")).map(el => ({
      cls: el.className.substring(0,80), text: el.textContent.trim().substring(0,100)
    }))
  );
  console.log("\n=== DASHBOARD CARDS ===");
  dashCards.slice(0,10).forEach((c,i) => console.log(`[${i}]`, JSON.stringify(c)));
  fs.writeFileSync(`${OUT}/dashboard-body.txt`, (await p.locator("body").innerText()).substring(0,3000));

  // Avatar / nombre usuario
  const userAvatar = await p.evaluate(() => {
    const candidates = ["[class*='user']", "[class*='avatar']", "[class*='profile']", ".navbar-user", ".user-info", "header [class*='name']"];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) return { sel, text: el.textContent.trim().substring(0,60), cls: el.className.substring(0,60) };
    }
    return null;
  });
  console.log("\nUSER_AVATAR:", JSON.stringify(userAvatar));

  // Botón logout
  const logoutInfo = await p.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("a, button")).filter(el =>
      /logout|sign.?out|cerrar/i.test(el.textContent) || /logout|signout/i.test(el.href || "")
    );
    return candidates.map(el => ({ tag: el.tagName, text: el.textContent.trim(), href: el.href || "", cls: el.className.substring(0,60) }));
  });
  console.log("\nLOGOUT:", JSON.stringify(logoutInfo));

  // ── 3. DONACIONES ─────────────────────────────────────────────────────────
  await p.goto(`${BASE}/admin-home/donations/reports`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/donations-list.png`, fullPage: true });
  await extractElements(p, "DONATIONS REPORTS PAGE");
  const donTables = await extractTable(p);
  console.log("DONATION TABLES:", JSON.stringify(donTables, null, 2));
  const donBodyText = (await p.locator("body").innerText()).substring(0, 2000);
  fs.writeFileSync(`${OUT}/donations-body.txt`, donBodyText);
  console.log("DONATIONS TEXT (primeros 800):", donBodyText.substring(0, 800));
  const donHtml = await p.content();
  fs.writeFileSync(`${OUT}/donations.html`, donHtml);

  // ── 4. USUARIOS ───────────────────────────────────────────────────────────
  await p.goto(`${BASE}/admin-home/frontend/all-user`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/users-list.png`, fullPage: true });
  await extractElements(p, "ALL USERS PAGE");
  const userTables = await extractTable(p);
  console.log("USER TABLES:", JSON.stringify(userTables, null, 2));
  const userBodyText = (await p.locator("body").innerText()).substring(0, 2000);
  fs.writeFileSync(`${OUT}/users-body.txt`, userBodyText);
  console.log("USERS TEXT (primeros 600):", userBodyText.substring(0, 600));
  const usersHtml = await p.content();
  fs.writeFileSync(`${OUT}/users.html`, usersHtml);

  // ── 5. NUEVO USUARIO ─────────────────────────────────────────────────────
  await p.goto(`${BASE}/admin-home/frontend/new-user`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/new-user-form.png`, fullPage: true });
  await extractElements(p, "NEW USER FORM");
  const nuHtml = await p.content();
  fs.writeFileSync(`${OUT}/new-user.html`, nuHtml);

  // ── 6. ANALYTICS / TRAZABILIDAD ──────────────────────────────────────────
  await p.goto(`${BASE}/admin-home/donations/analytics`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/analytics.png`, fullPage: true });
  await extractElements(p, "ANALYTICS PAGE");
  const analyticsText = (await p.locator("body").innerText()).substring(0, 1500);
  fs.writeFileSync(`${OUT}/analytics-body.txt`, analyticsText);
  console.log("ANALYTICS TEXT:", analyticsText.substring(0, 500));

  // ── 7. LOGIN USUARIO REGULAR ─────────────────────────────────────────────
  const p2 = await ctx.newPage();
  await p2.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await p2.locator("input[name='username']").fill(process.env.USUARIO_USER || "antuan23");
  await p2.locator("input[type='password']").fill(process.env.USUARIO_PASS || "beta9023#");
  await p2.locator("#login_btn").click();
  await p2.waitForTimeout(5000);
  const urlUser = p2.url();
  console.log("\n=== LOGIN USUARIO REGULAR ===");
  console.log("URL:", urlUser);
  await p2.screenshot({ path: `${OUT}/user-after-login.png`, fullPage: false });
  if (!urlUser.includes("login")) {
    const userTitle = await p2.title();
    const userMenu = await p2.evaluate(() =>
      Array.from(document.querySelectorAll("nav a, aside a, [class*='sidebar'] a, [class*='menu'] a")).map(a => ({
        text: a.textContent.trim().substring(0,40), href: a.href
      })).filter(x => x.text)
    );
    console.log("USER_TITLE:", userTitle);
    console.log("USER_MENU:", JSON.stringify(userMenu.slice(0, 15), null, 2));
    const userHtml = await p2.content();
    fs.writeFileSync(`${OUT}/user-home.html`, userHtml);
    fs.writeFileSync(`${OUT}/user-home-body.txt`, (await p2.locator("body").innerText()).substring(0, 2000));
  } else {
    const errTxt = await p2.locator(".alert, [class*='error'], [class*='alert']").allInnerTexts().catch(() => []);
    console.log("USER LOGIN FAILED:", errTxt);
  }

  await b.close();
  console.log("\n✓ Exploración completada. Archivos en scripts/output/");
})().catch(e => { console.error("FATAL:", e.message, e.stack); process.exit(1); });
