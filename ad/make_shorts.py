"""Build a ~30s 9:16 Shorts MP4 from stills. Exact captions in PIL."""
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "dinner-wizard-shorts.mp4"
W, H = 1080, 1920
FPS = 30


def font(size: int, bold: bool = True):
    names = [
        "C:/Windows/Fonts/georgia.ttf",
        "C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgia.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    if bold:
        names = ["C:/Windows/Fonts/georgiab.ttf"] + names
    for n in names:
        p = Path(n)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def cover(img: Image.Image, w: int, h: int) -> Image.Image:
    src_w, src_h = img.size
    scale = max(w / src_w, h / src_h)
    nw, nh = int(src_w * scale) + 2, int(src_h * scale) + 2
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return img.crop((left, top, left + w, top + h))


def ken(img: Image.Image, t: float, zoom_from: float = 1.0, zoom_to: float = 1.12) -> Image.Image:
    z = zoom_from + (zoom_to - zoom_from) * t
    nw, nh = int(W * z), int(H * z)
    big = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - W) * t)
    top = int((nh - H) * (1 - t) * 0.4)
    left = max(0, min(left, nw - W))
    top = max(0, min(top, nh - H))
    return big.crop((left, top, left + W, top + H))


def caption(frame: Image.Image, lines: list[str], small: str | None = None) -> Image.Image:
    im = frame.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, int(H * 0.68), W, H), fill=(19, 38, 30, 200))
    f = font(64)
    y = int(H * 0.74)
    for line in lines:
        bbox = d.textbbox((0, 0), line, font=f)
        tw = bbox[2] - bbox[0]
        d.text(((W - tw) // 2, y), line, font=f, fill=(196, 163, 90, 255))
        y += 78
    if small:
        fs = font(36, bold=False)
        bbox = d.textbbox((0, 0), small, font=fs)
        tw = bbox[2] - bbox[0]
        d.text(((W - tw) // 2, y + 8), small, font=fs, fill=(244, 239, 228, 230))
    return Image.alpha_composite(im, overlay).convert("RGB")


def end_card() -> Image.Image:
    im = Image.new("RGB", (W, H), (28, 58, 46))
    d = ImageDraw.Draw(im)
    icon = Image.open(ROOT / "icon.jpg").convert("RGB")
    icon = icon.resize((420, 420), Image.Resampling.LANCZOS)
    mask = Image.new("L", (420, 420), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 419, 419), 48, fill=255)
    im.paste(icon, ((W - 420) // 2, 380), mask)
    title = font(72)
    sub = font(40, bold=False)
    urlf = font(42)
    for text, fnt, y, color in [
        ("DINNER WIZARD", title, 860, (196, 163, 90)),
        ("You tap. The hat decides.", sub, 960, (244, 239, 228)),
        ("dinner-wizard.onrender.com", urlf, 1180, (196, 163, 90)),
        ("FREE  ·  bookmark it", sub, 1280, (244, 239, 228)),
    ]:
        bbox = d.textbbox((0, 0), text, font=fnt)
        tw = bbox[2] - bbox[0]
        d.text(((W - tw) // 2, y), text, font=fnt, fill=color)
    return im


def shot(src: Image.Image, seconds: float, lines: list[str], small: str | None = None):
    n = int(seconds * FPS)
    base = cover(src.convert("RGB"), W, H)
    for i in range(n):
        t = i / max(n - 1, 1)
        yield caption(ken(base, t), lines, small)


def main() -> None:
    hat = Image.open(ROOT / "shot-hat.jpg")
    phone = Image.open(ROOT / "shot-phone.jpg")
    plate = Image.open(ROOT / "shot-plate.jpg")
    end = end_card()
    frames = []
    frames.extend(shot(hat, 6, ["WHAT'S FOR DINNER."], "It's 5:40. He said whatever you want."))
    frames.extend(shot(phone, 6, ["YOU TAP.", "THE HAT DECIDES."], "Three names. That's it."))
    frames.extend(shot(plate, 6, ["TWO SIDES + THE CART"], "Walmart. Kroger. Costco. Your store."))
    n = int(6 * FPS)
    for i in range(n):
        frames.append(end)
    print("frames", len(frames), "seconds", len(frames) / FPS)
    writer = imageio.get_writer(
        str(OUT),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=1,
        ffmpeg_params=["-movflags", "+faststart"],
    )
    for fr in frames:
        writer.append_data(np.asarray(fr))
    writer.close()
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
