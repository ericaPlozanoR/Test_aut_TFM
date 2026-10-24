import { Page } from 'playwright';
import { BasePage } from './BasePage';

/**
 * PortalUsuarioPage – panel privado del usuario donante.
 *
 * URLs confirmadas (script explore-user-detail.js):
 *   /user-home                            → Dashboard con estadísticas
 *   /user-home/donations                  → Historial de donaciones (cards, no tabla)
 *   /user-home/edit-profile               → Editar perfil
 *   /user-home/change-password            → Cambiar contraseña
 *   /user-home/support-tickets            → Tickets de soporte
 *   /user-home/campaign-contribution-logs → Contribuciones a campañas
 *   /user-home/reward-points              → Puntos de recompensa
 *   /user-home/events-booking             → Reservas de eventos
 *   /user-home/all/communities            → Comunidades
 *   /donation                             → Catálogo público de campañas
 *
 * Selectores confirmados inspeccionando el DOM real.
 */
export class PortalUsuarioPage extends BasePage {
  // ── Dashboard (/user-home) ─────────────────────────────────────────────────
  private readonly linkVerActividad    = 'a[href*="user-home/donations"]';

  // ── Historial donaciones (/user-home/donations) ────────────────────────────
  private readonly campoBusqueda       = 'input[placeholder="Buscar donaciones..."], input[placeholder="Search donations..."]';
  private readonly botonFiltro         = '#donation-filter-toggle';
  private readonly radioEstado         = 'input[name="status_choice"]';
  private readonly accionDonacion      = 'button.donation-action-toggle';

  // ── Editar perfil (/user-home/edit-profile) ────────────────────────────────
  private readonly campoNombre         = 'input#name';
  private readonly campoEmail          = 'input#email';
  private readonly campoTelefono       = 'input#phone';
  private readonly campoEstado         = 'input#state';
  private readonly campoCiudad         = 'input#city';
  private readonly botonGuardarPerfil  = 'button:has-text("Save changes")';

  // ── Cambiar contraseña (/user-home/change-password) ───────────────────────
  private readonly campoClaveActual    = 'input#old_password';
  private readonly campoNuevaClave     = 'input#password';
  private readonly campoConfirmaClave  = 'input#password_confirmation';

  // ── Logout ────────────────────────────────────────────────────────────────
  private readonly logoutLink          = 'a[href*="/logout"]';

  // ── Mensajes ──────────────────────────────────────────────────────────────
  private readonly mensajeExito = '.alert-success, [class*="toast-success"], [class*="success-alert"]';
  private readonly mensajeError = '.alert-danger, [class*="toast-error"], [class*="error-alert"], .invalid-feedback';

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  // ── Navegación ─────────────────────────────────────────────────────────────

  async abrirDashboard(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async abrirHistorialDonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home/donations`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async abrirEditarPerfil(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home/edit-profile`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async abrirCambiarContrasena(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home/change-password`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async abrirCatalogoDonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/donation`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async abrirSeccion(ruta: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${ruta}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
  }

  async cerrarSesion(): Promise<void> {
    await this.page.locator(this.logoutLink).first().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);
  }

  // ── Verificaciones del Dashboard ────────────────────────────────────────────

  async esDashboardVisible(): Promise<boolean> {
    return this.obtenerUrl().includes('/user-home');
  }

  async tieneEstadisticas(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return texto.includes('THIS MONTH') || texto.includes('LIFETIME TOTAL') || texto.includes('contributions received');
  }

  async tieneActividadReciente(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return texto.includes('Recent Activity') || texto.includes('Contribution');
  }

  async obtenerNombreUsuarioVisible(): Promise<string> {
    try {
      const h3 = this.page.locator('[class*="account"] h3, [class*="panel"] h3, h3').first();
      return (await h3.innerText().catch(() => '')).trim();
    } catch {
      return '';
    }
  }

  // ── Verificaciones del Historial ────────────────────────────────────────────

  async tieneListaDonaciones(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return (
      texto.includes('Mis Donaciones') ||
      texto.includes('Historial de Donaciones') ||
      texto.includes('All Donations') ||
      texto.includes('Total Donations') ||
      texto.includes('Donation')
    );
  }

  async tieneResumenDonaciones(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return (
      texto.includes('Total Donado') || texto.includes('Este Mes') || texto.includes('Pendientes') ||
      texto.includes('Total Donations') || texto.includes('This Month') || texto.includes('Pending')
    );
  }

  async contarDonacionesVisibles(): Promise<number> {
    const count = await this.page.locator(this.accionDonacion).count();
    if (count > 0) return count;
    // Fallback: contar filas de tabla si las hubiera
    return this.page.locator('table tbody tr').count();
  }

  async hayAlgunaDonacion(): Promise<boolean> {
    const count = await this.contarDonacionesVisibles();
    if (count > 0) return true;
    const texto = await this.page.locator('body').innerText();
    // Buscar indicadores de donaciones registradas: IDs (#nnn) o montos ($)
    return /\#\d{3,}|\$[\d,]+\.\d{2}/.test(texto) && !texto.includes('No donations');
  }

  // ── Filtros y búsqueda ──────────────────────────────────────────────────────

  async filtrarPorEstado(estado: string): Promise<void> {
    const boton = this.page.locator(this.botonFiltro);
    const visible = await boton.isVisible().catch(() => false);
    if (visible) {
      await boton.click();
      await this.page.waitForTimeout(400);
    }
    const mapaEstados: Record<string, string> = {
      'todos':       '',
      'completadas': 'complete',
      'aceptadas':   'complete',
      'pendientes':  'pending',
      'canceladas':  'cancel',
    };
    const valor = mapaEstados[estado.toLowerCase()] ?? estado.toLowerCase();
    await this.page.locator(`${this.radioEstado}[value="${valor}"]`).click().catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async buscarDonacion(termino: string): Promise<void> {
    const campo = this.page.locator(this.campoBusqueda);
    await campo.waitFor({ state: 'visible', timeout: 5_000 });
    await campo.fill('');
    await campo.fill(termino);
    await this.page.waitForTimeout(800);
  }

  async hayResultadosBusqueda(termino: string): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return texto.toLowerCase().includes(termino.toLowerCase());
  }

  // ── Perfil ─────────────────────────────────────────────────────────────────

  async estaFormularioPerfilVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.campoNombre).waitFor({ state: 'visible', timeout: 6_000 });
      return true;
    } catch {
      return false;
    }
  }

  async obtenerNombreDelPerfil(): Promise<string> {
    return this.page.locator(this.campoNombre).inputValue();
  }

  async obtenerEmailDelPerfil(): Promise<string> {
    return this.page.locator(this.campoEmail).inputValue();
  }

  async tieneDataPrecargada(): Promise<boolean> {
    const nombre = await this.obtenerNombreDelPerfil().catch(() => '');
    const email  = await this.obtenerEmailDelPerfil().catch(() => '');
    return nombre.length > 0 || email.length > 0;
  }

  async actualizarTelefono(telefono: string): Promise<void> {
    await this.page.locator(this.campoTelefono).fill(telefono);
  }

  async guardarPerfil(): Promise<void> {
    await this.page.locator(this.botonGuardarPerfil).last().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(800);
  }

  // ── Cambiar contraseña ──────────────────────────────────────────────────────

  async estaFormularioCambioContrasenaVisible(): Promise<boolean> {
    try {
      await this.page.locator(this.campoClaveActual).waitFor({ state: 'visible', timeout: 6_000 });
      return true;
    } catch {
      return false;
    }
  }

  async tieneBotonGuardarContrasena(): Promise<boolean> {
    return this.page.locator('button:has-text("Save changes")').isVisible().catch(() => false);
  }

  async rellenarCambioContrasena(actual: string, nueva: string): Promise<void> {
    await this.page.locator(this.campoClaveActual).fill(actual);
    await this.page.locator(this.campoNuevaClave).fill(nueva);
    await this.page.locator(this.campoConfirmaClave).fill(nueva);
  }

  // ── Catálogo ───────────────────────────────────────────────────────────────

  async tieneItemsCatalogo(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return texto.includes('Donate Now') || texto.includes('Raised:');
  }

  async contarCampanasConBotonDonar(): Promise<number> {
    return this.page.locator('a:has-text("Donate Now"), button:has-text("Donate Now")').count();
  }

  async tieneMontoRecaudado(): Promise<boolean> {
    const texto = await this.page.locator('body').innerText();
    return texto.includes('Raised:') || /\$[\d,]+\.\d{2}/.test(texto);
  }

  // ── Mensajes ───────────────────────────────────────────────────────────────

  async hayMensajeExito(): Promise<boolean> {
    try {
      await this.page.locator(this.mensajeExito).first().waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async hayMensajeError(): Promise<boolean> {
    try {
      await this.page.locator(this.mensajeError).first().waitFor({ state: 'visible', timeout: 4_000 });
      return true;
    } catch {
      return false;
    }
  }
}
