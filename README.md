# Control Animal Selwo — Gestión Zoológica

Aplicación web responsive para la gestión de animales en un parque zoológico o marino. Diseñada para ser intuitiva, rápida y funcional para cuidadores, entrenadores y veterinarios.

## Características

- **Gestión por Departamentos**: Visualización organizada por áreas (Aves, Pingüinario, Amazonia, Leones Marinos).
- **Ficha Completa de Animales**:
  - Información general (nombre, especie, chip, fecha de nacimiento, sexo, etc.).
  - Historial de peso con gráficos y evolución temporal.
  - Gestión de dietas y alimentación.
  - Registro de entrenamientos y objetivos.
  - Historial médico y veterinaria.
- **Operaciones CRUD**: Creación, actualización y eliminación segura de animales y sus registros asociados.
- **Persistencia Local**: Los datos se guardan de manera persistente en el navegador usando `localStorage`.
- **Diseño Moderno y Corporativo**: Estética cuidada, limpia y optimizada para dispositivos móviles y de escritorio.

## Estructura de Archivos

- `index.html` - Página principal y contenedor de la aplicación SPA (Single Page Application).
- `assets/` - Recursos estáticos (logotipos e imágenes).
- `css/styles.css` - Estilos CSS personalizados para la interfaz de usuario.
- `js/` - Módulos JavaScript:
  - `app.js` - Inicialización y arranque de la aplicación.
  - `database.js` - Control de acceso a datos y almacenamiento persistente.
  - `helpers.js` - Utilidades y funciones auxiliares.
  - `router.js` - Sistema de enrutamiento basado en hash para SPA.
  - `seed.js` - Semilla de datos de prueba precargados.
  - `ui.js` - Controladores de interacción global.
  - `views.js` - Plantillas de vistas HTML dinámicas para cada sección.

## Ejecución Local

Para probar la aplicación en tu entorno local:

1. Clona el repositorio.
2. Abre el archivo `index.html` directamente en tu navegador, o utiliza un servidor web estático local:
   ```bash
   # Utilizando http-server de npm
   npx http-server -p 8080
   ```
3. Visita `http://localhost:8080` en tu navegador.
