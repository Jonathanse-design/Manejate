# Finanzas Control Pro

PWA estática para controlar finanzas personales: ingresos, gastos, tarjetas, préstamos, ahorros, fondo de emergencia, alertas, análisis visual y respaldos manuales.

## Importante sobre datos

Esta app está pensada para GitHub Pages y no usa backend ni base de datos en la nube. Los datos se guardan localmente en el navegador mediante IndexedDB.

Si limpias los datos de Safari/Chrome, cambias de dispositivo o reinstalas el navegador, puedes perder la información. Exporta un backup JSON semanalmente desde **Ajustes > Respaldo y seguridad de datos**.

## Funciones incluidas

- PWA instalable desde Safari en iPhone.
- Modo Demo y Modo Real separados.
- Modo privacidad para ocultar montos reales.
- Dashboard con KPIs, alertas y próximos pagos.
- CRUD de ingresos y gastos.
- Registro de productos bancarios, tarjetas, préstamos y consumos de tarjetas.
- Metas de ahorro y fondo de emergencia separado.
- Análisis con gráficos e insights automáticos.
- Exportación/importación JSON.
- Exportación CSV de movimientos, consumos de tarjetas y productos bancarios.
- Service worker para funcionamiento offline básico.
- GitHub Actions para deploy a GitHub Pages.

## Instalar dependencias

```bash
npm install
```

También puedes usar pnpm:

```bash
pnpm install
```

## Correr localmente

```bash
npm run dev
```

Con pnpm:

```bash
pnpm run dev
```

## Crear build

```bash
npm run build
```

Con pnpm:

```bash
pnpm run build
```

## Previsualizar build

```bash
npm run preview
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Crear PWA Finanzas Control Pro"
git branch -M main
git remote add origin https://github.com/usuario/nombre-del-repositorio.git
git push -u origin main
```

## Activar GitHub Pages

1. Abre el repositorio en GitHub.
2. Ve a **Settings > Pages**.
3. En **Build and deployment**, elige **GitHub Actions**.
4. Haz push a `main`.
5. Espera que termine el workflow `Deploy to GitHub Pages`.

La app está configurada con `base: './'`, así que funciona en rutas tipo:

```text
https://usuario.github.io/nombre-del-repositorio/
```

## Instalar en iPhone desde Safari

1. Abre el enlace publicado en Safari.
2. Toca el botón de compartir.
3. Elige **Agregar a pantalla de inicio**.
4. Confirma el nombre **Finanzas Pro**.
5. Abre la app desde el icono instalado.

## Backup recomendado

- Exporta un backup JSON cada semana.
- Exporta un backup antes de importar datos.
- Exporta un backup antes de borrar datos reales.
- Guarda una copia fuera del teléfono si los datos son importantes.

## Estructura

```text
src/
  components/
  data/
  db/
  pages/
  store/
  styles/
  types/
  utils/
public/
  icons/
  manifest.webmanifest
  sw.js
```

## Personalización

Los iconos PWA fueron tomados del paquete `brand-assets` generado desde el logo aprobado de Manéjate. Puedes reemplazarlos en `public/icons/` manteniendo los mismos nombres.
