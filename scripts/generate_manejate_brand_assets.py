from __future__ import annotations

import base64
import json
import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "logo manejate.png"
OUT = ROOT / "brand-assets"

NAVY = (3, 18, 51, 255)
WHITE = (255, 255, 255, 255)
GRAY_BG = (248, 249, 251, 255)

LOGO_SIZES = [512, 1024, 2048]
ISOTYPE_SIZES = [64, 128, 256, 512, 1024]
APP_ICON_SIZES = [16, 32, 48, 64, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024]

VARIANTS = [
    "full-color",
    "light-bg",
    "dark-bg",
    "mono-dark",
    "mono-light",
    "grayscale",
]


def crop_foreground(img: Image.Image, box: tuple[int, int, int, int], pad: int = 10) -> Image.Image:
    crop = img.crop(box).convert("RGBA")
    px = crop.load()
    for y in range(crop.height):
        for x in range(crop.width):
            r, g, b, a = px[x, y]
            whiteness = min(r, g, b)
            color_spread = max(r, g, b) - min(r, g, b)
            # Preserve colored logo pixels and dark wordmark/shadow pixels; remove the white board.
            if whiteness > 238 and color_spread < 24:
                px[x, y] = (255, 255, 255, 0)
            else:
                strength = max(255 - whiteness, color_spread)
                alpha = max(0, min(255, int(strength * 2.2)))
                px[x, y] = (r, g, b, alpha)

    alpha = crop.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return crop
    l, t, r, b = bbox
    l, t = max(0, l - pad), max(0, t - pad)
    r, b = min(crop.width, r + pad), min(crop.height, b + pad)
    return crop.crop((l, t, r, b))


def tint(img: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    alpha = img.getchannel("A")
    solid = Image.new("RGBA", img.size, color)
    solid.putalpha(alpha)
    return solid


def grayscale(img: Image.Image) -> Image.Image:
    alpha = img.getchannel("A")
    gray = ImageOps.grayscale(img.convert("RGB")).convert("RGBA")
    gray.putalpha(alpha)
    return gray


def variant_image(img: Image.Image, variant: str, is_wordmark: bool = False) -> Image.Image:
    if variant in {"full-color", "light-bg"}:
        return img.copy()
    if variant == "dark-bg":
        return tint(img, WHITE) if is_wordmark else img.copy()
    if variant == "mono-dark":
        return tint(img, NAVY)
    if variant == "mono-light":
        return tint(img, WHITE)
    if variant == "grayscale":
        return grayscale(img)
    raise ValueError(variant)


def fit_resize(img: Image.Image, target_w: int | None = None, target_h: int | None = None) -> Image.Image:
    if target_w is None and target_h is None:
        return img.copy()
    ratio = img.width / img.height
    if target_w is None:
        target_w = round(target_h * ratio)
    if target_h is None:
        target_h = round(target_w / ratio)
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def paste_center(base: Image.Image, layer: Image.Image, x: int, y: int) -> None:
    base.alpha_composite(layer, (x, y))


def compose_horizontal(icon: Image.Image, wordmark: Image.Image) -> Image.Image:
    icon_h = 340
    icon_r = fit_resize(icon, target_h=icon_h)
    word_r = fit_resize(wordmark, target_h=128)
    gap = 88
    w = icon_r.width + gap + word_r.width
    h = max(icon_r.height, word_r.height) + 36
    out = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    paste_center(out, icon_r, 0, (h - icon_r.height) // 2)
    paste_center(out, word_r, icon_r.width + gap, (h - word_r.height) // 2 - 3)
    return out


def compose_stacked(icon: Image.Image, wordmark: Image.Image) -> Image.Image:
    icon_r = fit_resize(icon, target_h=230)
    word_r = fit_resize(wordmark, target_w=390)
    gap = 42
    w = max(icon_r.width, word_r.width) + 44
    h = icon_r.height + gap + word_r.height + 36
    out = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    paste_center(out, icon_r, (w - icon_r.width) // 2, 0)
    paste_center(out, word_r, (w - word_r.width) // 2, icon_r.height + gap)
    return out


def compose_wordmark(wordmark: Image.Image) -> Image.Image:
    return fit_resize(wordmark, target_h=180)


def compose_isotype(icon: Image.Image) -> Image.Image:
    return icon.copy()


def rounded_rect_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def compose_app_icon(icon: Image.Image, size: int = 1024, maskable: bool = False) -> Image.Image:
    bg = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    radius = round(size * 0.22)
    margin = round(size * 0.06)
    draw.rounded_rectangle((margin, margin, size - margin, size - margin), radius=radius, fill=(0, 0, 0, 44))
    shadow = shadow.filter(ImageFilter.GaussianBlur(round(size * 0.018)))
    bg.alpha_composite(shadow)

    tile = Image.new("RGBA", (size, size), GRAY_BG)
    tile.putalpha(rounded_rect_mask(size, radius))
    bg.alpha_composite(tile)

    icon_h = round(size * (0.52 if maskable else 0.66))
    icon_r = fit_resize(icon, target_h=icon_h)
    bg.alpha_composite(icon_r, ((size - icon_r.width) // 2, (size - icon_r.height) // 2 - round(size * 0.01)))
    return bg


def contain_square(img: Image.Image, size: int, padding_ratio: float = 0.12) -> Image.Image:
    canvas_img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    max_side = round(size * (1 - padding_ratio * 2))
    ratio = img.width / img.height
    if ratio >= 1:
        layer = fit_resize(img, target_w=max_side)
    else:
        layer = fit_resize(img, target_h=max_side)
    canvas_img.alpha_composite(layer, ((size - layer.width) // 2, (size - layer.height) // 2))
    return canvas_img


def resize_for_size(asset_type: str, img: Image.Image, size: int) -> Image.Image:
    if asset_type in {"isotype", "app-icon"}:
        return contain_square(img, size, 0.08 if asset_type == "isotype" else 0)
    return fit_resize(img, target_w=size)


def save_svg(path: Path, img: Image.Image, title: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    from io import BytesIO

    buf = BytesIO()
    img.save(buf, "PNG")
    payload = base64.b64encode(buf.getvalue()).decode("ascii")
    path.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{img.width}" height="{img.height}" viewBox="0 0 {img.width} {img.height}" role="img" aria-label="{title}">'
        f'<image href="data:image/png;base64,{payload}" width="{img.width}" height="{img.height}" preserveAspectRatio="xMidYMid meet"/></svg>\n',
        encoding="utf-8",
    )


def save_pdf(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    from io import BytesIO

    buf = BytesIO()
    img.save(buf, "PNG")
    buf.seek(0)
    c = canvas.Canvas(str(path), pagesize=(img.width, img.height))
    c.drawImage(ImageReader(buf), 0, 0, width=img.width, height=img.height, mask="auto")
    c.showPage()
    c.save()


def save_png(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def write_docs(manifest: list[dict]) -> None:
    (OUT / "README.md").write_text(
        """# Manéjate Brand Assets

Paquete de logos generado desde el logo aprobado `logo manejate.png`.

## Contenido

- `png/`: archivos PNG transparentes por asset, variante y tamaño.
- `svg/`: SVG listos para uso digital. Mantienen el arte aprobado incrustado para preservar fidelidad al PNG fuente.
- `pdf/`: PDFs con el arte colocado en página transparente cuando aplica.
- `favicon/`: favicon web en PNG e ICO.
- `ios/`: Apple touch icon.
- `android-pwa/`: iconos Android/PWA, incluyendo variante maskable.
- `manifest-icons.json`: lista de iconos para `manifest.webmanifest`.
- `brand-guidelines.md`: guía rápida de uso.

## Assets principales

- Logo horizontal
- Logo apilado
- Isotipo
- Wordmark
- App icon

## Nota de producción

El archivo fuente aprobado es raster (`PNG`), no vector nativo. Por fidelidad, los SVG/PDF incluidos encapsulan el arte aprobado sin redibujar ni reinterpretar el símbolo.
""",
        encoding="utf-8",
    )

    (OUT / "brand-guidelines.md").write_text(
        """# Manéjate Brand Guidelines

## Principio principal

El símbolo aprobado no debe rediseñarse, reinterpretarse, distorsionarse ni cambiar sus proporciones. Todos los assets de este paquete derivan del arte aprobado.

## Variantes

- `full-color`: versión principal con símbolo en gradiente y wordmark oscuro.
- `light-bg`: uso sobre fondos claros.
- `dark-bg`: uso sobre fondos oscuros; el wordmark se presenta en claro.
- `mono-dark`: uso monocromático oscuro.
- `mono-light`: uso monocromático claro.
- `grayscale`: uso en contextos sin color.

## Uso recomendado

- Usar `logo-horizontal` como firma principal.
- Usar `logo-stacked` cuando el espacio sea vertical o centrado.
- Usar `isotype` para avatares, favicons, marcas pequeñas y elementos de UI.
- Usar `wordmark` únicamente cuando el símbolo ya esté presente cerca o el contexto sea claramente de Manéjate.
- Usar `app-icon` para tiendas, launcher, PWA y accesos directos.

## Espacio mínimo

Mantener un margen libre alrededor del logo equivalente al 20% de la altura del isotipo. No colocar texto, bordes ni otros elementos dentro de esa zona.

## No hacer

- No estirar ni comprimir.
- No rotar.
- No cambiar el gradiente del símbolo.
- No aplicar sombras, contornos o efectos nuevos.
- No reconstruir el ícono con otra forma.
- No usar el app icon sin esquinas redondeadas cuando el sistema no las aplique automáticamente.
""",
        encoding="utf-8",
    )

    icons = [
        item
        for item in manifest
        if item["asset"] == "app-icon" and item["variant"] == "full-color" and item["format"] == "png"
    ]
    webmanifest = [
        {
            "src": item["path"],
            "sizes": f'{item["size"]}x{item["size"]}',
            "type": "image/png",
            "purpose": "any",
        }
        for item in icons
        if item["size"] in [192, 256, 384, 512, 1024]
    ]
    webmanifest += [
        {
            "src": "android-pwa/maskable-icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable",
        }
    ]
    (OUT / "manifest-icons.json").write_text(json.dumps(webmanifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    src = Image.open(SOURCE).convert("RGBA")
    icon = crop_foreground(src, (265, 90, 515, 480), pad=8)
    wordmark = crop_foreground(src, (555, 180, 1215, 335), pad=6)

    manifest: list[dict] = []
    masters = {}
    for variant in VARIANTS:
        icon_v = variant_image(icon, variant, is_wordmark=False)
        word_v = variant_image(wordmark, variant, is_wordmark=True)
        masters[("logo-horizontal", variant)] = compose_horizontal(icon_v, word_v)
        masters[("logo-stacked", variant)] = compose_stacked(icon_v, word_v)
        masters[("isotype", variant)] = compose_isotype(icon_v)
        masters[("wordmark", variant)] = compose_wordmark(word_v)
        masters[("app-icon", variant)] = compose_app_icon(icon_v, 1024, maskable=False)

    size_map = {
        "logo-horizontal": LOGO_SIZES,
        "logo-stacked": LOGO_SIZES,
        "wordmark": LOGO_SIZES,
        "isotype": ISOTYPE_SIZES,
        "app-icon": APP_ICON_SIZES,
    }

    for asset_type in ["logo-horizontal", "logo-stacked", "isotype", "wordmark", "app-icon"]:
        for variant in VARIANTS:
            master = masters[(asset_type, variant)]
            for size in size_map[asset_type]:
                png = resize_for_size(asset_type, master, size)
                stem = f"manejate-{asset_type}-{variant}-{size}px"
                png_path = OUT / "png" / asset_type / variant / f"{stem}.png"
                save_png(png_path, png)
                manifest.append({"asset": asset_type, "variant": variant, "format": "png", "size": size, "path": str(png_path.relative_to(OUT))})

            svg_master = resize_for_size(asset_type, master, 1024 if asset_type in {"isotype", "app-icon"} else 2048)
            svg_path = OUT / "svg" / asset_type / variant / f"manejate-{asset_type}-{variant}.svg"
            save_svg(svg_path, svg_master, f"Manéjate {asset_type} {variant}")
            manifest.append({"asset": asset_type, "variant": variant, "format": "svg", "size": None, "path": str(svg_path.relative_to(OUT))})

            if asset_type != "app-icon":
                pdf_path = OUT / "pdf" / asset_type / variant / f"manejate-{asset_type}-{variant}.pdf"
                save_pdf(pdf_path, svg_master)
                manifest.append({"asset": asset_type, "variant": variant, "format": "pdf", "size": None, "path": str(pdf_path.relative_to(OUT))})

    favicon_sizes = [16, 32, 48]
    fav_layers = []
    for size in favicon_sizes:
        fav = resize_for_size("isotype", masters[("isotype", "full-color")], size)
        fav_path = OUT / "favicon" / f"favicon-{size}.png"
        save_png(fav_path, fav)
        fav_layers.append(fav.convert("RGBA"))
    fav_layers[0].save(OUT / "favicon" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    apple = resize_for_size("app-icon", masters[("app-icon", "full-color")], 180)
    save_png(OUT / "ios" / "apple-touch-icon-180.png", apple)

    for size in [192, 256, 384, 512]:
        pwa = resize_for_size("app-icon", masters[("app-icon", "full-color")], size)
        save_png(OUT / "android-pwa" / f"icon-{size}.png", pwa)
    maskable = compose_app_icon(variant_image(icon, "full-color"), 512, maskable=True)
    save_png(OUT / "android-pwa" / "maskable-icon-512.png", maskable)

    (OUT / "asset-index.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_docs(manifest)


if __name__ == "__main__":
    main()
