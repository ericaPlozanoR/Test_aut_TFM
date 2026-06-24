# language: es
# ==============================================================================
# Feature: Autenticación de usuarios
# Historia de Usuario (HU-01): Como usuario registrado, quiero iniciar sesión
# con mis credenciales para acceder a las funciones según mi rol.
# Casos de Uso relacionados: CU-01
# ==============================================================================

Característica: Autenticación de usuarios en la plataforma

  Como usuario registrado en la Fundación Huellas del Catatumbo
  Quiero iniciar sesión con mis credenciales
  Para acceder a las funcionalidades correspondientes a mi rol

  Antecedentes:
    Dado que estoy en la página de inicio de sesión

  @smoke @login
  Escenario: Inicio de sesión exitoso como Administrador
    Cuando ingreso el usuario "super_admin"
    Y ingreso la contraseña "beta9023#"
    Y hago clic en el botón "Ingresar"
    Entonces debería ser redirigido al panel de administración
    Y debería ver el menú de "Usuarios" en la barra lateral

  @smoke @login
  Escenario: Inicio de sesión exitoso como Director
    Cuando ingreso el usuario "director_fundorex"
    Y ingreso la contraseña "Admin123!"
    Y hago clic en el botón "Ingresar"
    Entonces debería ser redirigido al panel principal
    Y debería ver el menú de "Donaciones" en la barra lateral

  @login
  Escenario: Inicio de sesión exitoso como Coordinador
    Cuando ingreso el usuario "coordinador_ocana"
    Y ingreso la contraseña "Acopio123!"
    Y hago clic en el botón "Ingresar"
    Entonces debería ser redirigido al panel principal
    Y debería ver el menú de "Acopios" en la barra lateral

  @login
  Escenario: Inicio de sesión exitoso como Voluntario
    Cuando ingreso el usuario "voluntario_catatumbo"
    Y ingreso la contraseña "Voluntario123!"
    Y hago clic en el botón "Ingresar"
    Entonces debería ser redirigido al panel principal

  @login @negativo
  Escenario: Inicio de sesión con contraseña incorrecta
    Cuando ingreso el usuario "super_admin"
    Y ingreso la contraseña "contrasena_incorrecta"
    Y hago clic en el botón "Ingresar"
    Entonces debería ver un mensaje de error de autenticación
    Y debería permanecer en la página de inicio de sesión

  @login @negativo
  Escenario: Inicio de sesión con usuario inexistente
    Cuando ingreso el usuario "usuario_que_no_existe"
    Y ingreso la contraseña "cualquier_clave"
    Y hago clic en el botón "Ingresar"
    Entonces debería ver un mensaje de error de autenticación
    Y debería permanecer en la página de inicio de sesión

  @login @negativo
  Escenario: Intento de inicio de sesión con campos vacíos
    Cuando dejo el campo de usuario vacío
    Y dejo el campo de contraseña vacío
    Y hago clic en el botón "Ingresar"
    Entonces debería ver una indicación de campos requeridos
    Y debería permanecer en la página de inicio de sesión

  @login
  Escenario: Cierre de sesión exitoso
    Dado que he iniciado sesión como "administrador"
    Cuando hago clic en la opción "Cerrar sesión"
    Entonces debería ser redirigido a la página de inicio de sesión

  @login
  Escenario: Redirección al intentar acceder sin autenticación
    Dado que no he iniciado sesión
    Cuando intento acceder directamente a "/admin-home/donations/reports"
    Entonces debería ser redirigido a la página de inicio de sesión

  @smoke @login
  Esquema del escenario: Verificación de acceso según rol
    Dado que he iniciado sesión con el rol "<rol>"
    Entonces debería ver el módulo "<modulo_visible>"
    Y no debería tener acceso a "<modulo_restringido>"

    Ejemplos:
      | rol           | modulo_visible | modulo_restringido |
      | administrador | Usuarios       | —                  |
      | director      | Donaciones     | —                  |
      | coordinador   | Acopios        | Usuarios           |
      | voluntario    | Acopios        | Donaciones         |
