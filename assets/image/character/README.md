# Current character assets

## Runtime and editable masters

- Splash: `pages/splash/seamless-entry/sprites/frog-seamless-entry-sheet-v12.png`
  (4 × 4, 16 frames). The matching `frames-v12/` set is retained for editing;
  frame 01 also supplies the guide's fallback still and restart button.
- Desktop guide: `pages/desktop/guide-polish-v1/` contains the actual runtime
  PNG frames: About 17, Skills 17, Experience 16, Projects 16. Its sheets,
  blink source and manifest are retained as the current editable masters.
- Character reference: `shared/base/frog-default-standing.png`.
- Lock screen / About profile: `shared/profile/frog-profile-avatar-v4.svg`
  contains its raster image inline; no external profile PNG is required.

## Cleanup — 2026-09-10

Superseded sprite sheets, intermediate images and animated preview HTML pages
were removed. Old motion/quality JSON, design notes and one-off generation
scripts are historical records, not runtime dependencies. Their old image
inputs are archived; restore the relevant inputs before rerunning those recipes.

See `design/asset-cleanup-20260910.md` for the archive and restore instructions.
Run `node scripts/audit-unused-assets.mjs` for a read-only audit. It explicitly
preserves dynamically loaded guide frames and current editable masters.
