/**
 * evidencias.steps.ts — Pasos para capturas manuales en puntos críticos.
 *
 * Estos steps son opcionales: se pueden insertar en cualquier escenario
 * para documentar estados relevantes más allá de los fallos automáticos.
 *
 * Ejemplo de uso en un .feature:
 *
 *   Cuando guardo la donación
 *   Y capturo evidencia del código de trazabilidad generado
 *   Entonces debería ver un mensaje de registro exitoso
 */
import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { ScreenshotHelper, tomarCaptura } from '../utils/screenshot-helper';

// ── Capturas manuales en pasos de trazabilidad ────────────────────────────────

/**
 * Captura el formulario de donación antes del envío.
 * Usar justo ANTES de hacer clic en "Guardar".
 */
When(
  'capturo el estado del formulario de donación',
  async function (this: CustomWorld) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    await helper.capturarEtapaTrazabilidad('pre-envio', this.scenarioName);
  },
);

/**
 * Captura la confirmación tras guardar una donación.
 * Usar justo DESPUÉS de que aparezca el mensaje de éxito.
 */
When(
  'capturo la confirmación del envío de la donación',
  async function (this: CustomWorld) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    await helper.capturarEtapaTrazabilidad('post-envio', this.scenarioName);
  },
);

/**
 * Captura el estado de la línea de tiempo de trazabilidad.
 * Usar después de buscar por código de trazabilidad.
 */
When(
  'capturo la línea de tiempo de trazabilidad',
  async function (this: CustomWorld) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    await helper.capturarEtapaTrazabilidad('trazabilidad', this.scenarioName);
  },
);

/**
 * Captura el código de trazabilidad generado (elemento específico).
 * Útil para dejar evidencia del código asignado sin capturar toda la pantalla.
 */
When(
  'capturo evidencia del código de trazabilidad generado',
  async function (this: CustomWorld) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    // Intenta capturar el elemento específico del código; si no existe,
    // cae en captura completa de la página
    try {
      await helper.capturarElemento(
        '[data-testid="codigo-trazabilidad"], .codigo-donacion, .tracking-code',
        'Codigo_trazabilidad_generado',
      );
    } catch {
      await helper.capturarPuntoCritico('Codigo_trazabilidad_pagina_completa');
    }
  },
);

/**
 * Captura con resaltado visual de un campo específico.
 * Útil para señalar en la evidencia el elemento que se está validando.
 */
When(
  'capturo evidencia resaltando el elemento {string}',
  async function (this: CustomWorld, selector: string) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    await helper.capturarConResaltado(selector, `Resaltado_${selector.replace(/\W+/g, '_')}`);
  },
);

/**
 * Captura genérica con descripción libre. Útil para documentar
 * cualquier estado relevante que no encaje en los pasos anteriores.
 */
Then(
  'capturo evidencia con descripción {string}',
  async function (this: CustomWorld, descripcion: string) {
    await tomarCaptura(this.page, descripcion, this.cuFolder);
  },
);

/**
 * Captura la página actual y la adjunta al reporte de Cucumber.
 * La imagen aparece incrustada en el HTML del reporte.
 */
Then(
  'adjunto evidencia visual al reporte',
  async function (this: CustomWorld) {
    const helper = new ScreenshotHelper(this.page, this.cuFolder);
    // Se pasa un callback en lugar de `this` para evitar conflictos de tipo
    // con ICreateAttachment de Cucumber en modo estricto de TypeScript.
    await helper.capturarYAdjuntar(
      `Evidencia_${this.scenarioName}`,
      (buffer, mediaType) => this.attach(buffer, mediaType),
    );
  },
);
