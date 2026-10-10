# Decisions

Why this site is built the way it is. `BRIEF.md` is the specification; this file records what was decided in building it, and why. Extend it whenever a decision is made that the brief does not cover.

---

## The idea

**A garment, worn.**

The site is a piece of cloth. The home page is a woven surface that wears where people touch it, the way his Dremel wears the backpack: threads loosen, open, and go. Through the holes is the picture as his broken camera saw it, smeared and magenta, tearing more the faster the hand moves. The site sews the holes shut with running stitch and patches them with scraps of other pieces. A visitor can pick up the needle and sew too. All of it is kept in the visitor's browser, so the site a person returns to is the one they wore, mended while they were away. The tab frays and heals with the cloth.

Everything else is plain HTML: a list of the work, a page per piece, his line, an email. Ink on unbleached cloth, one mono typeface, and every line on the site is a running stitch.

Between touches the site is still, because his bio says *still as a mannequin* and because stillness is the minimalism half of the brief.

## Rules the design follows

1. Imperfection is a record, not a style. Every irregularity has a nameable cause: a hand, a Dremel, a broken sensor, a phone camera, an image still loading. None is random.
2. Nothing is larger than the work. No type above 20px.
3. There are no solid lines. Every rule is `1px dashed`.
4. One typeface, one ink, one signal. The signal colour appears in exactly three places: the current navigation item, the focus ring, and a stitch while it is being sewn. Placeholders in square brackets also use it, as a defect marker that must not survive to launch.
5. No instructional text.
6. The photographs are not treated.
7. Only the cloth moves, and the tab records it.
8. Every fallback is a composition.
9. Nothing is invented. Every sentence on the site is his, or is a visible placeholder.
10. Say why.

---

## Technical decisions

### Next 16, fully static, Cache Components off

The scaffold turns `cacheComponents` on. In that mode any uncached asynchronous work in a Server Component, including reading the content folder from disk, counts as request-time data and must be wrapped in Suspense or marked `'use cache'`. This site has no request-time data at all: every route is prerendered from files in `content/`. Turning the flag off makes that the default again, with nothing to annotate and nothing that can silently become dynamic. The check is the route table `next build` prints: every route must be static.

### Server Components everywhere except the machines

The pages are prose, lists and photographs; none of it needs client JavaScript. The client components are the cloth, the clock in the label, and the tab. The work and about pages ship no component code of their own.

### CSS Modules and a single tokens file

`src/styles/tokens.css` is the only place a colour, size, duration or easing is written. `base.css` carries the reset and the typographic primitives. Components use CSS Modules and read tokens. No utility framework: the site has perhaps forty rules of CSS and a framework would be larger than the site.

### One font, self-hosted by the build

IBM Plex Mono, 400 upright and italic, through `next/font/google`, which downloads at build time and serves the files from this origin. A visitor's browser never contacts Google. No second family and no second weight, so there is nothing to synthesise and `font-synthesis: none` makes sure nothing is.

### Everything lowercase

He writes `(mqn)`, `mannequin`, `i crave imperfection`, `manipulating fabric, still as a mannequin`. The site keeps his casing everywhere rather than imposing a house style on his words, and extends it to its own labels so the two never clash.

### Three.js as a loom, not a scene

One orthographic camera, one plane, hand-written shaders, two render targets. No scene graph is needed beyond that, so none is used: no React Three Fiber, no drei, no examples, no post-processing library. WebGL2 only, because the first visitor arrives from the Instagram bio link inside Instagram's in-app browser on a phone, where WebGPU cannot be relied on. Shaders live as template strings in `shaders.ts` so the build needs no loader configuration.

### Dashed borders differ by browser, and that is accepted

`border-style: dashed` is drawn with different dash and gap lengths by Chrome, Safari and Firefox. A running stitch sewn by two hands also differs. The site uses the browser's own dashes rather than simulating a consistent one with gradients, and this is the kind of irregularity rule 1 permits: the cause is the browser the visitor chose.

### No dark mode

A garment does not have one. `color-scheme: light`; `theme-color` is the literal value of `--cloth`.

### The loading placeholder is pixelated, not blurred

Next's blur placeholder lays a CSS blur over a tiny image. A blur asserts a smoothness the file does not have; a tiny image scaled with `image-rendering: pixelated` is the truth about a small image. So the placeholder is the photograph itself at sixteen pixels wide, behind the real one, and the swap is a cut.

### Placeholders are loud

Anything the maker has not confirmed is rendered inside square brackets in the signal colour. It is meant to be ugly, so it cannot ship unnoticed. The README lists every one.

---

## Gate 0

*(To be filled in when the broken-camera shader has been approved against his photographs: which images, which parameter values, and who said yes.)*

---

## Considered and not built

- **A room you walk through, from a scan of his workspace.** Specified in the brief as Phase 2. It does not exist until he makes a scan with his phone; nothing is built against a sample file.
- **Physics in the room.** Only if knocking a print over would read as wear and not as a toy.
- **One garment worn by everyone, through a KV store.** Only once he decides he wants it. Hand stitches would never be shared, because a shared drawing surface is a moderation problem.
- **A needle cursor that leaves a trail.** The cursor is the browser's own except while a stitch is being sewn by hand, where picking up the needle is the cause. Stitches stay; they are not a trail.
