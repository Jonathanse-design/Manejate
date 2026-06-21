# Manéjate

PWA estática para finanzas personales: ingresos, gastos, productos bancarios, tarjetas, préstamos, ahorros, fondo de emergencia, alertas y análisis visual.

## Importante sobre datos

Manéjate funciona en GitHub Pages sin backend. Tus datos se guardan localmente en el navegador mediante IndexedDB.

Si limpias los datos de Safari/Chrome, cambias de dispositivo o reinstalas el navegador, puedes perder la información. Exporta un backup JSON semanalmente desde **Ajustes > Respaldo y seguridad de datos**.

## Funciones incluidas

- PWA instalable desde Safari en iPhone.
- Modo Demo y Modo Real separados.
- Modo privacidad para ocultar montos.
- Dashboard con balance mensual, KPIs, alertas, próximos pagos, tarjetas y ahorro.
- Registro de ingresos, gastos, productos bancarios, préstamos y consumos de tarjetas.
- Metas de ahorro y fondo de emergencia separado.
- Análisis con gráficos e insights automáticos.
- Exportación/importación JSON.
- Exportación CSV de movimientos, consumos de tarjetas y productos bancarios.
- Service worker para funcionamiento offline básico.
- GitHub Actions para deploy a GitHub Pages.

## Instalar dependencias

```bash
pnpm install
```

También puedes usar npm:

```bash
npm install
```

## Correr localmente

```bash
pnpm run dev
```

Con npm:

```bash
npm run dev
```

## Crear build

```bash
pnpm run build
```

Con npm:

```bash
npm run build
```

## Previsualizar build

```bash
pnpm run preview
```

## Despliegue en GitHub Pages

El proyecto está configurado para publicarse bajo:

```text
https://jonathanse-design.github.io/Manejate/
```

La configuración importante es:

- `vite.config.ts` usa `base: "/Manejate/"`.
- `public/manifest.webmanifest` usa `start_url` y `scope` con `/Manejate/`.
- `.github/workflows/deploy.yml` compila y publica `dist/`.

Para desplegar nuevamente:

1. Haz commit de los cambios.
2. Haz push a `main`.
3. GitHub Actions ejecutará **Deploy to GitHub Pages**.
4. Cuando el workflow esté verde, abre la URL publicada.

## Instalar en iPhone desde Safari

1. Abre el enlace publicado en Safari.
2. Toca el botón de compartir.
3. Elige **Agregar a pantalla de inicio**.
4. Confirma el nombre **Manéjate**.
5. Abre la app desde el icono instalado.

## Backup recomendado

- Exporta un backup JSON cada semana.
- Exporta un backup antes de importar datos.
- Exporta un backup antes de borrar datos reales.
- Guarda una copia fuera del teléfono si los datos son importantes.

## Marca

Los assets de marca viven en:

```text
public/assets/
public/icons/
brand-assets/
```

El logo principal se deriva del logo aprobado de Manéjate y cuenta con variantes para fondo oscuro, fondo claro, favicon e iconos PWA.
