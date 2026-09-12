# Active character assets

- Splash: `pages/splash/seamless-entry/sprites/frog-seamless-entry-sheet-v12.png` (4 × 4).
- Guide fallback still: `pages/splash/seamless-entry/frames-v12/frame-seamless-v12-01.png`.
- About / Skills / Experience / Projects: numbered frames in `pages/desktop/guide-polish-v1/` (17 / 17 / 16 / 16 frames).
- Guide ending: `pages/desktop/outro-guide/frames-v2/` (8 frames; neutral blink reused from About).
- Resting / restart mascot: `pages/desktop/restart-guide/frames-v2/` (6 frames).
- Lock screen and About profile: `shared/profile/frog-profile-avatar-v4.svg` (embedded raster data).

Unused editing sheets, older frames and generation records were moved out of the repository during the 2026-09-12 release cleanup. Runtime artwork has not been modified.

Run `npm run audit:assets` for a read-only report. Dynamically constructed paths are explicitly checked by `tools/site.mjs`.
