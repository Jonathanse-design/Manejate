from __future__ import annotations

import base64
import json
import shutil
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

try:
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas
except Exception:  # pragma: no cover
    ImageReader = None
    canvas = None


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand"
SOURCE_SYMBOL = OUT / "source" / "Manejate simbolo.png"
if not SOURCE_SYMBOL.exists():
    SOURCE_SYMBOL = ROOT / "Manejate simbolo.png"

BLUE = (0, 87, 255, 255)
PURPLE = (123, 44, 255, 255)
ORANGE = (255, 122, 0, 255)
NAVY = (6, 22, 58, 255)
WHITE = (255, 255, 255, 255)
GRAY = (92, 102, 118, 255)
BG_LIGHT = (255, 255, 255, 255)
BG_DARK = (4, 16, 43, 255)

LOGO_SIZES = [512, 1024, 2048]
ISOTYPE_SIZES = [64, 128, 256, 512, 1024]
APP_ICON_SIZES = [16, 32, 48, 64, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024]

VARIANTS = [
    "full-color-flat",
    "full-color-glossy",
    "light-bg",
    "dark-bg",
    "mono-dark",
    "mono-white",
    "grayscale",
    "small-size-optimized",
]

ASSET_TYPES = ["logo-horizontal", "logo-stacked", "isotype", "wordmark", "app-icon"]


def font_path() -> str:
    candidates = [
        "/System/Library/Fonts/Supplemental/Sora-SemiBold.ttf",
        "/Library/Fonts/Sora-SemiBold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/ArialHB.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError("No suitable font found")


FONT = font_path()


def trim_alpha(img: Image.Image, pad: int = 0) -> Image.Image:
    img = img.convert("RGBA")
    bbox = img.getchannel("A").getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def load_symbol() -> Image.Image:
    return trim_alpha(Image.open(SOURCE_SYMBOL).convert("RGBA"), 0)


def tint_by_mask(img: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    alpha = img.getchannel("A")
    out = Image.new("RGBA", img.size, color)
    out.putalpha(alpha)
    return out


def flat_symbol(img: Image.Image) -> Image.Image:
    src = img.convert("RGBA")
    out = Image.new("RGBA", src.size, (255, 255, 255, 0))
    pixels = src.load()
    dest = out.load()
    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if r > 180 and g > 70:
                color = ORANGE
            elif b > 180 and r < 80:
                color = BLUE
            else:
                color = PURPLE
            dest[x, y] = color[:3] + (a,)
    return out


def small_symbol(img: Image.Image) -> Image.Image:
    flat = flat_symbol(img)
    alpha = flat.getchannel("A").filter(ImageFilter.MaxFilter(3))
    out = flat.copy()
    out.putalpha(alpha)
    return out


def grayscale_symbol(img: Image.Image) -> Image.Image:
    alpha = img.getchannel("A")
    gray = ImageOps.grayscale(img.convert("RGB")).convert("RGBA")
    gray.putalpha(alpha)
    return gray


def symbol_variant(base: Image.Image, variant: str) -> Image.Image:
    if variant in {"full-color-glossy", "light-bg", "dark-bg"}:
        return base.copy()
    if variant == "full-color-flat":
        return flat_symbol(base)
    if variant == "small-size-optimized":
        return small_symbol(base)
    if variant == "mono-dark":
        return tint_by_mask(base, NAVY)
    if variant == "mono-white":
        return tint_by_mask(base, WHITE)
    if variant == "grayscale":
        return grayscale_symbol(base)
    raise ValueError(variant)


def word_color(variant: str) -> tuple[int, int, int, int]:
    if variant in {"dark-bg", "mono-white"}:
        return WHITE
    if variant == "grayscale":
        return GRAY
    return NAVY


def resize_h(img: Image.Image, h: int) -> Image.Image:
    return img.resize((round(img.width * h / img.height), h), Image.Resampling.LANCZOS)


def resize_w(img: Image.Image, w: int) -> Image.Image:
    return img.resize((w, round(img.height * w / img.width)), Image.Resampling.LANCZOS)


def wordmark(variant: str, height: int = 180) -> Image.Image:
    text = "Manéjate"
    size = 100
    while True:
        font = ImageFont.truetype(FONT, size=size)
        bbox = font.getbbox(text)
        if bbox[3] - bbox[1] >= height * 0.72:
            break
        size += 4
    font = ImageFont.truetype(FONT, size=size)
    bbox = font.getbbox(text)
    w = bbox[2] - bbox[0] + 36
    h = bbox[3] - bbox[1] + 44
    img = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw.text((18 - bbox[0], 18 - bbox[1]), text, font=font, fill=word_color(variant))
    return trim_alpha(img, 4)


def compose_horizontal(symbol: Image.Image, wm: Image.Image) -> Image.Image:
    sym = resize_h(symbol, 300)
    text = resize_h(wm, 118)
    gap = 84
    pad = 36
    out = Image.new("RGBA", (sym.width + gap + text.width + pad * 2, max(sym.height, text.height) + pad * 2), (255, 255, 255, 0))
    out.alpha_composite(sym, (pad, (out.height - sym.height) // 2))
    out.alpha_composite(text, (pad + sym.width + gap, (out.height - text.height) // 2 + 8))
    return out


def compose_stacked(symbol: Image.Image, wm: Image.Image) -> Image.Image:
    sym = resize_h(symbol, 260)
    text = resize_w(wm, 430)
    gap = 44
    pad = 34
    out = Image.new("RGBA", (max(sym.width, text.width) + pad * 2, sym.height + gap + text.height + pad * 2), (255, 255, 255, 0))
    out.alpha_composite(sym, ((out.width - sym.width) // 2, pad))
    out.alpha_composite(text, ((out.width - text.width) // 2, pad + sym.height + gap))
    return out


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def app_icon(symbol: Image.Image, variant: str, size: int = 1024, maskable: bool = False) -> Image.Image:
    bg = BG_DARK if variant == "dark-bg" else (248, 249, 252, 255)
    tile = Image.new("RGBA", (size, size), bg)
    radius = round(size * 0.23)
    tile.putalpha(rounded_mask(size, radius))
    if variant not in {"mono-white", "dark-bg"}:
        shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow)
        m = round(size * 0.08)
        draw.rounded_rectangle((m, m, size - m, size - m), radius=radius, fill=(15, 23, 42, 30))
        shadow = shadow.filter(ImageFilter.GaussianBlur(round(size * 0.018)))
        canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        canvas.alpha_composite(shadow)
        canvas.alpha_composite(tile)
    else:
        canvas = tile
    sym_h = round(size * (0.58 if maskable else 0.68))
    sym = resize_h(symbol, sym_h)
    canvas.alpha_composite(sym, ((size - sym.width) // 2, (size - sym.height) // 2))
    return canvas


def add_background(img: Image.Image, variant: str) -> Image.Image:
    if variant not in {"light-bg", "dark-bg"}:
        return img
    bg = BG_DARK if variant == "dark-bg" else BG_LIGHT
    pad = max(24, round(max(img.size) * 0.08))
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), bg)
    out.alpha_composite(img, (pad, pad))
    return out


def fit_width(img: Image.Image, width: int) -> Image.Image:
    return resize_w(img, width)


def contain_square(img: Image.Image, size: int, pad_ratio: float) -> Image.Image:
    out = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    max_side = round(size * (1 - pad_ratio * 2))
    layer = resize_w(img, max_side) if img.width >= img.height else resize_h(img, max_side)
    out.alpha_composite(layer, ((size - layer.width) // 2, (size - layer.height) // 2))
    return out


def save_png(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def save_svg(path: Path, img: Image.Image, title: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    buf = BytesIO()
    img.save(buf, "PNG")
    payload = base64.b64encode(buf.getvalue()).decode("ascii")
    path.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{img.width}" height="{img.height}" viewBox="0 0 {img.width} {img.height}" role="img" aria-label="{title}">'
        f'<title>{title}</title><image href="data:image/png;base64,{payload}" width="{img.width}" height="{img.height}" preserveAspectRatio="xMidYMid meet"/></svg>\n',
        encoding="utf-8",
    )


def save_pdf(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if canvas and ImageReader:
        buf = BytesIO()
        img.save(buf, "PNG")
        buf.seek(0)
        pdf = canvas.Canvas(str(path), pagesize=(img.width, img.height))
        pdf.drawImage(ImageReader(buf), 0, 0, width=img.width, height=img.height, mask="auto")
        pdf.showPage()
        pdf.save()
    else:
        img.convert("RGB").save(path, "PDF")


def write_docs(index: list[dict]) -> None:
    (OUT / "README.md").write_text(
        """# Manéjate Brand Assets

Sistema de assets generado desde el logo aprobado `Manejate.png` y el isotipo aprobado `Manejate simbolo.png`.

## Contenido

- `logo-horizontal/`: firma principal con isotipo + wordmark.
- `logo-stacked/`: versión apilada.
- `isotype/`: símbolo de tres barras.
- `wordmark/`: texto `Manéjate`.
- `app-icon/`: iconos de app por tamaño.
- `favicon/`: favicon PNG e ICO.
- `apple-touch-icon/`: icono iOS.
- `android-pwa/`: iconos Android/PWA y maskable.
- `manifest-icons.json`: entradas listas para manifest web.

Los SVG y PDF preservan el símbolo aprobado mediante el arte fuente, evitando reinterpretar la silueta, proporciones o ángulos.
""",
        encoding="utf-8",
    )
    (OUT / "brand-guidelines.md").write_text(
        """# Manéjate Brand Guidelines

## Logo

El símbolo de Manéjate está formado por tres barras separadas que construyen una M. No redibujar, rotar, estirar ni cambiar sus proporciones. La barra central morada debe mantenerse alineada ópticamente con las barras azul y naranja.

## Color

- Azul: `#0057FF`
- Morado: `#7B2CFF`
- Naranja: `#FF7A00`

## Tipografía

Usar Sora SemiBold o equivalente. Escribir siempre `Manéjate` con tilde.

## Variantes

- `full-color-flat`: versión plana para interfaces limpias.
- `full-color-glossy`: versión con acabado aprobado.
- `light-bg`: composición sobre fondo claro.
- `dark-bg`: composición sobre fondo oscuro.
- `mono-dark`: una tinta oscura.
- `mono-white`: una tinta blanca.
- `grayscale`: uso sin color.
- `small-size-optimized`: mayor legibilidad para tamaños pequeños.

## Uso

Mantener un margen mínimo alrededor del logo equivalente al 20% de la altura del isotipo. Para favicon, app icon y tamaños pequeños usar `isotype` o `app-icon`, no el logo horizontal.
""",
        encoding="utf-8",
    )
    (OUT / "asset-index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    source_symbol = SOURCE_SYMBOL
    source_logo = ROOT / "Manejate.png"
    source_symbol_bytes = source_symbol.read_bytes()
    source_logo_bytes = source_logo.read_bytes() if source_logo.exists() else None
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    (OUT / "source").mkdir(parents=True, exist_ok=True)
    (OUT / "source" / "Manejate simbolo.png").write_bytes(source_symbol_bytes)
    if source_logo_bytes:
        (OUT / "source" / "Manejate.png").write_bytes(source_logo_bytes)

    base_symbol = load_symbol()
    index: list[dict] = []
    masters: dict[tuple[str, str], Image.Image] = {}

    for variant in VARIANTS:
        sym = symbol_variant(base_symbol, variant)
        wm = wordmark(variant)
        masters[("isotype", variant)] = sym
        masters[("wordmark", variant)] = wm
        masters[("logo-horizontal", variant)] = add_background(compose_horizontal(sym, wm), variant)
        masters[("logo-stacked", variant)] = add_background(compose_stacked(sym, wm), variant)
        masters[("app-icon", variant)] = app_icon(sym, variant)

    size_map = {
        "logo-horizontal": LOGO_SIZES,
        "logo-stacked": LOGO_SIZES,
        "wordmark": LOGO_SIZES,
        "isotype": ISOTYPE_SIZES,
        "app-icon": APP_ICON_SIZES,
    }

    for asset in ASSET_TYPES:
        for variant in VARIANTS:
            master = masters[(asset, variant)]
            for size in size_map[asset]:
                if asset in {"isotype", "app-icon"}:
                    out_img = contain_square(master, size, 0.08 if asset == "isotype" else 0)
                else:
                    out_img = fit_width(master, size)
                stem = f"manejate-{asset}-{variant}-{size}px"
                png_path = OUT / asset / variant / "png" / f"{stem}.png"
                save_png(png_path, out_img)
                index.append({"asset": asset, "variant": variant, "format": "png", "size": size, "path": str(png_path.relative_to(OUT))})

            svg_master = contain_square(master, 1024, 0.08) if asset in {"isotype", "app-icon"} else fit_width(master, 2048)
            svg_path = OUT / asset / variant / "svg" / f"manejate-{asset}-{variant}.svg"
            pdf_path = OUT / asset / variant / "pdf" / f"manejate-{asset}-{variant}.pdf"
            save_svg(svg_path, svg_master, f"Manéjate {asset} {variant}")
            save_pdf(pdf_path, svg_master)
            index.append({"asset": asset, "variant": variant, "format": "svg", "size": None, "path": str(svg_path.relative_to(OUT))})
            index.append({"asset": asset, "variant": variant, "format": "pdf", "size": None, "path": str(pdf_path.relative_to(OUT))})

    fav_layers = []
    for size in [16, 32, 48]:
        img = contain_square(masters[("isotype", "small-size-optimized")], size, 0.05)
        save_png(OUT / "favicon" / f"favicon-{size}.png", img)
        fav_layers.append(img)
    fav_layers[0].save(OUT / "favicon" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    apple = contain_square(masters[("app-icon", "full-color-glossy")], 180, 0)
    save_png(OUT / "apple-touch-icon" / "apple-touch-icon-180.png", apple)

    manifest_icons = []
    for size in [192, 256, 384, 512]:
        icon = contain_square(masters[("app-icon", "full-color-glossy")], size, 0)
        path = OUT / "android-pwa" / f"icon-{size}.png"
        save_png(path, icon)
        manifest_icons.append({"src": str(path.relative_to(OUT)), "sizes": f"{size}x{size}", "type": "image/png", "purpose": "any"})
    maskable = app_icon(masters[("isotype", "full-color-glossy")], "full-color-glossy", 512, maskable=True)
    save_png(OUT / "android-pwa" / "maskable-icon-512.png", maskable)
    manifest_icons.append({"src": "android-pwa/maskable-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"})
    (OUT / "manifest-icons.json").write_text(json.dumps(manifest_icons, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    write_docs(index)


if __name__ == "__main__":
    main()
