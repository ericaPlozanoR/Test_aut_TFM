import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, Video, chromium, firefox, webkit } from 'playwright';
import * as dotenv from 'dotenv';
import type { LoginPage } from '../pages/LoginPage';
import type { DashboardPage } from '../pages/DashboardPage';
import type { DonacionesPage } from '../pages/DonacionesPage';
import type { TrazabilidadPage } from '../pages/TrazabilidadPage';
import type { GestionUsuariosPage } from '../pages/GestionUsuariosPage';
import type { PortalUsuarioPage } from '../pages/PortalUsuarioPage';
import { EvidenceManager } from './evidence-manager';

dotenv.config();

/**
 * CustomWorld extiende el World de Cucumber e inyecta el contexto de Playwright.
 *
 * Responsabilidades:
 *   - Ciclo de vida del browser (init / teardown) por escenario
 *   - Grabación de video (`recordVideo`) en el contexto de Playwright
 *   - Almacenamiento de Page Objects activos (dispatcher sin estado global)
 *   - Metadatos del escenario (cuFolder, scenarioName) para el EvidenceManager
 */
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // ── Page Objects del escenario actual ──────────────────────────────────────
  loginPage?: LoginPage;
  dashboardPage?: DashboardPage;
  donacionesPage?: DonacionesPage;
  trazabilidadPage?: TrazabilidadPage;
  usuariosPage?: GestionUsuariosPage;
  portalUsuarioPage?: PortalUsuarioPage;

  // ── Estado temporal entre pasos del mismo escenario ────────────────────────
  nuevoEstado?: string;
  observacion?: string;

  // ── Metadatos de evidencias (setados en init()) ────────────────────────────
  cuFolder: string = 'CU-00_General';
  scenarioName: string = 'Escenario_sin_nombre';

  // ── Configuración global ───────────────────────────────────────────────────
  readonly baseUrl: string = process.env.BASE_URL ?? 'https://huellasdelcatatumbo.com';

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Inicializa el browser, el contexto (con grabación de video) y la página.
   *
   * @param tags         Tags del escenario Cucumber (ej. ['@smoke', '@donaciones'])
   * @param scenarioName Nombre del escenario para nombrar archivos de evidencia
   */
  async init(tags: string[] = [], scenarioName = 'Escenario'): Promise<void> {
    const em = EvidenceManager.getInstance();

    // Determinar carpeta CU y guardar metadatos en el World
    this.cuFolder = em.getCuFolder(tags);
    this.scenarioName = scenarioName;

    const browserName = (process.env.BROWSER ?? 'chromium') as 'chromium' | 'firefox' | 'webkit';
    const headless = process.env.HEADLESS !== 'false';
    const slowMo = parseInt(process.env.SLOWMO ?? '0', 10);
    const timeout = parseInt(process.env.TIMEOUT ?? '30000', 10);

    const launchOptions = { headless, slowMo };

    this.browser =
      browserName === 'firefox'
        ? await firefox.launch(launchOptions)
        : browserName === 'webkit'
          ? await webkit.launch(launchOptions)
          : await chromium.launch(launchOptions);

    this.context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 },
      ignoreHTTPSErrors: true,
      locale: 'es-CO',

      // ── Grabación de video (retain-on-failure) ─────────────────────────────
      // Playwright graba en el dir temporal; hooks.ts mueve el archivo al CU
      // correspondiente si el test falla, o lo elimina si pasa.
      recordVideo: {
        dir: em.getVideoTempDir(),
        size: { width: 1366, height: 768 },
      },
    });

    this.context.setDefaultTimeout(timeout);
    this.page = await this.context.newPage();
  }

  /**
   * Cierra el browser de forma ordenada y retorna la ruta del video grabado.
   *
   * Secuencia de cierre crítica para Playwright video:
   *   1. Obtener referencia al video ANTES de cerrar la página
   *   2. Cerrar la página
   *   3. Cerrar el contexto (aquí Playwright finaliza y guarda el video)
   *   4. Cerrar el browser
   *   5. Resolver la ruta del video (disponible después del contexto cerrado)
   *
   * @returns Ruta absoluta del archivo .webm, o undefined si no hay video
   */
  async teardown(): Promise<string | undefined> {
    // Paso 1: Guardar referencia al video ANTES de cerrar la página
    const video: Video | null = this.page?.video() ?? null;

    // Paso 2 y 3: Cerrar página y contexto (el video se finaliza aquí)
    await this.page?.close();
    await this.context?.close();

    // Paso 4: Cerrar browser
    await this.browser?.close();

    // Paso 5: Resolver la ruta del video (ya guardado en disco)
    if (video) {
      try {
        return await video.path();
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

setWorldConstructor(CustomWorld);
