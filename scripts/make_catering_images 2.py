"""Build trimmed thumbnails + viewer-size photos for the BLFM catering menu.

Usage (from the repo root): python3 scripts/make_catering_images.py .
To add a dish photo: add "<slug>": "<source path>" to SOURCES, run this, then set img: "<slug>" in src/catering.js.
Writes imgs/catering/thumbs/<slug>.jpg (720px) and imgs/catering/full/<slug>.jpg (1600px).
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None  # some source webps are ~195MP

root = Path(sys.argv[1])
CI, CM, GA = 'imgs/Catering-imgs/', 'imgs/cateringMenu/', 'imgs/gallery/'

SOURCES = {
    # dishes
    'chivo-entero': CM + 'Chivo.webp',
    'chivo-media-charola': CM + 'Chivo-Media-Charola.webp',
    'carnitas': CM + 'Carnitas.webp',
    'costillas-fritas': CI + 'Costillas_Frita.jpeg',
    'costillas-puerco-salsa-verde': CM + 'Costillas-Puerco-Salsa-Verde.webp',
    'costillas-bbq': CI + 'Costillas_BBQ.jpeg',
    'adobo-puerco': CI + 'Adobe_Puerco.jpeg',
    'pollo-enchilado': CI + 'Pollo-Enchilado.jpg',
    'pollo-rostizado': CM + 'Pollo_Rostizados.webp',
    'mixiotes-pollo-nopales': CM + 'Mixiotes de Pollo.webp',
    'mole-poblano-pollo': CM + 'Mole_Poblano_Pollo.webp',
    'adobo-pollo': CI + 'Adobo-de-pollo.jpeg',
    'alas-bbq': CI + 'Alas_BBQ.jpeg',
    'piernas-pollo-empanizadas': CI + 'Piernas_de_Pollo_Empanizada.jpeg',
    'pollo-francesa': CI + 'Pollo_ala_Francesa.jpeg',
    'bistec-mexicana': CM + 'Bistec ala Mexicana.webp',
    'camarones-diabla': CI + 'Camarones_ala_Diabla.jpeg',
    'camarones-fritos': CI + 'Camarones_1.jpeg',
    'ensalada-nopales': CM + 'Ensalada-Nopales.webp',
    'ensalada-mixta': CM + 'Ensalada-Mix.webp',
    'ensalada-papas': CM + 'Ensalada-Papas.webp',
    'arroz-mexicano': CM + 'Arroz-Mexicano.webp',
    'arroz-blanco': CM + 'Arroz_Blanco.webp',
    'arroz-gandules': CM + 'Arroz-con-Gandules.webp',
    'arroz-vegetales': CI + 'Arroz_con_Vegetales.jpeg',
    'frijoles': CM + 'Frijoles.webp',
    'tortillas': CM + 'Tortillas=Recien.webp',
    'espagueti-mexicana': CM + 'Espagueti_a_la_Mexicana.webp',
    'espagueti-crema-queso': CI + 'Espageti_Crema_Queso.jpeg',
    'macaroni-cheese': CI + 'Macaroni_Chesse.jpeg',
    'penne-vodka': CI + 'Penne_Vodka.jpeg',
    'lasagna': CI + 'Lasanga.jpeg',
    'chiles-rellenos': CM + 'Chiles-Rellenos.webp',
    'chilaquiles': CI + 'Chilaquiles.jpeg',
    'flautas': CM + 'Flautas.webp',
    'hot-dogs': CI + 'Hot_Dogs.jpeg',
    'chicken-tenders': CM + 'Chicken-Tenders.webp',
    'mole-mi-rancho': CI + 'Mole_Estilo_Mi_Rancho.jpeg',
    # real-event gallery
    'evento-mesa': GA + 'spread-1.jpg',
    'evento-costillas': GA + 'tray-2.jpg',
    'evento-mesa-completa': GA + 'spread-3.png',
    'evento-mariscos': GA + 'spread-4.jpg',
    'evento-pollo-rostizado': GA + 'chicken-5.jpg',
    'evento-pollo-ejotes': GA + 'chicken-6.jpg',
    'evento-pastas': GA + 'spread-7.jpg',
    'evento-bistec': GA + 'bistec-8.jpg',
    'evento-pernil': GA + 'pernil-9.jpg',
    'evento-pollo-frito': GA + 'pollo-frito-10.jpg',
    'evento-mole': GA + 'mole-11.jpg',
    'evento-adobo': GA + 'adobo-12.jpg',
}

DARK = 48        # mean luminance below this counts as "black bar"
MAX_TRIM = 0.30  # never trim more than 30% from one side


def trim_bars(im):
    """Crop near-black bars from the edges (mostly the sides)."""
    g = ImageOps.grayscale(im)
    small = g.resize((max(1, g.width // 8), max(1, g.height // 8)))
    w, h = small.size
    px = small.load()
    col = [sum(px[x, y] for y in range(h)) / h for x in range(w)]
    row = [sum(px[x, y] for x in range(w)) / w for y in range(h)]

    def edge(vals, rev):
        idx = range(len(vals) - 1, -1, -1) if rev else range(len(vals))
        n = 0
        for i in idx:
            if vals[i] >= DARK:
                break
            n += 1
        return min(n, int(len(vals) * MAX_TRIM))

    l, r, t, b = edge(col, False), edge(col, True), edge(row, False), edge(row, True)
    if not any((l, r, t, b)):
        return im
    # +1 small cell inward to drop the soft edge of the bar
    pad = lambda n: (n + 1) * 8 if n else 0
    box = (pad(l), pad(t), im.width - pad(r), im.height - pad(b))
    return im.crop(box)


def save(im, path, size, quality):
    im = im.copy()
    im.thumbnail((size, size), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, 'JPEG', quality=quality, progressive=True, optimize=True)
    return im.size


for slug, src in SOURCES.items():
    im = ImageOps.exif_transpose(Image.open(root / src)).convert('RGB')
    before = im.size
    im = trim_bars(im)
    t = save(im, root / 'imgs/catering/thumbs' / f'{slug}.jpg', 720, 72)
    save(im, root / 'imgs/catering/full' / f'{slug}.jpg', 1600, 80)
    print(f'{slug:30} {before} -> trimmed {im.size} thumb {t}')
