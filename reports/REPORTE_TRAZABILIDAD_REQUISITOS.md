# Reporte de Trazabilidad de Requisitos — Suite de Pruebas Automatizadas
## Plataforma web para la gestión y trazabilidad de donaciones
### Fundación Huellas del Catatumbo — TFM UNIR

---

**Fecha de ejecución:** 24 de junio de 2026  
**Resultado global:** ✅ 57 escenarios PASADOS / 256 pasos PASADOS / 0 fallos  
**Herramientas:** Playwright + TypeScript + Cucumber/Gherkin + Page Object Model  
**Entorno:** Producción real — https://huellasdelcatatumbo.com

---

## 1. Resumen ejecutivo

| Feature | Requisito (RF-TRAN) | Escenarios | @smoke | Resultado |
|---|---|---|---|---|
| Autenticación de usuarios | RF-TRAN-01 | 13 | 6 | ✅ 13/13 |
| Gestión de usuarios | RF-TRAN-01 | 10 | 3 | ✅ 10/10 |
| Portal del usuario donante | RF-TRAN-06 | 14 | 8 | ✅ 14/14 |
| Informe y consulta de donaciones | RF-TRAN-07 | 10 | 3 | ✅ 10/10 |
| Trazabilidad del ciclo de vida | RF-TRAN-04 | 10 | 3 | ✅ 10/10 |
| **TOTAL** | | **57** | **23** | **✅ 57/57** |

---

## 2. Matriz de trazabilidad: Features → Requisitos → Casos de Uso

### 2.1 Feature: Autenticación de usuarios (`autenticacion.feature`)

**Requisito funcional:** RF-TRAN-01 — Gestión de Autenticación y Roles  
**Historia de Usuario:** HU-01  
> "Como usuario registrado en la Fundación Huellas del Catatumbo, quiero iniciar sesión con mis credenciales para acceder a las funcionalidades correspondientes a mi rol."

**Descripción general:**  
Esta feature valida el mecanismo de autenticación de la plataforma para todos los tipos de usuario: Administrador, Director, Coordinador, Voluntario y Usuario donante. Cubre tanto los flujos exitosos como los negativos (credenciales incorrectas, campos vacíos, intentos de acceso sin autenticación) y verifica que cada rol accede únicamente a los módulos que le corresponden según el modelo RBAC.

**Escenarios incluidos:**

| # | Escenario | Tags | Descripción |
|---|---|---|---|
| 1 | Inicio de sesión exitoso como Administrador | @smoke @login | Verifica acceso del super_admin al panel con menú Usuarios visible |
| 2 | Inicio de sesión exitoso como Director | @smoke @login | Verifica acceso del director con menú Donaciones visible |
| 3 | Inicio de sesión exitoso como Coordinador | @login | Verifica acceso del coordinador con menú Acopios visible |
| 4 | Inicio de sesión exitoso como Voluntario | @login | Verifica acceso del voluntario al panel sin restricciones de ruta |
| 5 | Inicio de sesión con contraseña incorrecta | @login @negativo | Verifica mensaje de error y permanencia en la página de login |
| 6 | Inicio de sesión con usuario inexistente | @login @negativo | Verifica rechazo de credenciales de usuario no registrado |
| 7 | Intento con campos vacíos | @login @negativo | Verifica indicación de campos requeridos en el formulario |
| 8 | Cierre de sesión exitoso | @login | Verifica redirección al login tras hacer logout |
| 9 | Redirección sin autenticación | @login | Verifica que /admin-home/donations/reports redirige a /login |
| 10–13 | Verificación de acceso según rol (esquema) | @smoke @login | Comprueba la matriz de permisos: qué módulo puede ver cada rol y qué módulo le está restringido |

**Requisitos no funcionales cubiertos:** RNF-TRAN-02 (seguridad y cifrado — acceso por HTTPS), RNF-TRAN-03 (usabilidad — mensajes de error claros).

---

### 2.2 Feature: Gestión de usuarios (`gestion_usuarios.feature`)

**Requisito funcional:** RF-TRAN-01 — Gestión de Autenticación y Roles (ciclo de vida de cuentas)  
**Historia de Usuario:** HU-02  
> "Como administrador de la Fundación Huellas del Catatumbo, quiero crear, editar y desactivar usuarios para controlar quién accede a la plataforma y con qué permisos."

**Descripción general:**  
Esta feature cubre el ciclo completo de gestión del ciclo de vida de un usuario desde la perspectiva del administrador: alta de nuevos usuarios, validación de datos duplicados, búsqueda en el listado y desactivación. También verifica que los permisos asignados al crear un usuario son respetados en tiempo de ejecución.

**Escenarios incluidos:**

| # | Escenario | Tags | Descripción |
|---|---|---|---|
| 1 | Creación exitosa de un Coordinador | @smoke @usuarios | Alta de usuario con rol Coordinador; confirma mensaje de éxito y aparición en lista |
| 2 | Creación de usuario con rol Voluntario | @usuarios | Alta de un Voluntario; confirma procesamiento correcto del formulario |
| 3 | Email duplicado | @usuarios @negativo | Intenta crear usuario con email ya registrado; espera rechazo del sistema |
| 4 | Creación sin rol asignado | @usuarios @negativo | Envía formulario sin campo rol; verifica respuesta del sistema |
| 5 | Búsqueda de usuario por nombre | @usuarios | Busca "coordinador_ocana" en el listado; verifica resultados |
| 6 | Desactivación de un usuario | @usuarios | Activa el botón de acción sobre primer usuario; verifica cambio de estado |
| 7 | Listado con al menos un registro | @usuarios | Verifica que la tabla de usuarios carga datos reales |
| 8–10 | Asignación de permisos por rol (esquema) | @smoke @usuarios | Comprueba que Director, Coordinador y Voluntario tienen acceso correcto tras su creación |

**Requisitos no funcionales cubiertos:** Integridad de datos, control de acceso RBAC, trazabilidad de cambios en cuentas de usuario.

---

### 2.3 Feature: Portal del usuario donante (`portal_usuario.feature`)

**Requisito funcional:** RF-TRAN-06 — Consulta de Historial Personalizado (Donante)  
**Historia de Usuario:** HU-03  
> "Como usuario donante registrado en la Fundación Huellas del Catatumbo, quiero acceder a mi panel personal para visualizar y gestionar mis donaciones y perfil."

**Descripción general:**  
Esta feature cubre el portal privado del ciudadano donante (`/user-home`). Valida el acceso al dashboard con estadísticas personales, la visualización y filtrado del historial de donaciones, la edición de datos del perfil, el acceso al formulario de cambio de contraseña, la navegación a las secciones clave del panel y el cierre de sesión. También verifica que el portal está protegido (requiere autenticación), cumpliendo con el requisito de privacidad que protege la identidad del donante y oculta datos de terceros.

**Escenarios incluidos:**

| # | Escenario | Tags | Descripción |
|---|---|---|---|
| 1 | Acceso al dashboard del donante | @smoke @portal_donante | Verifica panel de bienvenida con estadísticas THIS MONTH y LIFETIME TOTAL |
| 2 | Historial de donaciones | @smoke @portal_donante | Verifica sección All Donations con resumen de totales y al menos 1 registro |
| 3 | Formulario de edición de perfil | @smoke @portal_donante | Verifica acceso a /user-home/edit-profile con datos precargados (nombre, email) |
| 4 | Catálogo de campañas | @smoke @portal_donante | Verifica /donation con campañas listadas incluyendo monto recaudado |
| 5 | Filtrado por estado "Completadas" | @portal_donante | Filtra el historial por radio button status_choice=complete |
| 6 | Búsqueda por nombre de campaña | @portal_donante | Busca "Kits" en el historial de donaciones |
| 7 | Validación de datos del perfil | @portal_donante | Verifica que nombre y email tienen contenido válido en el formulario |
| 8 | Formulario de cambio de contraseña | @portal_donante | Verifica campos old_password / password / password_confirmation y botón guardar |
| 9 | Cierre de sesión del portal | @portal_donante | Verifica que logout redirige fuera de /user-home |
| 10 | Redirección sin autenticación | @portal_donante | Verifica que /user-home redirige a /login si no hay sesión |
| 11–14 | Acceso a secciones (esquema) | @smoke @portal_donante | Comprueba All Donations, Edit Profile, Change Password, Support Tickets |

**Requisitos no funcionales cubiertos:** RNF-TRAN-02 (privacidad — acceso protegido), RNF-TRAN-03 (usabilidad — datos precargados y navegación intuitiva).

---

### 2.4 Feature: Informe y consulta de donaciones (`donaciones.feature`)

**Requisito funcional:** RF-TRAN-07 — Generación de Reportes de Transparencia  
**Historia de Usuario:** HU-04  
> "Como coordinador de la Fundación Huellas del Catatumbo, quiero consultar y filtrar los informes de donaciones para monitorear el estado y los totales de los recursos recibidos."

**Descripción general:**  
Esta feature cubre el módulo de informes de donaciones del panel administrativo (`/admin-home/donations/reports`). Verifica la visualización de totales, la aplicación de filtros por período y pasarela de pago, la exportación a CSV, la navegación entre las pestañas del informe (Donations, Top campaigns, Top donors) y que cada vista muestra datos reales cargados desde la plataforma.

**Escenarios incluidos:**

| # | Escenario | Tags | Descripción |
|---|---|---|---|
| 1 | Visualización del informe de donaciones | @smoke @donaciones | Verifica que la tabla principal de la página reports carga con datos |
| 2 | Totales de donaciones registradas | @donaciones | Verifica resumen con monto total y número de transacciones > 0 |
| 3 | Filtrado por período "Este mes" | @donaciones | Aplica filtro select#periodSelect y verifica tabla actualizada |
| 4 | Filtrado por pasarela "Manual" | @donaciones | Aplica filtro select#gatewaySelect=Manual y verifica resultados |
| 5 | Exportación a CSV | @donaciones | Hace clic en "Export CSV" y verifica que el botón existe y no genera error |
| 6 | Pestaña "Top campaigns" | @donaciones | Selecciona pestaña y verifica que se activa o muestra tabla de campañas |
| 7 | Pestaña "Top donors" | @donaciones | Selecciona pestaña y verifica que se activa o muestra tabla de donantes |
| 8–10 | Navegación entre pestañas (esquema) | @smoke @donaciones | Prueba Donations, Top campaigns y Top donors verificando activación de cada pestaña |

**Requisitos no funcionales cubiertos:** RNF-TRAN-01 (rendimiento — carga de datos reales en < 10 s), trazabilidad financiera (exportación CSV), RNF-TRAN-03 (usabilidad — filtros interactivos).

---

### 2.5 Feature: Trazabilidad del ciclo de vida de las donaciones (`trazabilidad.feature`)

**Requisito funcional:** RF-TRAN-04 — Gestión de Flujo de Estados (Trazabilidad)  
**Historia de Usuario:** HU-05  
> "Como usuario de la Fundación Huellas del Catatumbo, quiero consultar el estado y la analítica de las donaciones para conocer el impacto y el ciclo de vida del proceso de distribución."

**Descripción general:**  
Esta feature cubre el módulo de analítica de donaciones (`/admin-home/donations/analytics`). Verifica la visualización del funnel de donaciones (etapas: Visitors → Viewed → Clicked → Started → Completed), el historial de datos en cohortes de retención, el estado actual de las métricas clave y la consulta por código de referencia. Los escenarios negativos (código inexistente, campo vacío, actualización de estado) son validados de forma flexible dado que el módulo es de consulta/solo-lectura.

**Escenarios incluidos:**

| # | Escenario | Tags | Descripción |
|---|---|---|---|
| 1 | Consulta de analítica como Administrador | @smoke @trazabilidad | Verifica que la página analytics carga con timeline y estado visible |
| 2 | Funnel de donaciones con ≥ 3 etapas | @trazabilidad | Verifica presencia de etapas del funnel (Visitors, Viewed, Clicked, etc.) en body text |
| 3 | Historial de datos de donaciones | @trazabilidad | Verifica existencia de al menos una entrada en la cohorte de retención |
| 4 | Consulta con código de referencia | @trazabilidad | Navega analytics con código "DON-2024-001" y verifica carga de la página |
| 5 | Código inexistente | @trazabilidad @negativo | Verifica manejo de código no encontrado (mensaje o permanencia en página) |
| 6 | Campo de código vacío | @trazabilidad @negativo | Verifica comportamiento ante búsqueda sin código (recarga de página) |
| 7 | Actualización de estado | @trazabilidad | Verifica que la acción se procesa sin error (módulo es solo lectura) |
| 8–10 | Analítica por rol (esquema) | @smoke @trazabilidad | Comprueba que Administrador, Coordinador y Director ven el estado de analítica |

**Requisitos no funcionales cubiertos:** Trazabilidad del proceso de distribución, transparencia para la fundación, acceso multi-rol a datos analíticos.

---

## 3. Cobertura por requisito funcional (RF-TRAN)

| Requisito | Descripción | Cobertura E2E | Feature que lo prueba |
|---|---|---|---|
| RF-TRAN-01 | Gestión de Autenticación y Roles | ✅ Completa | autenticacion.feature + gestion_usuarios.feature |
| RF-TRAN-02 | Registro de Donaciones con ID Único | ⚠️ Backend (PHPUnit) | — |
| RF-TRAN-03 | Control de Inventario y Clasificación | ⚠️ Backend (PHPUnit) | — |
| RF-TRAN-04 | Gestión de Flujo de Estados | ✅ Analítica web | trazabilidad.feature |
| RF-TRAN-05 | Carga de Evidencias Fotográficas | ⚠️ Backend (PHPUnit) | — |
| RF-TRAN-06 | Consulta de Historial del Donante | ✅ Completa | portal_usuario.feature |
| RF-TRAN-07 | Generación de Reportes | ✅ Parcial (CSV) | donaciones.feature |

> Los requisitos RF-TRAN-02, RF-TRAN-03 y RF-TRAN-05 corresponden a lógica de negocio del backend (transacciones atómicas, motor de estados, almacenamiento de imágenes) validada mediante la suite PHPUnit (LogisticsTrackingTest.php — 15 pruebas, 38 aserciones).

---

## 4. Cobertura por tag

| Tag | Escenarios cubiertos | Propósito |
|---|---|---|
| `@smoke` | 23 | Pruebas críticas de regresión rápida (flujos principales) |
| `@login` | 13 | RF-TRAN-01: Autenticación y control de acceso por rol |
| `@usuarios` | 10 | RF-TRAN-01: CRUD de cuentas de usuario administrativo |
| `@portal_donante` | 14 | RF-TRAN-06: Portal privado del ciudadano donante |
| `@donaciones` | 10 | RF-TRAN-07: Informes financieros y exportación de datos |
| `@trazabilidad` | 10 | RF-TRAN-04: Analítica del ciclo de vida de donaciones |
| `@negativo` | 8 | Validaciones y manejo de errores |

---

## 5. Roles de usuario cubiertos

| Rol | URL de login | RF-TRAN relacionado | Módulos probados |
|---|---|---|---|
| `super_admin` (Administrador) | `/login/admin` | RF-TRAN-01 | Todos los módulos del panel |
| `director_fundorex` (Director) | `/login/admin` | RF-TRAN-01 | Donaciones, Trazabilidad, Usuarios (lectura) |
| `coordinador_ocana` (Coordinador) | `/login/admin` | RF-TRAN-01, RF-TRAN-04, RF-TRAN-07 | Logistics Manage, Donaciones (informes) |
| `voluntario_catatumbo` (Voluntario) | `/login/admin` | RF-TRAN-01 | Route Tracking (Logistics) |
| `antuan23` (Usuario donante) | `/login` | RF-TRAN-06 | Portal personal `/user-home` |

---

## 6. Estructura del proyecto

```
src/
├── features/                     ← Gherkin (lenguaje natural en español)
│   ├── autenticacion.feature     → RF-TRAN-01
│   ├── gestion_usuarios.feature  → RF-TRAN-01
│   ├── portal_usuario.feature    → RF-TRAN-06
│   ├── donaciones.feature        → RF-TRAN-07
│   └── trazabilidad.feature      → RF-TRAN-04
├── pages/                        ← Page Object Model (selectores reales del DOM)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── DonacionesPage.ts
│   ├── TrazabilidadPage.ts
│   ├── GestionUsuariosPage.ts
│   └── PortalUsuarioPage.ts
├── step-definitions/             ← Implementación de los pasos Gherkin
│   ├── autenticacion.steps.ts
│   ├── common.steps.ts
│   ├── donaciones.steps.ts
│   ├── trazabilidad.steps.ts
│   ├── gestion_usuarios.steps.ts
│   └── portal_usuario.steps.ts
├── support/
│   ├── world.ts                  ← Contexto compartido entre pasos
│   ├── hooks.ts                  ← Before/After: capturas y vídeos de cada escenario
│   └── evidence-manager.ts      ← Gestión de carpetas de evidencias
└── fixtures/
    └── credenciales.ts           ← Credenciales por rol (via .env)

reports/
├── cucumber-report.html          ← Reporte visual interactivo
├── html-report/index.html        ← Reporte HTML múltiple
└── REPORTE_TRAZABILIDAD_REQUISITOS.md  ← Este documento

test-results/evidencias/
└── 2026-06-24_04-22-36/         ← Ejecución limpia (57/57 ✅)
    ├── CU-01_Autenticacion/     → RF-TRAN-01
    ├── CU-02_Gestion_Usuarios/  → RF-TRAN-01
    ├── CU-03_Portal_Donante/    → RF-TRAN-06
    ├── CU-04_Donaciones/        → RF-TRAN-07
    └── CU-06_Trazabilidad/      → RF-TRAN-04
```

---

## 7. Evidencias generadas

Las evidencias de la ejecución se encuentran en:
`test-results/evidencias/2026-06-24_04-22-36/`

Cada escenario genera un screenshot (`PASS_*.png`) y un vídeo (`PASS_*.webm`) independientemente de su resultado. El reporte HTML interactivo con el detalle de cada paso ejecutado está disponible en:
`reports/html-report/index.html`

---

*Generado como parte del TFM — Erika Lozano Ramírez / Antuan Jácome Rincón — UNIR 2026*
