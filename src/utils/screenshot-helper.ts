import { Page, Locator } from 'playwright';
import * as path from 'path';
import { EvidenceManager } from '../support/evidence-manager';

/** Callback de adjunto: evita conflictos de tipo con ICreateAttachment de Cucumber */
type AttachCallback = (buffer: Buffer, mediaType: string) => void;

/**
 * ScreenshotHelper — Utilidad para capturas manuales en puntos críticos del flujo.
 *
 * Uso recomendado en step definitions:
 *
 *   // Dentro de un step que usa el World de Cucumber:
 *   const helper = new ScreenshotHelper(this.page, this.cuFolder);
 *
 *   // Al confirmar el envío de una donación:
 *   await helper.capturarPuntoCritico('Confirmacion_envio_donacion');
 *
 *   // Al mostrar el código de trazabilidad generado:
 *   await helper.capturarElemento('[data-testid="codigo-trazabilidad"]', 'Codigo_trazabilidad');
 *
 *   // Para adjuntar la captura al reporte de Cucumber:
 *   await helper.capturarYAdjuntar('Formulario_donacion', this);
 */
export class ScreenshotHelper {
  private readonly page: Page;
  private readonly evidenceManager: EvidenceManager;
  private readonly cuFolder: string;

  constructor(page: Page, cuFolder = 'CU-00_General') {
    this.page = page;
    this.evidenceManager = EvidenceManager.getInstance();
    this.cuFolder = cuFolder;
  }

  // ── Capturas de pantalla completa ─────────────────────────────────────────

  /**
   * Captura el estado completo de la página (con scroll).
   * Ideal para documentar el resultado de una acción crítica.
   *
   * @param descripcion  Texto descriptivo para el nombre del archivo
   *                     (ej. "Confirmacion_envio_donacion")
   * @returns            Ruta absoluta donde se guardó la captura
   */
  async capturarPuntoCritico(descripcion: string): Promise<string> {
    const dir = this.evidenceManager.getScreenshotDir(this.cuFolder);
    const nombre = this.evidenceManager.buildEvidenceName('CRITICO', descripcion);
    const rutaCompleta = path.join(dir, nombre);

    await this.page.screenshot({ path: rutaCompleta, fullPage: true });
    console.log(`[ScreenshotHelper] Captura crítica: ${rutaCompleta}`);
    return rutaCompleta;
  }

  /**
   * Captura únicamente el área visible del viewport (sin scroll).
   * Útil para estados intermedios de un formulario multi-paso.
   */
  async capturarViewport(descripcion: string): Promise<string> {
    const dir = this.evidenceManager.getScreenshotDir(this.cuFolder);
    const nombre = this.evidenceManager.buildEvidenceName('MANUAL', descripcion);
    const rutaCompleta = path.join(dir, nombre);

    await this.page.screenshot({ path: rutaCompleta, fullPage: false });
    console.log(`[ScreenshotHelper] Captura viewport: ${rutaCompleta}`);
    return rutaCompleta;
  }

  // ── Captura de elemento específico ────────────────────────────────────────

  /**
   * Captura un elemento específico de la página usando su selector CSS/Playwright.
   * Perfecto para documentar el código de trazabilidad, mensajes de éxito, etc.
   *
   * @param selector    Selector CSS o Playwright (ej. '[data-testid="codigo"]')
   * @param descripcion Nombre descriptivo para el archivo
   */
  async capturarElemento(selector: string, descripcion: string): Promise<string> {
    const dir = this.evidenceManager.getScreenshotDir(this.cuFolder);
    const nombre = this.evidenceManager.buildEvidenceName('MANUAL', descripcion);
    const rutaCompleta = path.join(dir, nombre);

    const elemento: Locator = this.page.locator(selector).first();
    // Espera a que el elemento sea visible antes de capturar
    await elemento.waitFor({ state: 'visible', timeout: 5_000 });
    await elemento.screenshot({ path: rutaCompleta });
    console.log(`[ScreenshotHelper] Captura de elemento (${selector}): ${rutaCompleta}`);
    return rutaCompleta;
  }

  // ── Captura con adjunto al reporte Cucumber ────────────────────────────────

  /**
   * Captura la página completa Y la adjunta al reporte de Cucumber.
   * Requiere el `world` de Cucumber para poder llamar a `this.attach()`.
   *
   * @param descripcion  Nombre descriptivo
   * @param cucumberWorld Instancia del World (`this` dentro de un step)
   */
  /**
   * Captura la página completa Y la adjunta al reporte de Cucumber.
   *
   * @param descripcion Nombre descriptivo del archivo
   * @param attachFn    Callback de adjunto: `(b, m) => this.attach(b, m)`
   *
   * @example
   * await helper.capturarYAdjuntar('Codigo_trazabilidad', (b, m) => this.attach(b, m));
   */
  async capturarYAdjuntar(
    descripcion: string,
    attachFn: AttachCallback,
  ): Promise<string> {
    const dir = this.evidenceManager.getScreenshotDir(this.cuFolder);
    const nombre = this.evidenceManager.buildEvidenceName('INFO', descripcion);
    const rutaCompleta = path.join(dir, nombre);

    const buffer = await this.page.screenshot({ path: rutaCompleta, fullPage: true });
    attachFn(buffer, 'image/png');
    console.log(`[ScreenshotHelper] Captura adjunta al reporte: ${rutaCompleta}`);
    return rutaCompleta;
  }

  // ── Captura con resaltado de área ──────────────────────────────────────────

  /**
   * Resalta visualmente un elemento antes de capturar la página.
   * Útil para indicar en la evidencia qué campo o botón es relevante.
   *
   * @param selector    Selector del elemento a resaltar
   * @param descripcion Nombre descriptivo para el archivo
   */
  async capturarConResaltado(selector: string, descripcion: string): Promise<string> {
    // Inyecta estilo temporal de resaltado rojo
    await this.page.evaluate((sel: string) => {
      const el = document.querySelector(sel);
      if (el) {
        (el as HTMLElement).style.outline = '3px solid red';
        (el as HTMLElement).style.outlineOffset = '2px';
      }
    }, selector);

    const ruta = await this.capturarPuntoCritico(descripcion);

    // Elimina el resaltado después de capturar
    await this.page.evaluate((sel: string) => {
      const el = document.querySelector(sel);
      if (el) {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      }
    }, selector);

    return ruta;
  }

  // ── Secuencia de capturas para trazabilidad ────────────────────────────────

  /**
   * Captura una secuencia de momentos clave del flujo de trazabilidad.
   * Llama a este método justo antes de confirmar el envío de una donación.
   *
   * Genera tres capturas:
   *   1. Estado del formulario antes del envío
   *   2. Respuesta del sistema (código de trazabilidad / mensaje de éxito)
   *   3. Confirmación del estado inicial en la línea de tiempo
   *
   * @param etapa  'pre-envio' | 'post-envio' | 'trazabilidad'
   * @param contexto Descripción del escenario (ej. "Donacion_alimentos_Juan_Garcia")
   */
  async capturarEtapaTrazabilidad(
    etapa: 'pre-envio' | 'post-envio' | 'trazabilidad',
    contexto: string,
  ): Promise<string> {
    const etapaLabels: Record<string, string> = {
      'pre-envio':    'CRITICO_Formulario_antes_envio',
      'post-envio':   'CRITICO_Confirmacion_envio',
      'trazabilidad': 'CRITICO_Estado_inicial_timeline',
    };
    const descripcion = `${etapaLabels[etapa]}_${contexto}`;
    return this.capturarPuntoCritico(descripcion);
  }
}

// ── Función standalone (alternativa al uso de la clase) ────────────────────────

/**
 * Captura manual sin instanciar la clase. Útil en step definitions simples.
 *
 * @example
 * // En un step definition:
 * import { tomarCaptura } from '../utils/screenshot-helper';
 * await tomarCaptura(this.page, 'Donacion_guardada', this.cuFolder);
 */
export async function tomarCaptura(
  page: Page,
  descripcion: string,
  cuFolder = 'CU-00_General',
): Promise<string> {
  const em = EvidenceManager.getInstance();
  const dir = em.getScreenshotDir(cuFolder);
  const nombre = em.buildEvidenceName('MANUAL', descripcion);
  const rutaCompleta = path.join(dir, nombre);

  await page.screenshot({ path: rutaCompleta, fullPage: true });
  console.log(`[tomarCaptura] ${rutaCompleta}`);
  return rutaCompleta;
}
