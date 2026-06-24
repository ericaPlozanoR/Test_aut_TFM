/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: {
    // Rutas a los archivos de features y step definitions
    paths: ['src/features/**/*.feature'],
    require: ['src/step-definitions/**/*.ts', 'src/support/**/*.ts'],
    requireModule: ['ts-node/register'],

    // Idioma español para palabras clave Gherkin
    language: 'es',

    // Formato de salida: consola con colores + JSON para el reporte HTML
    format: [
      '@cucumber/pretty-formatter',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
    ],

    formatOptions: { snippetInterface: 'async-await' },

    // Número de reintentos en caso de fallo flaky
    retry: 1,

    // Ejecutar escenarios en paralelo (ajustar según CI)
    parallel: 1,

    // Tags para filtrado: ejecutar solo @smoke en CI rápido
    // tags: '@smoke',
  },

  // Perfil para pruebas de humo (CI/CD)
  smoke: {
    paths: ['src/features/**/*.feature'],
    require: ['src/step-definitions/**/*.ts', 'src/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    language: 'es',
    format: ['@cucumber/pretty-formatter', 'json:reports/smoke-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    tags: '@smoke',
  },
};
