# Frog Journey Portfolio

## Concept

One frog protagonist grows as the visitor scrolls:

1. A single pale egg containing a black embryo.
2. A black tadpole.
3. A charcoal froglet with emerging olive limbs.
4. A bright green adult frog.
5. A final jump beyond the well.

The well only appears in the last chapter. The final lifecycle will be delivered as scroll-scrubbed video; the current transparent character assets are composition placeholders only. Text and links stay as HTML layers above it.

## Tokens

- Ink: `#111713`
- Deep pond: `#102D27`
- Moss: `#86B74A`
- Cream: `#F3F0E4`
- Coral: `#EFA07D`
- Fog: `#68736A`
- Display: Bricolage Grotesque 700
- Body: Inter / Pretendard 400
- Labels: Space Grotesk 600
- Editorial panel radius: `28px`
- Pill radius: `999px`
- Page padding: `clamp(24px, 5vw, 80px)`

## Interaction

- The first `750vh` is a sticky five-chapter story on desktop (`725vh` on compact layouts).
- A single 10-second video is scrubbed across the complete journey; the five lifecycle images remain source checkpoints for rerendering.
- Each chapter reserves `150svh` on desktop and `145svh` on compact layouts so short copy remains readable.
- Native mandatory scroll snap settles on each chapter checkpoint; later portfolio sections remain regular, scrollable snap areas.
- Chapter copy remains sticky inside its own section while the video timeline follows normalized journey progress.
- `prefers-reduced-motion` removes non-essential animation.
- Mobile stacks the active character above the current chapter copy.
- Ambient water replaces concentric decoration with an OriginKit Line Ripple Background-inspired canvas flow field: sparse short current streaks, low-contrast moss/white strokes, gentle drift, and restrained cursor deflection.
- Light beams and a few bubbles remain secondary; WebGL liquid distortion is intentionally avoided so video scrubbing stays smooth.
- Editorial titles reveal line-by-line through clipping masks.
- Case-study evidence assembles in a staggered sequence instead of appearing as one block.
- Interactive links use restrained magnetic movement on fine-pointer devices only.

## Recruiting rules

- Surface project evidence before the journey ends.
- Use `problem -> role -> technical choice -> delivery` for representative work.
- Do not invent metrics.
- Keep real links and text as HTML, never embedded in character images.
