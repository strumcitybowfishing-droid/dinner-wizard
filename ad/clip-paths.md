# DINNER WIZARD — TikTok / Shorts ad assets

Vertical **9:16** (1080×1920). Brand: forest green, gold, cream. No people, no copyrighted characters, no MeatEater branding.

Live URL on the end card: https://dinner-wizard.onrender.com

Imagine `image_to_video` / `reference_to_video` were blocked in this session (ZDR — xAI cannot store video output). Keyframes were generated with `image_gen` at 9:16, then animated locally (Ken Burns zoom + crossfades) into H.264 clips.

---

## Clips (post these)

| # | Beat | Duration | Path |
|---|------|----------|------|
| 1 | Tired of choosing dinner → wizard hat skillet | 6.1s | `C:\Users\johnn\Desktop\Dinner Wizard\ad\clips\01-tired-hat.mp4` |
| 2 | Pick a protein → hat pulls THREE recipe names | 9.7s | `C:\Users\johnn\Desktop\Dinner Wizard\ad\clips\02-protein-three.mp4` |
| 3 | Full plate: sides + one-store grocery total | 8.0s | `C:\Users\johnn\Desktop\Dinner Wizard\ad\clips\03-plate-total.mp4` |
| 4 | End card: DINNER WIZARD + URL + bookmark it | 6.1s | `C:\Users\johnn\Desktop\Dinner Wizard\ad\clips\04-end-card.mp4` |

Full cut (all four clips concatenated, ~30s):

- `C:\Users\johnn\Desktop\Dinner Wizard\ad\clips\dinner-wizard-tiktok.mp4`

All clips: 1080×1920, 30 fps, H.264 High, yuv420p, silent AAC, `+faststart`.

---

## Keyframes (`image_gen`, 9:16)

Working copies used to build the videos:

| Clip | Role | Path |
|------|------|------|
| 1 | Open — messy kitchen, **TIRED OF CHOOSING DINNER?** | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip1_tired.jpg` |
| 1 | Close — brass hat in skillet, **YOU TAP. THE HAT DECIDES.** | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip1_hat.jpg` |
| 2 | Open — phone UI, **PICK A PROTEIN** (Chicken selected) | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip2_protein.jpg` |
| 2 | Close — hat + three cards: Honey Garlic Chicken, Skillet Thighs, Lemon Herb Roast | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip2_three.jpg` |
| 3 | Open — plated chicken + green beans + mashed potatoes | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip3_plate.jpg` |
| 3 | Close — **CART AT ONE STORE $24.18** overlay | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip3_total.jpg` |
| 4 | Open — icon + **DINNER WIZARD** | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip4_logo.jpg` |
| 4 | Close — URL + **BOOKMARK IT** | `C:\Users\johnn\Desktop\Dinner Wizard\ad\keyframes\clip4_end_url.jpg` |

Original `image_gen` session files (same pixels, numbered in generation order):

Session folder:

`C:\Users\johnn\.grok\sessions\C%3A%5CUsers%5Cjohnn%5CDesktop%5CDinner%20Wizard\01a0c5f6-b5e4-71c3-b22e-7c8c7fbc2a24\images\`

| Session file | Copied as |
|--------------|-----------|
| `1.jpg` | `ad\keyframes\clip3_plate.jpg` |
| `2.jpg` | `ad\keyframes\clip4_end_url.jpg` |
| `3.jpg` | `ad\keyframes\clip1_hat.jpg` |
| `4.jpg` | `ad\keyframes\clip4_logo.jpg` |
| `5.jpg` | `ad\keyframes\clip3_total.jpg` |
| `6.jpg` | `ad\keyframes\clip2_three.jpg` |
| `7.jpg` | `ad\keyframes\clip2_protein.jpg` |
| `8.jpg` | `ad\keyframes\clip1_tired.jpg` |

Brand reference used in prompts (not generated):

- `C:\Users\johnn\Desktop\Dinner Wizard\icons\wizard.jpg`

---

## On-screen copy (locked)

1. TIRED OF CHOOSING DINNER? → YOU TAP. THE HAT DECIDES.
2. PICK A PROTEIN → THE HAT PULLED THREE (Honey Garlic Chicken / Skillet Thighs / Lemon Herb Roast)
3. FULL PLATE. SIDES INCLUDED. → ONE STORE. ONE TOTAL. / CART AT ONE STORE / $24.18
4. DINNER WIZARD / https://dinner-wizard.onrender.com / BOOKMARK IT
