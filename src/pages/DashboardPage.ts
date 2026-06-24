import { Page } from 'playwright';
import { BasePage } from './BasePage';

/**
 * DashboardPage – panel principal tras autenticarse.
 *
 * Admin panel (/admin-home):
 *   - Sidebar con botones button.nav-item (English: "Admin Manage", "Users Manage", "Donation", …)
 *   - Avatar: button#adminBtn → despliega dropdown con "Log out"
 *
 * User portal (/user-home):
 *   - Menú de navegación con enlaces (Dashboard, Campaign, All Donations, …)
 *
 * Selectores confirmados inspeccionando el DOM real (scripts/explore-admin-panel.js).
 */
export class DashboardPage extends BasePage {
  // ── Admin panel ────────────────────────────────────────────────────────────
  private readonly adminNavItem     = 'button.nav-item';
  private readonly adminAvatarBtn   = '#adminBtn';
  private readonly logoutBtn        = 'button:has-text("Log out"), a:has-text("Log out")';

  // ── User portal ────────────────────────────────────────────────────────────
  private readonly userNavLink      = 'a[href*="user-home"]';

  // Mapa: nombre semántico en español → texto REAL del botón en la interfaz
  private readonly menuMap: Record<string, string> = {
    usuarios:      'Users Manage',
    'gestión usuarios': 'Users Manage',
    donaciones:    'Donation',
    reportes:      'Donation',    // Reports está bajo Donation
    acopios:       'Logistics Manage',
    trazabilidad:  'Donation',
    voluntarios:   'Volunteers',
    comunidad:     'Community',
  };

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  // ── Verificaciones ─────────────────────────────────────────────────────────

  async esDashboardVisible(): Promise<boolean> {
    const url = this.obtenerUrl();
    if (url.includes('/admin-home') || url.includes('/user-home')) return true;
    try {
      await this.page.waitForURL(/admin-home|user-home/, { timeout: 8_000 });
      return true;
    } catch {
      return false;
    }
  }

  async esAdminPanel(): Promise<boolean> {
    return this.obtenerUrl().includes('/admin-home');
  }

  async esUserPortal(): Promise<boolean> {
    return this.obtenerUrl().includes('/user-home');
  }

  async obtenerNombreUsuario(): Promise<string> {
    try {
      const btn = this.page.locator(this.adminAvatarBtn).first();
      await btn.waitFor({ state: 'visible', timeout: 4_000 });
      return (await btn.innerText()).trim();
    } catch {
      return '';
    }
  }

  /**
   * Verifica si un ítem del menú lateral es visible.
   * @param opcion nombre semántico en español (ej. "usuarios", "donaciones", "acopios")
   */
  async esMenuVisible(opcion: string): Promise<boolean> {
    const realText = this.menuMap[opcion.toLowerCase()];
    if (!realText) return false;
    try {
      await this.page
        .locator(`${this.adminNavItem}:has-text("${realText}"), a.nav-link:has-text("${realText}")`)
        .first()
        .waitFor({ state: 'visible', timeout: 4_000 });
      return true;
    } catch {
      return false;
    }
  }

  // ── Navegación directa (más fiable que clic en menú colapsable) ────────────

  async irADonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/donations/reports`, { waitUntil: 'domcontentloaded' });
  }

  async irATrazabilidad(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/donations/analytics`, { waitUntil: 'domcontentloaded' });
  }

  async irAUsuarios(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/frontend/all-user`, { waitUntil: 'domcontentloaded' });
  }

  async irAReportes(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/donations/reports`, { waitUntil: 'domcontentloaded' });
  }

  async irAMisDonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home/donations`, { waitUntil: 'domcontentloaded' });
  }

  // ── Cerrar sesión ──────────────────────────────────────────────────────────

  async cerrarSesion(): Promise<void> {
    // En el admin panel: el logout está en el menú desplegable del avatar (#adminBtn)
    const adminBtn = this.page.locator(this.adminAvatarBtn);
    const isAdmin = await adminBtn.isVisible().catch(() => false);
    if (isAdmin) {
      await adminBtn.click();
      await this.page.waitForTimeout(400);
    }
    await this.page.locator(this.logoutBtn).first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
