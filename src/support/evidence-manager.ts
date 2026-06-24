import * as fs from 'fs';
import * as path from 'path';

// ── Mapeo de tags Cucumber → carpeta de Caso de Uso ───────────────────────────
const TAG_TO_CU: Record<string, string> = {
  login:          'CU-01_Autenticacion',
  usuarios:       'CU-02_Gestion_Usuarios',
  portal_donante: 'CU-03_Portal_Donante',
  donaciones:     'CU-04_Donaciones',
  trazabilidad:   'CU-06_Trazabilidad',
};
const DEFAULT_CU = 'CU-00_General';

// ── ID de ejecución único por proceso Node (se calcula UNA vez al importar) ────
const RUN_ID = new Date()
  .toISOString()
  .replace('T', '_')
  .replace(/:/g, '-')
  .substring(0, 19); // "2024-11-15_14-30-00"

const EVIDENCIAS_BASE = path.join(process.cwd(), 'test-results', 'evidencias');

/**
 * EvidenceManager — Singleton que centraliza la generación de rutas y carpetas
 * de evidencias para el runner Cucumber + Playwright.
 *
 * Estructura de carpetas generada:
 *   test-results/
 *   └── evidencias/
 *       └── 2024-11-15_14-30-00/          ← RUN_ID (una carpeta por ejecución)
 *           ├── CU-01_Autenticacion/
 *           │   ├── screenshots/
 *           │   └── videos/
 *           ├── CU-04_Donaciones/
 *           │   ├── screenshots/
 *           │   └── videos/
 *           ├── CU-06_Trazabilidad/
 *           │   ├── screenshots/
 *           │   └── videos/
 *           └── _tmp_videos/              ← temporal; Playwright graba aquí y
 *                                            los hooks mueven al CU correcto
 */
export class EvidenceManager {
  private static instance: EvidenceManager;
  private readonly runDir: string;
  private readonly tmpVideoDir: string;

  private constructor() {
    this.runDir = path.join(EVIDENCIAS_BASE, RUN_ID);
    this.tmpVideoDir = path.join(this.runDir, '_tmp_videos');
    this.ensureDir(this.tmpVideoDir); // pre-crear para que Playwright no falle
  }

  static getInstance(): EvidenceManager {
    if (!EvidenceManager.instance) {
      EvidenceManager.instance = new EvidenceManager();
    }
    return EvidenceManager.instance;
  }

  // ── Getters de rutas ────────────────────────────────────────────────────────

  /** Directorio raíz de esta ejecución (contiene todas las carpetas CU) */
  getRunDir(): string {
    return this.runDir;
  }

  /** Directorio temporal donde Playwright graba los videos inicialmente */
  getVideoTempDir(): string {
    return this.tmpVideoDir;
  }

  /** Directorio de screenshots para un CU; lo crea si no existe */
  getScreenshotDir(cuFolder: string): string {
    const dir = path.join(this.runDir, cuFolder, 'screenshots');
    this.ensureDir(dir);
    return dir;
  }

  /** Directorio de videos definitivos para un CU; lo crea si no existe */
  getVideoDir(cuFolder: string): string {
    const dir = path.join(this.runDir, cuFolder, 'videos');
    this.ensureDir(dir);
    return dir;
  }

  // ── Lógica de categorización ────────────────────────────────────────────────

  /**
   * Determina la carpeta CU a partir de los tags del escenario.
   * Recibe los tags con o sin '@' (ej: '@smoke', 'login').
   */
  getCuFolder(tags: string[]): string {
    for (const tag of tags) {
      const clean = tag.replace(/^@/, '').toLowerCase();
      if (TAG_TO_CU[clean]) return TAG_TO_CU[clean];
    }
    return DEFAULT_CU;
  }

  // ── Nombrado de archivos ───────────────────────────────────────────────────

  /**
   * Genera un nombre de archivo de evidencia seguro para el sistema de archivos.
   * Formato: {PREFIJO}_{descripcion_segura}_{timestamp}.{ext}
   *
   * @param prefijo  - 'FAIL' | 'MANUAL' | 'INFO' | 'CRITICO'
   * @param descripcion - Nombre del escenario o paso descriptivo
   * @param ext      - Extensión del archivo sin punto (default: 'png')
   */
  buildEvidenceName(
    prefijo: 'PASS' | 'FAIL' | 'MANUAL' | 'INFO' | 'CRITICO',
    descripcion: string,
    ext = 'png',
  ): string {
    // Reemplaza caracteres no seguros manteniendo acentos y eñe
    const seguro = descripcion
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑüÜ ]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 60)
      .replace(/_+$/, ''); // sin guiones bajos al final

    return `${prefijo}_${seguro}_${Date.now()}.${ext}`;
  }

  // ── Gestión de videos ──────────────────────────────────────────────────────

  /**
   * Mueve un video desde el directorio temporal al directorio CU correspondiente
   * con un nombre descriptivo basado en el nombre del escenario.
   *
   * Playwright guarda videos con nombres UUID; este método los renombra
   * para que sean legibles en el reporte de evidencias.
   */
  async moveVideo(
    sourcePath: string,
    cuFolder: string,
    scenarioName: string,
    prefijo: 'PASS' | 'FAIL' = 'FAIL',
  ): Promise<string | undefined> {
    if (!sourcePath || !fs.existsSync(sourcePath)) return undefined;

    const targetDir = this.getVideoDir(cuFolder);
    const fileName = this.buildEvidenceName(prefijo, scenarioName, 'webm');
    const targetPath = path.join(targetDir, fileName);

    try {
      fs.copyFileSync(sourcePath, targetPath);
      fs.unlinkSync(sourcePath);
      return targetPath;
    } catch (err) {
      console.warn(`[EvidenceManager] No se pudo mover el video: ${err}`);
      return undefined;
    }
  }

  /**
   * Elimina silenciosamente un archivo de video (para pruebas que pasan,
   * implementando el comportamiento `retain-on-failure`).
   */
  deleteVideo(videoPath: string): void {
    try {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    } catch {
      // Ignorar errores de eliminación (archivo ya eliminado, etc.)
    }
  }

  // ── Utilidades internas ────────────────────────────────────────────────────

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ── Acceso al RUN_ID para logs y reportes ──────────────────────────────────
  getRunId(): string {
    return RUN_ID;
  }
}
