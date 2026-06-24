import { Given, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { Credenciales, RolUsuario } from '../fixtures/credenciales';
import { DonacionesPage } from '../pages/DonacionesPage';
import { GestionUsuariosPage } from '../pages/GestionUsuariosPage';

// ── Alias de login (variante de fraseado usada en donaciones/trazabilidad) ────

const MAPA_ROLES: Record<string, RolUsuario> = {
  administrador: 'administrador', director: 'director',
  coordinador:   'coordinador',   voluntario: 'voluntario', usuario: 'usuario',
};

Given('que he iniciado sesión como {string}', async function (this: CustomWorld, rol: string) {
  this.loginPage    = new LoginPage(this.page, this.baseUrl);
  this.dashboardPage = new DashboardPage(this.page, this.baseUrl);

  const claveRol = MAPA_ROLES[rol.toLowerCase()];
  if (!claveRol) throw new Error(`Rol desconocido: "${rol}"`);

  const creds = Credenciales[claveRol];
  await this.loginPage.abrirPaginaLogin(creds.loginUrl);
  await this.loginPage.iniciarSesion(creds.usuario, creds.contrasena);

  const enDashboard = await this.dashboardPage.esDashboardVisible();
  expect(enDashboard, `Debería estar en el dashboard como ${rol}`).toBe(true);
});

// ── Búsqueda genérica (dispatcher por POM activo) ─────────────────────────────

When('busco por el término {string}', async function (this: CustomWorld, termino: string) {
  if (this.usuariosPage) {
    await this.usuariosPage.buscarUsuario(termino);
  } else {
    if (!this.donacionesPage) this.donacionesPage = new DonacionesPage(this.page, this.baseUrl);
    await this.donacionesPage.buscarDonacion(termino);
  }
});

// ── Dispatcher genérico de clics en botones ───────────────────────────────────

/**
 * Única definición de "hago clic en el botón {string}" en todo el proyecto.
 * Delega al Page Object activo en el World del escenario.
 */
When('hago clic en el botón {string}', async function (this: CustomWorld, boton: string) {
  switch (boton) {
    // ── Login ──────────────────────────────────────────────────────────────
    case 'Ingresar':
    case 'Iniciar sesión':
      await this.loginPage?.clickBotonIngresar();
      break;

    // ── Donaciones / Reports ───────────────────────────────────────────────
    case 'Nueva Donación':
    case 'Registrar Donación':
      // El admin panel no tiene formulario de nueva donación; navegar a reports
      if (!this.donacionesPage) this.donacionesPage = new DonacionesPage(this.page, this.baseUrl);
      await this.donacionesPage.abrirInformeDonaciones();
      break;

    case 'Guardar':
      if (this.donacionesPage && !this.usuariosPage) {
        await this.donacionesPage.exportarCSV();
      } else if (this.usuariosPage) {
        await this.usuariosPage.guardar();
      }
      break;

    case 'Export CSV':
    case 'Exportar CSV':
      if (!this.donacionesPage) this.donacionesPage = new DonacionesPage(this.page, this.baseUrl);
      await this.donacionesPage.exportarCSV();
      break;

    // ── Trazabilidad ───────────────────────────────────────────────────────
    case 'Buscar':
      // La búsqueda ya se ejecutó en "ingreso el código de trazabilidad".
      await this.page.waitForLoadState('domcontentloaded');
      break;

    case 'Actualizar estado':
    case 'Actualizar':
      await this.trazabilidadPage?.actualizarEstado(
        this.nuevoEstado ?? '',
        this.observacion ?? '',
      );
      break;

    // ── Usuarios ───────────────────────────────────────────────────────────
    case 'Nuevo Usuario':
    case 'Crear Usuario':
      if (!this.usuariosPage) this.usuariosPage = new GestionUsuariosPage(this.page, this.baseUrl);
      await this.usuariosPage.abrirFormularioNuevoUsuario();
      break;

    case 'Cerrar sesión':
      await this.dashboardPage?.cerrarSesion();
      break;

    // ── Pestañas de reports ────────────────────────────────────────────────
    default:
      // Intento genérico: botón, enlace o pestaña con el texto indicado
      await this.page
        .locator(`button:has-text("${boton}"), a:has-text("${boton}"), button.tab-btn:has-text("${boton}")`)
        .first()
        .click();
      await this.page.waitForLoadState('domcontentloaded');
  }
});
