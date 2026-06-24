/**
 * Genera un reporte HTML consolidado a partir del JSON de Cucumber.
 * Ejecutar con: npm run report
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reporter = require('multiple-cucumber-html-reporter') as {
  generate: (options: Record<string, unknown>) => void;
};
import * as path from 'path';

reporter.generate({
  jsonDir: path.join(process.cwd(), 'reports'),
  reportPath: path.join(process.cwd(), 'reports', 'html-report'),
  reportName: 'Huellas del Catatumbo – Reporte de Pruebas Automatizadas',
  pageTitle: 'TFM UNIR – QA Report',
  brandTitle: 'Fundación Huellas del Catatumbo',
  metadata: {
    browser: { name: process.env.BROWSER ?? 'chromium', version: 'latest' },
    device: 'Local',
    platform: { name: 'Windows', version: '11' },
  },
  customData: {
    title: 'Información del Build',
    data: [
      { label: 'Proyecto', value: 'Plataforma de Donaciones – TFM UNIR' },
      { label: 'Fecha', value: new Date().toLocaleString('es-CO') },
      { label: 'Entorno', value: process.env.BASE_URL ?? 'https://huellasdelcatatumbo.com' },
    ],
  },
});

console.log('✅ Reporte HTML generado en: reports/html-report/index.html');
