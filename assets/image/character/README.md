# Character assets

Character images are grouped by scope so that every page can own one continuous
motion sheet without mixing source art and runtime assets.

```text
character/
├── shared/
│   └── base/                    # Canonical reusable stills
└── pages/
    └── <page>/
        └── <motion>/
            ├── source/          # Original/generated master image
            ├── sprites/         # Normalized runtime sprite sheet
            ├── frames/          # Extracted cells for inspection and iteration
            ├── previews/        # Animated QA previews
            └── motion.json      # Grid and playback metadata
```

## Naming

- Page motion: `frog-<motion>-sheet.png`
- Extracted cells: `frame-01.png`, `frame-02.png`, ...
- Preview: `frog-<motion>-preview.webp`
- Keep one complete narrative motion in one sheet. Do not mix frames from other
  pages into the same runtime sheet.

## Current splash motion

- Runtime sheet: `pages/splash/seamless-entry/sprites/frog-seamless-entry-sheet-v11.png`
- Grid: 4 columns × 4 rows, 16 frames at 320 × 320 pixels
- Sequence: anchored greeting → neutral settle → front-right three-quarter turn →
  two compact crouches → short-limbed push-off → airborne from row three →
  gradual 20°/50°/rear turn → cyan portal entry
- Frames 1–5 use the same canonical standing face and repeat the stable peak-wave
  frame instead of the taller V5 pose, removing the apparent face pulsing. Frames
  9–10 keep both arms and both hind legs fully extended through takeoff and
  flight while preserving one identical large-head ratio. Frames 11–13 rotate
  through three airborne angles at a consistent scale, replacing the abrupt
  front-to-back flip. Generated frames are palette-matched to the greeting
  source before composition. The proven V8 portal-entry frames remain the basis
  of frames 14–16 and are uniformly enlarged to soften the size transition.
- The launch anatomy references `feature/frog-motion` while changing its
  downward water dive into a short, shallow rightward jump. The target is the
  left 28% of the monitor screen rather than its center. Earlier sheets remain
  available for comparison but are no longer used at runtime.
