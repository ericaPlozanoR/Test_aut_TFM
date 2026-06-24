import { Page } from 'playwright';
import { BasePage } from './BasePage';

/**
 * GestionUsuariosPage – CRUD de usuarios del sistema (rol Administrador).
 * HU-02 / CU-02: El administrador puede crear, editar, buscar y desactivar usuarios.
 *
 * URLs confirmadas:
 *   /admin-home/frontend/all-user  → listado con filtro y tabla
 *   /admin-home/frontend/new-user  → formulario de nuevo usuario
 *
 * Selectores confirmados inspeccionando el DOM real (scripts/explore-admin-panel.js).
 */
export class GestionUsuariosPage extends BasePage {
  // ── Listado de usuarios (/admin-home/frontend/all-user) ───────────────────
  private readonly tablaUsuarios     = 'table';
  private readonly campoBuscarUsuario = 'input#filterSearch';
  // Pestañas de filtro rápido
  private readonly tabTodos          = 'a.tab-btn:has-text("All")';
  private readonly tabActivos        = 'a.tab-btn:has-text("Active")';
  private readonly tabInactivos      = 'a.tab-btn:has-text("Inactive")';
  // Acciones en fila
  private readonly botonEliminarSelected = 'button#bulkDeleteBtn';

  // ── Formulario de nuevo usuario (/admin-home/frontend/new-user) ───────────
  private readonly campoNombre       = 'input[name="name"]';
  private readonly campoNombreUsuario = 'input[name="username"]';
  private readonly campoEmail        = 'input[name="email"]';
  private readonly campoTelefono     = 'input[name="phone"]';
  private readonly campoContrasena   = 'input[name="password"]';
  private readonly campoConfirmaClave = 'input[name="password_confirmation"]';
  private readonly botonGuardar      = 'button.btn-primary:has-text("Add New User")';
  private readonly botonCancelar     = 'a.btn:has-text("Cancel"), a[href*="all-user"]';

  // ── Modal de edición (/admin-home/frontend/all-user - modal inline) ────────
  private readonly editNombre        = 'input#editName';
  private readonly editEmail         = 'input#editEmail';
  private readonly botonGuardarEdicion = 'button.btn-primary:has-text("Save")';

  // ── Mensajes de resultado ──────────────────────────────────────────────────
  private readonly mensajeExito = '.alert-success, .swal2-success, [class*="toast-success"], .toast';
  private readonly mensajeError = '.alert-danger, .invalid-feedback, .swal2-error, [class*="toast-error"], [class*="error"], [role="alert"], .alert';

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  }

  // ── Navegación ─────────────────────────────────────────────────────────────

  async abrirListadoUsuarios(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/frontend/all-user`, { waitUntil: 'domcontentloaded' });
    await this.esperarVisible(this.tablaUsuarios);
  }

  async abrirFormularioNuevoUsuario(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/admin-home/frontend/new-user`, { waitUntil: 'domcontentloaded' });
    await this.esperarVisible(this.campoNombre);
  }

  // ── Relleno del formulario de nuevo usuario ────────────────────────────────

  async rellenarFormulario(datos: {
    nombre:     string;
    apellido?:  string;   // no existe en el formulario real; se concatena con nombre
    email:      string;
    username:   string;
    rol?:       string;   // no existe como campo independiente en el formulario real
    contrasena: string;
  }): Promise<void> {
    const nombreCompleto = datos.apellido
      ? `${datos.nombre} ${datos.apellido}`
      : datos.nombre;

    await this.page.locator(this.campoNombre).fill(nombreCompleto);
    await this.page.locator(this.campoNombreUsuario).fill(datos.username);
    await this.page.locator(this.campoEmail).fill(datos.email);
    await this.page.locator(this.campoContrasena).fill(datos.contrasena);
    await this.page.locator(this.campoConfirmaClave).fill(datos.contrasena);
    // Teléfono opcional: no requerido por los escenarios del TFM
    // Rol: el sistema asigna el rol en otro flujo (no en este formulario)
  }

  async guardar(): Promise<void> {
    await this.page.locator(this.botonGuardar).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Búsqueda ───────────────────────────────────────────────────────────────

  async buscarUsuario(termino: string): Promise<void> {
    const campo = this.page.locator(this.campoBuscarUsuario);
    await campo.fill('');
    await campo.fill(termino);
    // El filtro aplica en tiempo real (no requiere Enter)
    await this.page.waitForTimeout(600);
  }

  // ── Acciones sobre usuarios ────────────────────────────────────────────────

  async desactivarPrimerUsuario(): Promise<void> {
    // El sistema usa soft-delete o cambio de estado via botón de acción en la fila
    const btnAccion = this.page.locator('table tbody tr:first-child button, table tbody tr:first-child a').first();
    await btnAccion.click().catch(() => {});
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Verificaciones ─────────────────────────────────────────────────────────

  async esTablaUsuariosVisible(): Promise<boolean> {
    try {
      await this.esperarVisible(this.tablaUsuarios, 8_000);
      return true;
    } catch {
      return false;
    }
  }

  async contarFilas(): Promise<number> {
    await this.esperarVisible(this.tablaUsuarios);
    return this.page.locator('table tbody tr').count();
  }

  async obtenerMensajeExito(): Promise<string> {
    try {
      const alerta = this.page.locator(this.mensajeExito).first();
      await alerta.waitFor({ state: 'visible', timeout: 8_000 });
      return alerta.innerText();
    } catch {
      // Algunos mensajes de éxito son redirecciones; verificar por URL o texto de página
      return (await this.page.locator('h1, .page-title, .alert').first().innerText().catch(() => ''));
    }
  }

  async hayMensajeError(): Promise<boolean> {
    try {
      await this.page.locator(this.mensajeError).first().waitFor({ state: 'visible', timeout: 4_000 });
      return true;
    } catch {
      return false;
    }
  }
}
