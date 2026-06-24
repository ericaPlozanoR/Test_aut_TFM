import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import * as path from 'path';
import { CustomWorld } from './world';
import { EvidenceManager } from './evidence-manager';

// ── Timeout global por paso ────────────────────────────────────────────────────
setDefaultTimeout(30_000);

// ── Singleton de gestión de evidencias (inicializado una vez por proceso) ──────
const evidenceManager = EvidenceManager.getInstance();

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE ALL
// Ejecuta una sola vez al inicio de la suite.
// Imprime en consola el directorio de evidencias de esta ejecución.
// ─────────────────────────────────────────────────────────────────────────────
BeforeAll(async function () {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Evidencias de esta ejecución → ${evidenceManager.getRunDir()}`);
  console.log(`  Run ID: ${evidenceManager.getRunId()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
});

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE (por escenario)
// Lanza el browser con grabación de video activa y categoriza el escenario.
// ─────────────────────────────────────────────────────────────────────────────
Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const tags = scenario.pickle.tags.map(t => t.name);
  const name = scenario.pickle.name;
  await this.init(tags, name);
});

// ─────────────────────────────────────────────────────────────────────────────
// AFTER (por escenario)
// Captura screenshot y conserva video para TODOS los escenarios.
//
// Flujo de evidencias:
//   ÉXITO → screenshot PASS_xxx.png + video PASS_xxx.webm en CU/
//   FALLO → screenshot FAIL_xxx.png + video FAIL_xxx.webm en CU/
//   RETRY → se trata como FALLO
// ─────────────────────────────────────────────────────────────────────────────
After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const status   = scenario.result?.status;
  const failed   = status === Status.FAILED;
  const prefijo  = failed ? 'FAIL' : 'PASS';
  const cuFolder = this.cuFolder;
  const scenarioName = this.scenarioName;

  // ── 1. SCREENSHOT (siempre) ─────────────────────────────────────────────────
  if (this.page) {
    try {
      const screenshotDir = evidenceManager.getScreenshotDir(cuFolder);
      const fileName      = evidenceManager.buildEvidenceName(prefijo, scenarioName);
      const screenshotPath = path.join(screenshotDir, fileName);

      const buffer = await this.page.screenshot({ path: screenshotPath, fullPage: true });

      // La imagen se adjunta al reporte HTML de Cucumber (visible al abrir el reporte)
      this.attach(buffer, 'image/png');
      this.attach(`Screenshot guardado en:\n${screenshotPath}`, 'text/plain');
    } catch (err) {
      console.warn(`  [hooks] No se pudo capturar screenshot: ${err}`);
    }
  }

  // ── 2. TEARDOWN (cierra browser y finaliza el video en disco) ──────────────
  let videoSourcePath: string | undefined;
  try {
    videoSourcePath = await this.teardown();
  } catch (err) {
    console.warn(`  [hooks] Error en teardown: ${err}`);
  }

  // ── 3. VIDEO (siempre se mueve al directorio CU con nombre descriptivo) ─────
  if (videoSourcePath) {
    const targetPath = await evidenceManager.moveVideo(
      videoSourcePath,
      cuFolder,
      scenarioName,
      prefijo,
    );
    if (targetPath) {
      this.attach(`Video grabado en:\n${targetPath}`, 'text/plain');
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AFTER ALL
// Imprime el resumen de dónde encontrar las evidencias.
// ─────────────────────────────────────────────────────────────────────────────
AfterAll(async function () {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Suite completada.');
  console.log(`\n  Evidencias → ${evidenceManager.getRunDir()}/`);
  console.log('  ├── CU-01_Autenticacion/');
  console.log('  │   ├── screenshots/  (PASS_*.png  |  FAIL_*.png)');
  console.log('  │   └── videos/       (PASS_*.webm |  FAIL_*.webm)');
  console.log('  ├── CU-02_Gestion_Usuarios/');
  console.log('  ├── CU-03_Portal_Donante/');
  console.log('  ├── CU-04_Donaciones/');
  console.log('  └── CU-06_Trazabilidad/');
  console.log('\n  Reporte HTML interactivo:');
  console.log('    reports/html-report/index.html');
  console.log('    → Abrir con: npm run report:open');
  console.log('═══════════════════════════════════════════════════════════════\n');
});
