/**
 * playwright.config.ts – Configuración para el runner @playwright/test
 *
 * IMPORTANTE: Este archivo aplica ÚNICAMENTE cuando se ejecuta con:
 *   npx playwright test
 *
 * Para el runner habitual del proyecto (Cucumber + Playwright API directa),
 * la configuración de evidencias se gestiona en:
 *   src/support/evidence-manager.ts  ← estructura de carpetas
 *   src/support/world.ts             ← recordVideo en browser context
 *   src/support/hooks.ts             ← captura y retención por escenario
 *
 * Ambos modos generan evidencias bajo test-results/evidencias/<RUN_ID>/.
 */

import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Constantes de rutas (espejo de evidence-manager.ts para el runner PT) ─────

/** ID único de ejecución: YYYY-MM-DD_HH-mm-ss */
const RUN_ID = new Date()
  .toISOString()
  .replace('T', '_')
  .replace(/:/g, '-')
  .substring(0, 19);

const EVIDENCIAS_BASE = path.join('test-results', 'evidencias');
const RUN_DIR = path.join(EVIDENCIAS_BASE, RUN_ID);

// ── Configuración principal ────────────────────────────────────────────────────

export default defineConfig({
  testDir: './src/features',

  // Directorio donde @playwright/test guarda los resultados por defecto
  outputDir: RUN_DIR,

  // Reintentos: 1 en CI, 0 en local (evita ocultar flakyness en desarrollo)
  retries: process.env.CI ? 1 : 0,

  // Workers paralelos: 1 para Cucumber (el paralelismo lo gestiona Cucumber)
  workers: 1,

  // ── Reportes ───────────────────────────────────────────────────────────────
  reporter: [
    // Consola colorida con resumen
    ['list'],
    // Reporte HTML navegable (abre automáticamente solo en fallo)
    ['html', {
      outputFolder: path.join('reports', 'playwright-report'),
      open: 'on-failure',
    }],
    // JSON para integración con herramientas externas (Allure, Grafana, etc.)
    ['json', { outputFile: path.join('reports', 'playwright-results.json') }],
  ],

  // ── Configuración global de cada test ─────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL ?? 'https://huellasdelcatatumbo.com',

    // Viewport estándar escritorio
    viewport: { width: 1366, height: 768 },

    // Ignorar errores de certificado SSL en entorno de pruebas
    ignoreHTTPSErrors: true,

    // Locale colombiano para fechas y formatos de número
    locale: 'es-CO',

    // ── Evidencias automáticas ──────────────────────────────────────────────

    /**
     * Captura de pantalla: solo cuando el test falla.
     * Opciones: 'off' | 'on' | 'only-on-failure' | 'on-first-retry'
     */
    screenshot: 'only-on-failure',

    /**
     * Grabación de video: guarda el video solo si el test falla.
     * Opciones: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
     */
    video: {
      mode: 'retain-on-failure',
      size: { width: 1366, height: 768 },
    },

    /**
     * Trazas de Playwright (acciones, snapshots, red): al primer reintento.
     * Se visualizan con: npx playwright show-trace <archivo.zip>
     * Opciones: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
     */
    trace: 'on-first-retry',

    // Velocidad de ejecución (0 = máxima velocidad; >0 = modo debug)
    actionTimeout: parseInt(process.env.TIMEOUT ?? '30000', 10),
    navigationTimeout: 30_000,
  },

  // ── Proyectos por navegador ────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS !== 'false',
        launchOptions: {
          slowMo: parseInt(process.env.SLOWMO ?? '0', 10),
        },
      },
    },
    // Descomentar para pruebas cross-browser:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], headless: true },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], headless: true },
    // },
  ],
});
