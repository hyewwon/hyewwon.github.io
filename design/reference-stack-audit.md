# Desktop portfolio reference audit

Checked on 2026-08-26. Stack notes are based on the sites' public HTML, loaded bundles, response headers, and public GitHub profiles. They are implementation clues, not permission to copy private source code or proprietary assets.

## Reference sites

### jSite — hizkiajuan.com

- Style: VS Code-inspired editor as the main portfolio window, Apple-like desktop widgets, file explorer navigation, editorial weather/devlog surfaces.
- Detected stack: React, Tailwind CSS, Radix primitives, Monaco-related editor code, Bun build files, Vercel hosting.
- Interaction approach: component state plus pointer/touch handlers, ResizeObserver, IntersectionObserver, and requestAnimationFrame.
- Public source: no matching public portfolio repository found. The public profile currently exposes only the profile repository: <https://github.com/hizkiajuan>.
- GitHub Pages fit: the generated static HTML/CSS/JS can be deployed. History-based client routes need static route output, hash routing, or a 404 fallback because Pages does not provide Vercel rewrites.

### gucduck — gucduck.com

- Style: macOS lock screen, onboarding tour, desktop icons, Dock, menu bar, Finder/Notes/Photos-style windows, playful personal content.
- Detected stack: Next.js App Router, React, Tailwind CSS, Next Font, Vercel hosting and analytics. The public response is prerendered.
- Interaction approach: React state, localStorage, CSS transitions/utility animations, pointer/touch events, ResizeObserver, and requestAnimationFrame. No reliable GSAP or Framer Motion marker was found in the delivered page bundle.
- Public source: the current gucduck source was not found publicly. Chris Gu's profile is <https://github.com/guchris>; `chris.github.io` is an older portfolio for another domain, not gucduck.
- GitHub Pages fit: possible only as a Next.js static export (`output: "export"`) and only if the site avoids server-only features. Vercel APIs and server actions would need replacement.

### EyOS — eythor.com

- Style: lock screen followed by a complete desktop environment with movable windows, taskbar, quick settings, notifications, wallpaper controls, files, terminal, and small apps.
- Detected stack: one mostly self-contained HTML document with large inline CSS and vanilla JavaScript, Canvas, localStorage, requestAnimationFrame, and Netlify hosting.
- Interaction approach: direct DOM events, pointer/touch handling, local state persistence, Canvas wallpaper effects, and reduced-motion/lite-mode branches.
- Public source: no public site repository found. The author's confirmed profile is <https://github.com/Eyjos> and currently exposes no public repositories.
- GitHub Pages fit: the static interface can deploy directly. Netlify Forms and Netlify-specific analytics would not work on Pages without alternatives.

## Stack decision for this project

- Keep semantic HTML and vanilla JavaScript.
- Use SCSS as the authored styling source and compile it to static CSS.
- Keep the Web Animations API for the splash timeline and add GSAP only if later window orchestration needs complex, interruptible timelines.
- Borrow interaction principles—lock-to-desktop progression, draggable window grammar, Dock/taskbar affordances, persistent desktop state—not source code, branding, or assets.
- Commit compiled CSS so branch-based GitHub Pages deployment remains possible. GitHub Actions can automate the same build later.

## Deployment references

- GitHub Pages publishing sources: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- GitHub Pages custom workflows: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Next.js static export: <https://nextjs.org/docs/app/getting-started/deploying#static-export>
- Bun static HTML builds: <https://bun.sh/docs/bundler/html-static>
