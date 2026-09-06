# Desktop workstation asset

- Active file: `desktop-workstation-v4.png`
- Previous files: `desktop-workstation-v1.png`, `desktop-workstation-v2.png`, `desktop-workstation-v3.png`
- Generator: Codex built-in ImageGen
- Canvas: 1491 × 1055 RGBA PNG
- Use case: `style-transfer`
- Reference: user-provided minimal all-in-one desktop workspace screenshot
- Background: true transparent alpha; hardware whites remain opaque
- Screen overlay bounds: left `17.97%`, top `11.37%`, width `63.72%`, height `51.85%`
- Active scene layers: `desktop-monitor-v2.png`, `desktop-keyboard-v1.png`, and `desktop-mouse-v1.png`

## V4 style-edit prompt

Restyle only the monitor, keyboard, and mouse into a smooth 2.5D animation-background prop set. Preserve their exact shapes, proportions, viewing angles, scale, spacing, canvas positions, warm white and pale gray colors, and dark charcoal screen. Use clean rounded silhouettes, restrained edge accents, three to four broad tonal bands, smoothly blended highlights, and simplified shadows. Use no surface grain, paper, pencil, brush texture, logo, text, cable, room reflection, extra object, or watermark.

The generator produced a uniform chroma-magenta working background in `desktop-workstation-v4-chroma.png`. `scripts/chroma-key.mjs` converted it to transparent alpha using the sampled matte color `223 19 213`. A neutral-color pass removed the generated edge tint, then `scripts/split-workstation.mjs` produced the active monitor and input-device layers.

`scripts/split-input-devices.mjs` separates the keyboard and mouse while preserving the original 1491 × 1055 coordinate system. This lets the keyboard align independently with the monitor center and keeps the mouse at a controlled gap to its right.

## V2 prompt

Create a cohesive unbranded aluminum all-in-one monitor, slim white keyboard, and minimal white mouse for a website splash hardware layer. Use a wide front-facing composition with a slight top-down view only for the keyboard and mouse. Keep the monitor screen as a clean dark-charcoal rectangle for an HTML overlay. Use restrained editorial product lighting with soft daylight from the upper left and realistic warm-gray contact shadows. Include no desk, wall, cables, accessories, text, logos, trademarks, icons, or watermark.

The built-in generator did not preserve an alpha channel in its direct transparent-background attempts. The final pass changed only the background to a chroma matte, then `scripts/chroma-key.mjs` converted the matte to an alpha channel. This keeps the white monitor, keyboard, and mouse opaque without requiring a CSS blend mode.

`scripts/split-workstation.mjs` separates the monitor from the keyboard and mouse while keeping both files on the same 1491 × 1055 coordinate system. The page can therefore place the monitor on the raised wood shelf and translate the input devices down onto the lower desk without recalculating the monitor screen bounds.
