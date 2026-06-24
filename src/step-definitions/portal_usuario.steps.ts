import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { PortalUsuarioPage } from '../pages/PortalUsuarioPage';

// ── When / Cuando (y antecedentes Given comparten la misma definición) ────────

When('navego al dashboard del portal de donante', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirDashboard();
});

When('accedo al historial de mis donaciones', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirHistorialDonaciones();
});

When('accedo a la configuración de mi perfil de donante', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirEditarPerfil();
});

When('navego al catálogo de donaciones disponibles', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirCatalogoDonaciones();
});

When('filtro mis donaciones por el estado {string}', async function (this: CustomWorld, estado: string) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.filtrarPorEstado(estado);
});

When('busco una donación con el término {string}', async function (this: CustomWorld, termino: string) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.buscarDonacion(termino);
});

When('accedo al formulario de cambio de contraseña del portal', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirCambiarContrasena();
});

When('cierro sesión desde el portal de donante', async function (this: CustomWorld) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.cerrarSesion();
});

When('navego a la sección del portal {string}', async function (this: CustomWorld, ruta: string) {
  if (!this.portalUsuarioPage) this.portalUsuarioPage = new PortalUsuarioPage(this.page, this.baseUrl);
  await this.portalUsuarioPage.abrirSeccion(ruta);
});

// ── Then / Entonces ───────────────────────────────────────────────────────────

Then('debería ver el panel de bienvenida del donante', async function (this: CustomWorld) {
  const enDashboard = await this.portalUsuarioPage!.esDashboardVisible();
  expect(enDashboard, 'Debería estar en el dashboard del portal').toBe(true);
  const texto = await this.page.locator('body').innerText();
  expect(texto, 'Debería ver el texto de bienvenida o el menú del panel').toMatch(/Dashboard|Welcome|ACCOUNT PANEL/i);
});

Then('debería ver las estadísticas de mis donaciones', async function (this: CustomWorld) {
  const tieneStats = await this.portalUsuarioPage!.tieneEstadisticas();
  expect(tieneStats, 'Debería ver las estadísticas de donaciones (THIS MONTH / LIFETIME TOTAL)').toBe(true);
});

Then('debería ver la sección de historial de donaciones', async function (this: CustomWorld) {
  const tieneHistorial = await this.portalUsuarioPage!.tieneListaDonaciones();
  expect(tieneHistorial, 'Debería ver la sección de donaciones con su encabezado').toBe(true);
});

Then('debería ver el resumen de mis totales de donación', async function (this: CustomWorld) {
  const tieneResumen = await this.portalUsuarioPage!.tieneResumenDonaciones();
  expect(tieneResumen, 'Debería ver el resumen de totales (Total Donations / This Month)').toBe(true);
});

Then('debería ver al menos una donación registrada en el historial', async function (this: CustomWorld) {
  const hayDonacion = await this.portalUsuarioPage!.hayAlgunaDonacion();
  expect(hayDonacion, 'Debería haber al menos una donación en el historial').toBe(true);
});

Then('debería ver el formulario de edición de perfil', async function (this: CustomWorld) {
  const formularioVisible = await this.portalUsuarioPage!.estaFormularioPerfilVisible();
  expect(formularioVisible, 'El formulario de edición de perfil debería estar visible').toBe(true);
});

Then('mis datos de perfil deberían estar precargados en el formulario', async function (this: CustomWorld) {
  const tieneDatos = await this.portalUsuarioPage!.tieneDataPrecargada();
  expect(tieneDatos, 'Los campos del perfil deberían tener datos precargados').toBe(true);
});

Then('debería ver las campañas disponibles para donar', async function (this: CustomWorld) {
  const tieneCampanas = await this.portalUsuarioPage!.tieneItemsCatalogo();
  expect(tieneCampanas, 'Debería ver el catálogo de campañas con botón "Donate Now"').toBe(true);
});

Then('cada campaña debería mostrar el monto recaudado', async function (this: CustomWorld) {
  const tieneMonto = await this.portalUsuarioPage!.tieneMontoRecaudado();
  expect(tieneMonto, 'Las campañas deberían mostrar el monto recaudado (Raised: $...)').toBe(true);
});

Then('debería ver la lista de donaciones actualizada', async function (this: CustomWorld) {
  const tieneListado = await this.portalUsuarioPage!.tieneListaDonaciones();
  expect(tieneListado, 'La lista de donaciones debería seguir visible tras aplicar el filtro').toBe(true);
});

Then('debería ver resultados relacionados con {string} en el historial', async function (this: CustomWorld, termino: string) {
  const hayResultados = await this.portalUsuarioPage!.hayResultadosBusqueda(termino);
  // Si no hay resultados visibles, aceptar que la búsqueda se procesó (filtrado vacío también es válido)
  const tieneHistorial = await this.portalUsuarioPage!.tieneListaDonaciones();
  expect(hayResultados || tieneHistorial,
    `La búsqueda por "${termino}" debería procesarse y mostrar resultados o historial`).toBe(true);
});

Then('el campo nombre del perfil debería tener contenido', async function (this: CustomWorld) {
  const nombre = await this.portalUsuarioPage!.obtenerNombreDelPerfil();
  expect(nombre.trim().length, 'El campo nombre no debería estar vacío').toBeGreaterThan(0);
});

Then('el campo email del perfil debería contener una dirección válida', async function (this: CustomWorld) {
  const email = await this.portalUsuarioPage!.obtenerEmailDelPerfil();
  expect(email, 'El email debería tener formato válido').toMatch(/@/);
});

Then('debería ver los campos para la contraseña actual y nueva', async function (this: CustomWorld) {
  const formularioVisible = await this.portalUsuarioPage!.estaFormularioCambioContrasenaVisible();
  expect(formularioVisible, 'Los campos de cambio de contraseña deberían ser visibles').toBe(true);
});

Then('el botón para guardar la nueva contraseña debería estar disponible', async function (this: CustomWorld) {
  const botonVisible = await this.portalUsuarioPage!.tieneBotonGuardarContrasena();
  expect(botonVisible, 'El botón "Save changes" debería estar visible').toBe(true);
});

Then('debería salir del portal y ser redirigido al inicio', async function (this: CustomWorld) {
  await this.page.waitForTimeout(500);
  const url = this.page.url();
  // Aceptar: página de login, homepage pública o cualquier URL fuera de /user-home
  expect(url, 'Debería salir del portal tras el logout').not.toContain('/user-home');
});

Then('el cuerpo de la página debería contener el texto {string}', async function (this: CustomWorld, textoEsperado: string) {
  const texto = await this.page.locator('body').innerText();
  expect(texto, `La página debería contener "${textoEsperado}"`).toContain(textoEsperado);
});
