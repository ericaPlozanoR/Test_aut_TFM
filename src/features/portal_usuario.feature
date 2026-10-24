# language: es
# ==============================================================================
# Feature: Portal del usuario donante
# Historia de Usuario (HU-03): Como usuario donante registrado, quiero acceder
# a mi panel personal para visualizar y gestionar mis donaciones y perfil.
# Casos de Uso relacionados: CU-03
# ==============================================================================

Característica: Portal del usuario donante

  Como usuario donante registrado en la Fundación Huellas del Catatumbo
  Quiero acceder a mi panel personal
  Para gestionar mis donaciones, perfil y actividad en la plataforma

  @smoke @portal_donante
  Escenario: Acceso exitoso al dashboard del usuario donante
    Dado que he iniciado sesión como "usuario"
    Cuando navego al dashboard del portal de donante
    Entonces debería ver el panel de bienvenida del donante
    Y debería ver las estadísticas de mis donaciones

  @smoke @portal_donante
  Escenario: Visualización del historial de donaciones
    Dado que he iniciado sesión como "usuario"
    Cuando accedo al historial de mis donaciones
    Entonces debería ver la sección de historial de donaciones
    Y debería ver el resumen de mis totales de donación
    Y debería ver al menos una donación registrada en el historial

  @smoke @portal_donante
  Escenario: Acceso al formulario de edición de perfil
    Dado que he iniciado sesión como "usuario"
    Cuando accedo a la configuración de mi perfil de donante
    Entonces debería ver el formulario de edición de perfil
    Y mis datos de perfil deberían estar precargados en el formulario

  @smoke @portal_donante
  Escenario: Visualización del catálogo de campañas disponibles
    Dado que he iniciado sesión como "usuario"
    Cuando navego al catálogo de donaciones disponibles
    Entonces debería ver las campañas disponibles para donar
    Y cada campaña debería mostrar el monto recaudado

  @portal_donante
  Escenario: Filtrado de donaciones por estado "Completadas"
    Dado que he iniciado sesión como "usuario"
    Y accedo al historial de mis donaciones
    Cuando filtro mis donaciones por el estado "completadas"
    Entonces debería ver la lista de donaciones actualizada

  @portal_donante
  Escenario: Búsqueda de donación por nombre de campaña
    Dado que he iniciado sesión como "usuario"
    Y accedo al historial de mis donaciones
    Cuando busco una donación con el término "Kits"
    Entonces debería ver resultados relacionados con "Kits" en el historial

  @portal_donante
  Escenario: Validación de datos precargados en el perfil
    Dado que he iniciado sesión como "usuario"
    Cuando accedo a la configuración de mi perfil de donante
    Entonces el campo nombre del perfil debería tener contenido
    Y el campo email del perfil debería contener una dirección válida

  @portal_donante
  Escenario: Acceso al formulario de cambio de contraseña
    Dado que he iniciado sesión como "usuario"
    Cuando accedo al formulario de cambio de contraseña del portal
    Entonces debería ver los campos para la contraseña actual y nueva
    Y el botón para guardar la nueva contraseña debería estar disponible

  @portal_donante
  Escenario: Cierre de sesión desde el portal del donante
    Dado que he iniciado sesión como "usuario"
    Cuando cierro sesión desde el portal de donante
    Entonces debería salir del portal y ser redirigido al inicio

  @portal_donante
  Escenario: Redirección al intentar acceder al portal sin autenticación
    Dado que no he iniciado sesión
    Cuando intento acceder directamente a "/user-home"
    Entonces debería ser redirigido a la página de inicio de sesión

  @smoke @portal_donante
  Esquema del escenario: Acceso a secciones clave del portal del donante
    Dado que he iniciado sesión como "usuario"
    Cuando navego a la sección del portal "<ruta>"
    Entonces el cuerpo de la página debería contener el texto "<titulo_esperado>"

    Ejemplos:
      | ruta                                     | titulo_esperado     |
      | /user-home/donations                     | Mis Donaciones      |
      | /user-home/edit-profile                  | Editar Perfil       |
      | /user-home/change-password               | Cambiar Contraseña  |
      | /user-home/support-tickets               | Support Tickets     |
