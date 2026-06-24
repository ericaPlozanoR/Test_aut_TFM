# language: es
# ==============================================================================
# Feature: Informe y gestión de donaciones
# Historia de Usuario (HU-04): Como coordinador, quiero consultar los informes
# de donaciones para monitorear el estado y los recursos recibidos.
# Casos de Uso relacionados: CU-04, CU-05
#
# Nota de implementación: El sistema gestiona las donaciones recibidas a través
# del portal público; el panel de administración provee informes y analítica
# en /admin-home/donations/reports con tablas de transacciones y pasarelas.
# ==============================================================================

Característica: Informe y consulta de donaciones en la plataforma

  Como coordinador de la Fundación Huellas del Catatumbo
  Quiero consultar y filtrar los informes de donaciones
  Para monitorear el estado y los totales de los recursos recibidos

  Antecedentes:
    Dado que he iniciado sesión con el rol "coordinador"
    Y que me encuentro en el módulo de donaciones

  @smoke @donaciones
  Escenario: Visualización exitosa del informe de donaciones
    Entonces debería ver la tabla de donaciones con al menos un registro

  @donaciones
  Escenario: El informe muestra los totales de donaciones registradas
    Entonces debería ver el resumen de totales de donaciones
    Y el número de transacciones registradas debería ser mayor a cero

  @donaciones
  Escenario: Filtrado del informe por período de tiempo
    Cuando filtro las donaciones por el período "Este mes"
    Entonces debería ver la tabla de donaciones actualizada

  @donaciones
  Escenario: Filtrado del informe por pasarela de pago Manual
    Cuando filtro las donaciones por la pasarela "Manual"
    Entonces debería ver la tabla de donaciones con los resultados filtrados

  @donaciones
  Escenario: Exportación del informe de donaciones a formato CSV
    Cuando exporto el informe de donaciones en formato CSV
    Entonces la exportación debería completarse correctamente

  @donaciones
  Escenario: Visualización de las campañas con mayor recaudo
    Cuando selecciono la pestaña "Top campaigns"
    Entonces debería ver la tabla de campañas destacadas

  @donaciones
  Escenario: Visualización de los principales donantes
    Cuando selecciono la pestaña "Top donors"
    Entonces debería ver la tabla de donantes principales

  @smoke @donaciones
  Esquema del escenario: Navegación entre pestañas del informe de donaciones
    Cuando selecciono la pestaña "<pestaña>"
    Entonces debería ver la sección de datos "<pestaña>"

    Ejemplos:
      | pestaña        |
      | Donations      |
      | Top campaigns  |
      | Top donors     |
