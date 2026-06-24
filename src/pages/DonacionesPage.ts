import { Page } from 'playwright';
import { BasePage } from './BasePage';

/**
 * DonacionesPage – gestión e informes de donaciones en la plataforma.
 *
 * URL confirmada del módulo admin: /admin-home/donations/reports
 *   - Muestra: TOTAL DONATIONS $12,000.00 · 10 transactions
 *   - Tabla de gateway breakdown (Manual, Physical aid)
 *   - Tabla de Top campaigns
 *   - Tabla de Top donors
 *   - Filtros: select#periodSelect, select#gatewaySelect
 *   - Exportación: "Export CSV" (btn-primary), "Export PDF" (btn)
 *   - Pestañas: Donations | Payouts | Top campaigns | Top donors | Refunds
 *
 * URL portal usuario: /user-home/donations
 *   - Donaciones realizadas por el usuario autenticado
 *
 * Selectores confirmados con scripts/explore-admin-panel.js
 */
export class DonacionesPage extends BasePage {
  // ── Módulo admin (/admin-home/donations/reports) ──────────────────────────
  private readonly tablaDonaciones   = 'table';
  private readonly filtroPeriodo     = 'select#periodSelect';
  private readonly filtroGateway     = 'select#gatewaySelect';
  private readonly botonExportCSV    = 'button.btn-primary:has-text("Export CSV")';
  private readonly botonExportPDF    = 'button.btn:has-text("Export PDF")';

  // Pestañas de la página de reports
  private readonly tabDonaciones     = 'button.tab-btn:has-text("Donations")';
  private readonly tabPayouts        = 'button.tab-btn:has-text("Payouts")';
  private readonly tabTopCampaigns   = 'button.tab-btn:has-text("Top campaigns")';
  private readonly tabTopDonors      = 'button.tab-btn:has-text("Top donors")';
  private readonly tabRefunds        = 'button.tab-btn:has-text("Refunds")';

  // Resumen de totales
  private readonly totalDonaciones   = '.stat-value, [class*="total"], h2, h3';
  private readonly mensajeExito      = '.alert-success, .swal2-success, [class*="toast-success"]';
  private readonly mensajeError      = '.alert-danger, .swal2-error, [class*="toast-error"]';

  // ── Portal usuario (/user-home/donations) ─────────────────────────────────
  private readonly tablaUserDonaciones = 'table, .donation-list, [class*="donation"]';

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  // ── Navegación ─────────────────────────────────────────────────────────────

  async abrirInformeDonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/donations/reports`, { waitUntil: 'domcontentloaded' });
    await this.page.locator(this.tablaDonaciones).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async abrirMisDonaciones(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/user-home/donations`, { waitUntil: 'domcontentloaded' });
  }

  // ── Filtros y acciones ─────────────────────────────────────────────────────

  async filtrarPorPeriodo(periodo: string): Promise<void> {
    const select = this.page.locator(this.filtroPeriodo);
    await select.waitFor({ state: 'visible', timeout: 5_000 });
    // Mapeo de etiquetas en español a los valores en inglés del select
    const mapaOpciones: Record<string, string> = {
      'este mes':       'This month',
      'mes pasado':     'Last month',
      'últimos 3 meses': 'Last 3 months',
      'últimos 6 meses': 'Last 6 months',
      'este año':       'This year',
      'todo el tiempo': 'All time',
    };
    const valorEn = mapaOpciones[periodo.toLowerCase()] ?? periodo;
    await select.selectOption({ label: valorEn });
    await this.page.waitForTimeout(800);
  }

  async filtrarPorGateway(gateway: string): Promise<void> {
    const select = this.page.locator(this.filtroGateway);
    await select.waitFor({ state: 'visible', timeout: 5_000 });
    await select.selectOption({ label: gateway });
    await this.page.waitForTimeout(800);
  }

  async filtrarPorEstado(estado: string): Promise<void> {
    // En la pantalla de reports el "estado" se filtra por gateway o período
    await this.filtrarPorGateway(estado);
  }

  async exportarCSV(): Promise<void> {
    await this.page.locator(this.botonExportCSV).click();
    await this.page.waitForTimeout(1_000);
  }

  async exportarPDF(): Promise<void> {
    await this.page.locator(this.botonExportPDF).click();
    await this.page.waitForTimeout(1_000);
  }

  async seleccionarPestana(nombre: string): Promise<void> {
    await this.page.locator(`button.tab-btn:has-text("${nombre}")`).first().click();
    await this.page.waitForTimeout(500);
  }

  // ── Búsqueda (compatible con pasos legacy del feature) ────────────────────

  async buscarDonacion(termino: string): Promise<void> {
    // La pantalla de reports no tiene campo de búsqueda libre; filtramos por gateway si aplica
    const gatewayOpts = ['Manual', 'Physical aid'];
    if (gatewayOpts.some(g => termino.toLowerCase().includes(g.toLowerCase()))) {
      await this.filtrarPorGateway(termino);
    }
    // Para búsquedas por código u otros términos: dejamos la tabla como está
    await this.page.waitForTimeout(400);
  }

  // ── Verificaciones ─────────────────────────────────────────────────────────

  async esTablaDonacionesVisible(): Promise<boolean> {
    try {
      // La página de reports tiene varias tablas; .first() evita strict mode violation
      await this.page.locator(this.tablaDonaciones).first().waitFor({ state: 'visible', timeout: 8_000 });
      return true;
    } catch {
      return false;
    }
  }

  async contarFilasTabla(): Promise<number> {
    await this.page.locator(this.tablaDonaciones).first().waitFor({ state: 'visible', timeout: 8_000 });
    return this.page.locator('table tbody tr').count();
  }

  async obtenerTotalDonaciones(): Promise<string> {
    const elem = this.page.locator('[class*="total-amount"], [class*="stat"], h2, h3').first();
    await elem.waitFor({ state: 'visible', timeout: 5_000 });
    return (await elem.innerText()).trim();
  }

  async obtenerMensajeExito(): Promise<string> {
    const alerta = this.page.locator(this.mensajeExito).first();
    await alerta.waitFor({ state: 'visible', timeout: 8_000 });
    return alerta.innerText();
  }

  async obtenerMensajeError(): Promise<string> {
    const alerta = this.page.locator(this.mensajeError).first();
    await alerta.waitFor({ state: 'visible', timeout: 5_000 });
    return alerta.innerText();
  }

  async hayMensajeExito(): Promise<boolean> {
    try {
      await this.page.locator(this.mensajeExito).first().waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async obtenerCodigoTrazabilidad(): Promise<string> {
    // En el sistema real los códigos aparecen en la tabla de reports como referencia de transacción
    const celdas = this.page.locator('table tbody tr td:first-child');
    const count = await celdas.count();
    if (count > 0) return (await celdas.first().innerText()).trim();
    return '';
  }
}
