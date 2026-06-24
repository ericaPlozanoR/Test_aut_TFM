const { chromium } = require("playwright");
const dotenv = require("dotenv");
dotenv.config();

async function loginAndGetMenu(b, url, user, pass) {
  const ctx = await b.newContext({ ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.locator("input[name='username']").fill(user);
  await p.locator("input[name='password']").fill(pass);
  await p.locator("#loginBtn, #login_btn").first().click();
  await p.waitForTimeout(4000);
  const urlAfter = p.url();
  const navItems = await p.evaluate(() =>
    Array.from(document.querySelectorAll("button.nav-item, .nav-item, a.nav-link")).map(el => ({
      text: el.textContent.trim().substring(0,40), cls: el.className.substring(0,30)
    })).filter(x => x.text)
  );
  await ctx.close();
  return { urlAfter, navItems };
}

(async () => {
  const b = await chromium.launch({ headless: true });
  const ADMIN_URL = "https://huellasdelcatatumbo.com/login/admin";

  const roles = [
    { name: "director",    user: process.env.DIRECTOR_USER,    pass: process.env.DIRECTOR_PASS    },
    { name: "coordinador", user: process.env.COORDINADOR_USER, pass: process.env.COORDINADOR_PASS },
    { name: "voluntario",  user: process.env.VOLUNTARIO_USER,  pass: process.env.VOLUNTARIO_PASS  },
  ];

  for (const r of roles) {
    const { urlAfter, navItems } = await loginAndGetMenu(b, ADMIN_URL, r.user, r.pass);
    console.log(`\n=== ${r.name.toUpperCase()} ===`);
    console.log("URL:", urlAfter);
    console.log("NAV ITEMS:", navItems.map(n => n.text).join(" | "));
  }

  await b.close();
})().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
