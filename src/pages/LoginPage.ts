import { Page } from 'playwright';
import { BasePage } from './BasePage';

/**
 * LoginPage – representa los formularios de login de Huellas del Catatumbo.
 *
 * Dos endpoints confirmados con selectores reales:
 *   /login/admin  → admin panel, sin reCAPTCHA
 *                   username: input[name="username"] (#username)
 *                   password: input[name="password"] (#password)
 *                   button:   #loginBtn  (text "Login")
 *
 *   /login        → portal público, con reCAPTCHA v3
 *                   username: input[name="username"]
 *                   password: input[name="password"]
 *                   button:   #login_btn (text "Login")
 */
export class LoginPage extends BasePage {
  // Selectores confirmados inspeccionando el DOM real
  private readonly campoUsuario    = 'input[name="username"]';
  private readonly campoContrasena = 'input[name="password"]';
  // #loginBtn  = admin panel  |  #login_btn = portal público
  private readonly botonIngresar   = '#loginBtn, #login_btn';
  // Error en admin: banner alert; en público: texto de alerta
  private readonly mensajeError    = '.alert, .alert-danger, [class*="alert-warning"], .text-danger, [role="alert"]';

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  // ── Acciones ───────────────────────────────────────────────────────────────

  /**
   * Navega al formulario de login.
   * @param loginUrl ruta relativa: '/login/admin' (default) o '/login'
   */
  async abrirPaginaLogin(loginUrl = '/login/admin'): Promise<void> {
    await this.irA(loginUrl);
    await this.esperarVisible(this.campoUsuario);
  }

  async ingresarUsuario(usuario: string): Promise<void> {
    const campo = this.page.locator(this.campoUsuario).first();
    await campo.click();
    await campo.fill('');
    await campo.fill(usuario);
  }

  async ingresarContrasena(contrasena: string): Promise<void> {
    const campo = this.page.locator(this.campoContrasena).first();
    await campo.click();
    await campo.fill('');
    await campo.fill(contrasena);
  }

  async clickBotonIngresar(): Promise<void> {
    await this.page.locator(this.botonIngresar).first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async iniciarSesion(usuario: string, contrasena: string): Promise<void> {
    await this.ingresarUsuario(usuario);
    await this.ingresarContrasena(contrasena);
    await this.clickBotonIngresar();
  }

  // ── Verificaciones ─────────────────────────────────────────────────────────

  async esPaginaLoginVisible(): Promise<boolean> {
    try {
      await this.esperarVisible(this.campoUsuario, 8_000);
      return true;
    } catch {
      return false;
    }
  }

  async obtenerMensajeError(): Promise<string> {
    const loc = this.page.locator(this.mensajeError).first();
    await loc.waitFor({ state: 'visible', timeout: 6_000 });
    return loc.innerText();
  }

  async hayMensajeError(): Promise<boolean> {
    try {
      await this.page.locator(this.mensajeError).first().waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  esUrlLogin(): boolean {
    return this.obtenerUrl().includes('/login');
  }
}
