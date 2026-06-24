# Framework de Pruebas Automatizadas
## Plataforma web para la gestión y trazabilidad de donaciones
### Fundación Huellas del Catatumbo — TFM UNIR

**Tecnologías:** Playwright · Cucumber/Gherkin · TypeScript · Page Object Model  
**Entorno de pruebas:** https://huellasdelcatatumbo.com  
**Resultado actual:** ✅ 57 escenarios / 256 pasos — 0 fallos

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Test_aut_TFM

# 2. Instalar dependencias
npm install

# 3. Instalar el navegador Chromium de Playwright
npm run install:browsers

# 4. Configurar las credenciales
cp .env.example .env
# Editar .env con las credenciales reales de la plataforma
```

---

## Configuración (.env)

Copia `.env.example` a `.env` y rellena las credenciales reales.  
**El archivo `.env` nunca debe subirse al repositorio** (ya está en `.gitignore`).

| Variable | Descripción |
|---|---|
| `BASE_URL` | URL base de la plataforma |
| `BROWSER` | `chromium` / `firefox` / `webkit` |
| `HEADLESS` | `true` para CI, `false` para ver el navegador |
| `SLOWMO` | Milisegundos entre acciones (0 = máxima velocidad) |
| `TIMEOUT` | Timeout global por paso en ms (default: 30000) |
| `ADMIN_USER/PASS` | Credenciales del super_admin |
| `DIRECTOR_USER/PASS` | Credenciales del director |
| `COORDINADOR_USER/PASS` | Credenciales del coordinador |
| `VOLUNTARIO_USER/PASS` | Credenciales del voluntario |
| `USUARIO_USER/PASS` | Credenciales del usuario donante |

---

## Ejecución de pruebas

```bash
# Todos los escenarios (57 en total)
npm test

# Solo pruebas de humo — flujos críticos (23 escenarios, más rápido)
npm run test:smoke

# Por feature específica
npm run test:login          # Autenticación (13 escenarios)
npm run test:usuarios       # Gestión de usuarios (10 escenarios)
npm run test:donaciones     # Informe de donaciones (10 escenarios)
npm run test:trazabilidad   # Analítica / trazabilidad (10 escenarios)
npx cucumber-js src/features/portal_usuario.feature  # Portal donante (14 escenarios)

# Con navegador visible (útil para depuración)
npm run test:headed

# Con navegador visible y movimiento lento (500 ms entre acciones)
npm run test:debug
```

---

## Ver el reporte

```bash
# Abrir el reporte HTML interactivo en el navegador
npm run report:open

# Ejecutar los tests Y abrir el reporte automáticamente al finalizar
npm run test:y:reporte
```

El reporte se genera en `reports/html-report/index.html` y muestra:
- Estado de cada escenario (PASS / FAIL)
- Pasos ejecutados con tiempos
- Screenshots embebidos de cada escenario

Las evidencias (screenshots + vídeos) se guardan en:
```
test-results/evidencias/<fecha-hora>/
├── CU-01_Autenticacion/
│   ├── screenshots/   → PASS_*.png | FAIL_*.png
│   └── videos/        → PASS_*.webm | FAIL_*.webm
├── CU-02_Gestion_Usuarios/
├── CU-03_Portal_Donante/
├── CU-04_Donaciones/
└── CU-06_Trazabilidad/
```

---

## Estructura del proyecto

```
Test_aut_TFM/
├── src/
│   ├── features/                        # Escenarios Gherkin en español
│   │   ├── autenticacion.feature        # HU-01 / CU-01  (13 escenarios)
│   │   ├── gestion_usuarios.feature     # HU-02 / CU-02  (10 escenarios)
│   │   ├── portal_usuario.feature       # HU-03 / CU-03  (14 escenarios)
│   │   ├── donaciones.feature           # HU-04 / CU-04  (10 escenarios)
│   │   └── trazabilidad.feature         # HU-05 / CU-06  (10 escenarios)
│   │
│   ├── pages/                           # Page Object Model (POM)
│   │   ├── BasePage.ts                  # Clase base con operaciones comunes
│   │   ├── LoginPage.ts                 # /login y /login/admin
│   │   ├── DashboardPage.ts             # Panel de administración
│   │   ├── DonacionesPage.ts            # /admin-home/donations/reports
│   │   ├── TrazabilidadPage.ts          # /admin-home/donations/analytics
│   │   ├── GestionUsuariosPage.ts       # /admin-home/frontend/all-user
│   │   └── PortalUsuarioPage.ts         # /user-home (portal donante)
│   │
│   ├── step-definitions/                # Implementación de pasos Gherkin
│   │   ├── autenticacion.steps.ts
│   │   ├── common.steps.ts              # Steps reutilizados entre features
│   │   ├── donaciones.steps.ts
│   │   ├── trazabilidad.steps.ts
│   │   ├── gestion_usuarios.steps.ts
│   │   └── portal_usuario.steps.ts
│   │
│   ├── support/
│   │   ├── world.ts                     # CustomWorld: contexto Playwright por escenario
│   │   ├── hooks.ts                     # Before/After: captura de evidencias
│   │   ├── evidence-manager.ts          # Gestión de carpetas de evidencias
│   │   └── generate-report.ts           # Generador de reporte HTML
│   │
│   └── fixtures/
│       └── credenciales.ts              # Credenciales por rol (desde .env)
│
├── scripts/                             # Scripts de diagnóstico del DOM
│   ├── explore-user-portal.js
│   └── explore-user-detail.js
│
├── reports/
│   └── REPORTE_TRAZABILIDAD_REQUISITOS.md  # Matriz de trazabilidad HU/CU
│
├── .env.example                         # Plantilla de credenciales (copiar a .env)
├── cucumber.js                          # Configuración de Cucumber
├── tsconfig.json                        # Configuración de TypeScript
└── package.json
```

---

## Tags disponibles

| Tag | Escenarios | Propósito |
|---|---|---|
| `@smoke` | 23 | Suite mínima para CI/CD — flujos críticos |
| `@login` | 13 | Autenticación y control de acceso por rol |
| `@usuarios` | 10 | CRUD de usuarios (solo administrador) |
| `@portal_donante` | 14 | Portal privado del usuario donante |
| `@donaciones` | 10 | Informes financieros y exportación CSV |
| `@trazabilidad` | 10 | Analítica del ciclo de vida de donaciones |
| `@negativo` | 8 | Validaciones y manejo de errores |

```bash
# Ejecutar por tag
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@donaciones and not @negativo"
npx cucumber-js --tags "@login or @portal_donante"
```

---

## Trazabilidad de requisitos

| Feature | Historia de Usuario | Caso de Uso | Escenarios |
|---|---|---|---|
| autenticacion.feature | HU-01 | CU-01 | 13 |
| gestion_usuarios.feature | HU-02 | CU-02 | 10 |
| portal_usuario.feature | HU-03 | CU-03 | 14 |
| donaciones.feature | HU-04 | CU-04 | 10 |
| trazabilidad.feature | HU-05 | CU-06 | 10 |

Ver la matriz completa en [`reports/REPORTE_TRAZABILIDAD_REQUISITOS.md`](reports/REPORTE_TRAZABILIDAD_REQUISITOS.md).

---

## Roles de usuario

| Rol | Usuario | URL de login |
|---|---|---|
| Administrador | `super_admin` | `/login/admin` |
| Director | `director_fundorex` | `/login/admin` |
| Coordinador | `coordinador_ocana` | `/login/admin` |
| Voluntario | `voluntario_catatumbo` | `/login/admin` |
| Usuario donante | `antuan23` | `/login` |
