# language: es
# ==============================================================================
# Feature: Gestión de usuarios
# Historia de Usuario (HU-02): Como administrador, quiero gestionar los usuarios
# del sistema para controlar el acceso según los roles definidos.
# Casos de Uso relacionados: CU-02, CU-03
# ==============================================================================

Característica: Gestión de usuarios de la plataforma

  Como administrador de la Fundación Huellas del Catatumbo
  Quiero crear, editar y desactivar usuarios
  Para controlar quién accede a la plataforma y con qué permisos

  Antecedentes:
    Dado que he iniciado sesión con el rol "administrador"
    Y que me encuentro en el módulo de gestión de usuarios

  @smoke @usuarios
  Escenario: Creación exitosa de un nuevo Coordinador
    Cuando hago clic en el botón "Nuevo Usuario"
    Y completo el formulario con los siguientes datos:
      | campo         | valor                     |
      | nombre        | Carolina                  |
      | apellido      | Suárez                    |
      | email         | carolina.suarez@test.com  |
      | usuario       | coordinador_test_01       |
      | rol           | Coordinador               |
      | contraseña    | Test1234!                 |
    Y hago clic en el botón "Guardar"
    Entonces debería ver un mensaje de creación exitosa
    Y el nuevo usuario debería aparecer en la lista de usuarios

  @usuarios
  Escenario: Creación de un usuario con rol Voluntario
    Cuando hago clic en el botón "Nuevo Usuario"
    Y completo el formulario con los siguientes datos:
      | campo         | valor                     |
      | nombre        | Andrés                    |
      | apellido      | Pérez                     |
      | email         | andres.perez@test.com     |
      | usuario       | voluntario_test_01        |
      | rol           | Voluntario                |
      | contraseña    | Test1234!                 |
    Y hago clic en el botón "Guardar"
    Entonces debería ver un mensaje de creación exitosa

  @usuarios @negativo
  Escenario: Intento de creación de usuario con email duplicado
    Cuando hago clic en el botón "Nuevo Usuario"
    Y completo el formulario con los siguientes datos:
      | campo         | valor                     |
      | nombre        | Pedro                     |
      | apellido      | Gómez                     |
      | email         | tavomestra22@gmail.com    |
      | usuario       | pedro_test_dup            |
      | rol           | Voluntario                |
      | contraseña    | Test1234!                 |
    Y hago clic en el botón "Guardar"
    Entonces debería ver un mensaje de error indicando email duplicado

  @usuarios @negativo
  Escenario: Intento de creación sin asignar rol
    Cuando hago clic en el botón "Nuevo Usuario"
    Y completo el formulario con los siguientes datos:
      | campo         | valor                     |
      | nombre        | Sin                       |
      | apellido      | Rol                       |
      | email         | sinrol@test.com           |
      | usuario       | sinrol_user               |
      | contraseña    | Test1234!                 |
    Y hago clic en el botón "Guardar"
    Entonces debería ver un mensaje de validación indicando que el rol es requerido

  @usuarios
  Escenario: Búsqueda de usuario por nombre
    Dado que existe el usuario "coordinador_ocana" en el sistema
    Cuando busco por el término "coordinador_ocana"
    Entonces debería ver al usuario "coordinador_ocana" en los resultados

  @usuarios
  Escenario: Desactivación de un usuario
    Dado que existe el usuario "coordinador_test_01" en el sistema
    Cuando hago clic en el botón "Desactivar" del usuario "coordinador_test_01"
    Y confirmo la acción en el diálogo de confirmación
    Entonces debería ver un mensaje de desactivación exitosa
    Y el usuario debería aparecer como inactivo en la lista

  @usuarios
  Escenario: Listado de usuarios muestra todos los registros
    Entonces debería ver la tabla de usuarios con al menos un registro

  @smoke @usuarios
  Esquema del escenario: Asignación correcta de permisos por rol
    Dado que existe el usuario "<usuario>" con rol "<rol>" en el sistema
    Cuando inicio sesión con las credenciales de "<usuario>"
    Entonces debería ver el módulo "<modulo_habilitado>"
    Y no debería poder acceder al módulo "<modulo_restringido>"

    Ejemplos:
      | usuario              | rol           | modulo_habilitado | modulo_restringido |
      | director_fundorex    | Director      | Donaciones        | Gestión Usuarios   |
      | coordinador_ocana    | Coordinador   | Acopios           | Gestión Usuarios   |
      | voluntario_catatumbo | Voluntario    | Donaciones        | Reportes           |
