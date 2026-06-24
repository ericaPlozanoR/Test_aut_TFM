const { chromium } = require("playwright");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, locale: "es-CO" });
  const p = await ctx.newPage();

  console.log("\n=== GET /login/admin ===");
  await p.goto("https://huellasdelcatatumbo.com/login/admin", { waitUntil: "networkidle", timeout: 30000 });

  const inputs = await p.evaluate(() =>
    Array.from(document.querySelectorAll("input, button, select")).map(el => ({
      tag: el.tagName, type: el.type || "", id: el.id,
      name: el.name || "", placeholder: el.placeholder || "",
      text: el.textContent.trim().substring(0, 40)
    }))
  );
  console.log("INPUTS:", JSON.stringify(inputs, null, 2));
  await p.screenshot({ path: "scripts/output/admin-login.png", fullPage: false });

  console.log("\n=== Intentando login admin ===");
  try {
    await p.locator("input[name='username'], input[name='email'], input[type='text']").first().fill("super_admin");
    await p.locator("input[type='password']").first().fill(process.env.ADMIN_PASS || "beta9023#");
    await p.locator("button[type='submit'], input[type='submit'], #login_btn, button:has-text('Login'), button:has-text('Ingresar'), button:has-text('Entrar')").first().click();
    await p.waitForTimeout(5000);
  } catch(e) { console.log("ERROR en login:", e.message); }

  const urlAfter = p.url();
  console.log("URL_AFTER_LOGIN:", urlAfter);
  await p.screenshot({ path: "scripts/output/admin-after-login.png", fullPage: true });

  if (!urlAfter.includes("login")) {
    console.log("\n=== LOGIN EXITOSO ===");
    const pageTitle = await p.title();
    const h1 = await p.locator("h1, h2, .page-title, .dashboard-title, [class*='title']").first().innerText().catch(() => "N/A");
    console.log("TITLE:", pageTitle, "| H1:", h1.substring(0,80));

    const menuLinks = await p.evaluate(() =>
      Array.from(document.querySelectorAll("nav a, aside a, .sidebar a, .nav-link, [class*='menu'] a, li a")).map(a => ({
        text: a.textContent.trim().substring(0,40), href: a.href
      })).filter(x => x.text)
    );
    console.log("\nMENU:", JSON.stringify(menuLinks.slice(0,30), null, 2));

    const allText = await p.locator("body").innerText();
    fs.writeFileSync("scripts/output/admin-dashboard-text.txt", allText.substring(0,5000));

    const html = await p.content();
    fs.writeFileSync("scripts/output/admin-dashboard.html", html);
    console.log("HTML guardado.");
  } else {
    const errText = await p.locator(".alert, .error, [class*='error'], [class*='alert']").allInnerTexts().catch(() => []);
    console.log("LOGIN FALLIDO. Errores:", errText);
    const html = await p.content();
    fs.writeFileSync("scripts/output/admin-login-fail.html", html);
  }

  await b.close();
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
