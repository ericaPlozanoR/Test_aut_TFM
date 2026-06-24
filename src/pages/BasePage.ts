import { Page, Locator } from 'playwright';

/**
 * BasePage: clase raíz de todos los Page Objects.
 * Centraliza operaciones comunes (navegar, esperar, capturar) para no repetirlas.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /** Navega a una ruta relativa (ej. '/login', '/donaciones') */
  async irA(ruta: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${ruta}`, { waitUntil: 'domcontentloaded' });
  }

  /** Espera a que un selector sea visible */
  async esperarVisible(selector: string, timeout = 10_000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  }

  /** Obtiene el título de la página */
  async obtenerTitulo(): Promise<string> {
    return this.page.title();
  }

  /** Obtiene la URL actual */
  obtenerUrl(): string {
    return this.page.url();
  }

  /** Captura de pantalla con nombre descriptivo */
  async capturar(nombre: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${nombre}.png`, fullPage: true });
  }
}
