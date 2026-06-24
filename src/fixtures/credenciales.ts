import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Centraliza las credenciales de prueba por rol.
 * Los valores se leen desde .env para no exponerlos en el código fuente.
 *
 * loginUrl:     URL del formulario de login para cada tipo de usuario.
 *               - Roles admin-panel: /login/admin  (sin reCAPTCHA)
 *               - Usuarios regulares: /login       (con reCAPTCHA v3)
 * dashboardUrl: URL de destino tras autenticarse correctamente.
 */
export const Credenciales = {
  administrador: {
    usuario: process.env.ADMIN_USER ?? 'super_admin',
    contrasena: process.env.ADMIN_PASS ?? '',
    loginUrl: '/login/admin',
    dashboardUrl: '/admin-home',
  },
  director: {
    usuario: process.env.DIRECTOR_USER ?? 'director_fundorex',
    contrasena: process.env.DIRECTOR_PASS ?? '',
    loginUrl: '/login/admin',
    dashboardUrl: '/admin-home',
  },
  coordinador: {
    usuario: process.env.COORDINADOR_USER ?? 'coordinador_ocana',
    contrasena: process.env.COORDINADOR_PASS ?? '',
    loginUrl: '/login/admin',
    dashboardUrl: '/admin-home',
  },
  voluntario: {
    usuario: process.env.VOLUNTARIO_USER ?? 'voluntario_catatumbo',
    contrasena: process.env.VOLUNTARIO_PASS ?? '',
    loginUrl: '/login/admin',
    dashboardUrl: '/admin-home',
  },
  usuario: {
    usuario: process.env.USUARIO_USER ?? 'antuan23',
    contrasena: process.env.USUARIO_PASS ?? '',
    loginUrl: '/login',
    dashboardUrl: '/user-home',
  },
} as const;

export type RolUsuario = keyof typeof Credenciales;
