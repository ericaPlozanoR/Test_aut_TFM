import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { Credenciales, RolUsuario } from '../fixtures/credenciales';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Mapa de alias en español al nombre de clave en Credenciales */
const MAPA_ROLES: Record<string, RolUsuario> = {
  administrador: 'administrador',
  director:      'director',
  coordinador:   'coordinador',
  voluntario:    'voluntario',
  usuario:       'usuario',
};

function resolverRol(rol: string): RolUsuario {
  const clave = MAPA_ROLES[rol.toLowerCase()];
  if (!clave) throw new Error(`Rol desconocido: "${rol}". Válidos: ${Object.keys(MAPA_ROLES).join(', ')}`);
  return clave;
}

// ── Antecedentes / Given ──────────────────────────────────────────────────────

/**
 * Navega al login del panel admin por defecto (todos los escenarios directos
 * de autenticacion.feature usan credenciales de admin panel).
 */
Given('que estoy en la página de inicio de sesión', async function (this: CustomWorld) {
  this.loginPage    = new LoginPage(this.page, this.baseUrl);
  this.dashboardPage = new DashboardPage(this.page, this.baseUrl);
  await this.loginPage.abrirPaginaLogin('/login/admin');
  const esVisible = await this.loginPage.esPaginaLoginVisible();
  expect(esVisible, 'La página de login debería estar visible').toBe(true);
});

Given('que he iniciado sesión con el rol {string}', async function (this: CustomWorld, rol: string) {
  this.loginPage    = new LoginPage(this.page, this.baseUrl);
  this.dashboardPage = new DashboardPage(this.page, this.baseUrl);

  const claveRol = resolverRol(rol);
  const creds = Credenciales[claveRol];

  await this.loginPage.abrirPaginaLogin(creds.loginUrl);
  await this.loginPage.iniciarSesion(creds.usuario, creds.contrasena);

  const enDashboard = await this.dashboardPage.esDashboardVisible();
  expect(enDashboard, `Debería estar en el dashboard tras iniciar sesión como ${rol}`).toBe(true);
});

Given('que no he iniciado sesión', async function (this: CustomWorld) {
  this.loginPage    = new LoginPage(this.page, this.baseUrl);
  this.dashboardPage = new DashboardPage(this.page, this.baseUrl);
  await this.loginPage.abrirPaginaLogin('/login/admin');
});

// ── When / Cuando ─────────────────────────────────────────────────────────────

When('ingreso el usuario {string}', async function (this: CustomWorld, usuario: string) {
  await this.loginPage!.ingresarUsuario(usuario);
});

When('ingreso la contraseña {string}', async function (this: CustomWorld, contrasena: string) {
  await this.loginPage!.ingresarContrasena(contrasena);
});

When('dejo el campo de usuario vacío', async function (this: CustomWorld) {
  await this.loginPage!.ingresarUsuario('');
});

When('dejo el campo de contraseña vacío', async function (this: CustomWorld) {
  await this.loginPage!.ingresarContrasena('');
});

When('hago clic en la opción {string}', async function (this: CustomWorld, opcion: string) {
  if (opcion === 'Cerrar sesión') {
    await this.dashboardPage!.cerrarSesion();
  }
});

When('intento acceder directamente a {string}', async function (this: CustomWorld, ruta: string) {
  await this.page.goto(`${this.baseUrl}${ruta}`, { waitUntil: 'domcontentloaded' });
});

// ── Then / Entonces ───────────────────────────────────────────────────────────

Then('debería ser redirigido al panel de administración', async function (this: CustomWorld) {
  const enDashboard = await this.dashboardPage!.esDashboardVisible();
  expect(enDashboard, 'Debería estar en el panel principal tras el login').toBe(true);
});

Then('debería ser redirigido al panel principal', async function (this: CustomWorld) {
  const enDashboard = await this.dashboardPage!.esDashboardVisible();
  expect(enDashboard, 'Debería estar en el panel principal tras el login').toBe(true);
});

Then('debería ser redirigido a la página de inicio de sesión', async function (this: CustomWorld) {
  await this.page.waitForURL(/login/, { timeout: 10_000 }).catch(() => {});
  const enLogin = this.loginPage!.esUrlLogin();
  expect(enLogin, 'Debería redirigir a /login').toBe(true);
});

Then('debería ver el menú de {string} en la barra lateral', async function (this: CustomWorld, modulo: string) {
  const esVisible = await this.dashboardPage!.esMenuVisible(modulo);
  expect(esVisible, `El menú "${modulo}" debería ser visible para este rol`).toBe(true);
});

Then('debería ver un mensaje de error de autenticación', async function (this: CustomWorld) {
  const hayError = await this.loginPage!.hayMensajeError();
  expect(hayError, 'Debería aparecer un mensaje de error de autenticación').toBe(true);
});

Then('debería permanecer en la página de inicio de sesión', async function (this: CustomWorld) {
  const enLogin = this.loginPage!.esUrlLogin();
  expect(enLogin, 'Debería seguir en /login después del error').toBe(true);
});

Then('debería ver una indicación de campos requeridos', async function (this: CustomWorld) {
  const hayIndicacion = await this.loginPage!.hayMensajeError();
  expect(
    hayIndicacion || this.loginPage!.esUrlLogin(),
    'Debería haber indicación de campo requerido o permanecer en login',
  ).toBe(true);
});

Then('debería ver el módulo {string}', async function (this: CustomWorld, modulo: string) {
  const esVisible = await this.dashboardPage!.esMenuVisible(modulo);
  expect(esVisible, `El módulo "${modulo}" debería ser visible`).toBe(true);
});

Then('no debería tener acceso a {string}', async function (this: CustomWorld, modulo: string) {
  if (modulo === '—' || modulo === '') return;
  const esVisible = await this.dashboardPage!.esMenuVisible(modulo);
  expect(esVisible, `El módulo "${modulo}" NO debería ser visible para este rol`).toBe(false);
});
