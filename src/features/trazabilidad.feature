# language: es
# ==============================================================================
# Feature: Trazabilidad y analítica de donaciones
# Historia de Usuario (HU-06): Como usuario, quiero consultar el estado
# de las donaciones para conocer el ciclo de vida y el impacto generado.
# Casos de Uso relacionados: CU-06, CU-07
#
# Nota de implementación: La trazabilidad se implementa en dos niveles:
#   - Rol admin/coordinador: analítica en /admin-home/donations/analytics
#     (funnel, heatmap, métricas de conversión, retención de donantes)
#   - Rol usuario: historial de donaciones en /user-home/donations
# ==============================================================================

Característica: Trazabilidad del ciclo de vida de las donaciones

  Como usuario de la Fundación Huellas del Catatumbo
  Quiero consultar el estado y la analítica de las donaciones
  Para conocer el impacto y el ciclo de vida del proceso de distribución

  @smoke @trazabilidad
  Escenario: Consulta de analítica de donaciones como administrador
    Dado que he iniciado sesión con el rol "administrador"
    Y que me encuentro en el módulo de trazabilidad
    Entonces debería ver la línea de tiempo con los estados de la donación
    Y debería ver el estado actual de la donación

  @trazabilidad
  Escenario: El funnel de donaciones muestra las etapas del proceso
    Dado que he iniciado sesión con el rol "administrador"
    Y que me encuentro en el módulo de trazabilidad
    Entonces la línea de tiempo debería contener al menos 3 etapas
    Y debería ver el paso activo resaltado en la línea de tiempo

  @trazabilidad
  Escenario: Verificación del historial de datos de donaciones
    Dado que he iniciado sesión con el rol "director"
    Y que me encuentro en el módulo de trazabilidad
    Entonces debería ver el historial de cambios de estado
    Y el historial debería mostrar al menos una entrada

  @trazabilidad
  Escenario: Consulta de analítica con código de referencia
    Dado que he iniciado sesión con el rol "coordinador"
    Y que me encuentro en el módulo de trazabilidad
    Cuando ingreso el código de trazabilidad "DON-2024-001"
    Y hago clic en el botón "Buscar"
    Entonces debería ver la línea de tiempo con los estados de la donación

  @trazabilidad @negativo
  Escenario: Consulta con código de referencia inexistente
    Dado que he iniciado sesión con el rol "coordinador"
    Y que me encuentro en el módulo de trazabilidad
    Cuando ingreso el código de trazabilidad "DON-9999-XXX"
    Y hago clic en el botón "Buscar"
    Entonces debería ver un mensaje indicando que no se encontró la donación

  @trazabilidad @negativo
  Escenario: Búsqueda con campo de código vacío
    Dado que he iniciado sesión con el rol "coordinador"
    Y que me encuentro en el módulo de trazabilidad
    Cuando dejo el campo de código vacío
    Y hago clic en el botón "Buscar"
    Entonces debería ver una indicación de campo requerido

  @trazabilidad
  Escenario: Actualización de estado en el módulo de donaciones
    Dado que he iniciado sesión con el rol "coordinador"
    Y que consulté la donación con código "DON-2024-001"
    Y que el estado actual es "En acopio"
    Cuando selecciono el nuevo estado "En distribución"
    Y ingreso la observación "Donación cargada en camión ruta Norte"
    Y hago clic en el botón "Actualizar estado"
    Entonces debería ver un mensaje de actualización exitosa

  @smoke @trazabilidad
  Esquema del escenario: Verificación de analítica por rol
    Dado que he iniciado sesión con el rol "<rol>"
    Y que me encuentro en el módulo de trazabilidad
    Entonces debería ver el estado actual de la donación

    Ejemplos:
      | rol           |
      | administrador |
      | coordinador   |
      | director      |
