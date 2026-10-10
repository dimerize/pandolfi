# BRIEF — mannequin

A site for the maker behind **(mqn) — mannequin**, on Instagram as **@icraveimperfection**, run by @sammypandolfi. His bio, in full: *manipulating fabric, still as a mannequin*.

You are building this website from scratch. This file is the whole specification. Read all of it before you write anything. Where it decides, do what it says. Where it leaves you a choice, choose the quieter option. Where it is silent, ask what a piece of worn cloth would do.

This file lives at the root of the repository as `BRIEF.md`. Keep it there. Everything you decide that it does not cover goes in `DECISIONS.md`, in the same voice.

If you are planning rather than building: the plan's first task is Gate 0 (§3). Nothing about pages is worth planning until that shader has been seen and approved on one of his photographs.

---

## 0. Fill in before starting

```
[NAME]     the maker's name, if he wants it shown at all; otherwise the site uses "mannequin" and the handles
[EMAIL]
[CITY]     the skylines suggest New York; confirm, with the IANA time zone
[DOMAIN]   drives canonical URLs and the sitemap
[PHRASE]   optional: a short phrase of his for the tab title when the tab is hidden (§7); none until he gives one
```

Known and not to be changed: the brand is written `mannequin`, the mark is `(mqn)`, the handle is `@icraveimperfection`, the line under the name is `manipulating fabric, still as a mannequin`. All of it lowercase, exactly as he writes it.

Anything you cannot fill in is rendered on the page inside square brackets in the signal colour, so it cannot ship unnoticed. This is the one exception to rule 4, because it marks a defect and must not survive to launch. Never replace an unknown with something plausible.

---

## 1. Who this is for

He manipulates fabric. Visible mending: running stitch in contrast thread across worn denim, patches cut from other garments, pins still in the work. And abrasion as a technique: the backpack is layers of reclaimed denim stitched down in rows and then taken to with a Dremel until the layers fray and show through one another. The repair, the fray, the pin: none of it is hidden. It is the work. The lineage is sashiko and boro; the material is American workwear: jeans, a canvas backpack, work pants, boots.

The documentation is phone photographs on a table, a hanger, an apartment floor, in whatever light there was, not retouched. Beside them is a second kind of image: photographs taken with a **broken camera**. The sensor reads out wrong; rows of the picture smear sideways, frames bleed into one another, the colour splits toward magenta. A skyline tears. A room in a studio tears. These are not filters. The camera is damaged and he keeps using it, which is the same decision as keeping the fray.

The position, in his own words: *i crave imperfection*. In two more: minimalism and stillness. *Still as a mannequin.* Imperfection as evidence of use, of a tool and of a hand. Never as decoration.

Most people will first see the site from his Instagram bio, inside Instagram's in-app browser, on a phone. Design for that visitor first.

---

## 2. The idea

**A garment, worn.**

The site is a piece of cloth. The home page is a woven surface, and it wears where people touch it. Where a pointer rubs, threads loosen, then open, then go, exactly as his Dremel does to the backpack. Through the holes you see what is under the cloth: the picture itself as the broken camera saw it, smeared and magenta, tearing more the faster the hand moves over it. Holes do not stay holes. After a while a running stitch is sewn across each one and it is patched with a scrap of another piece. A visitor can pick up the needle and sew too. The wear and the mends are kept in the visitor's browser, so someone who returns finds the site as they left it, mended while they were away. Nobody's copy of the site is the same, and none of them is new. The browser tab shows the same wear: the icon frays, the title's letters come loose and are sewn back.

Everything else is plain. A list of the work, a page per piece, his line, an email address. Ink on unbleached cloth, one typeface, and the only kind of line on the site is a running stitch.

Nothing explains any of this. A stitch is already being sewn when the page loads, and the first touch wears the cloth. That is the whole instruction. Between touches the site is still, because he is.

Later, if he scans his workspace with his phone, there is a room you are carried through (§10). It is not part of launch.

---

## 3. Shape of the work

| | what | ships when |
|---|---|---|
| **Gate 0** | The broken-camera shader on one of his photographs, shown to a human and approved. Go / no-go for the whole direction. | before anything else |
| **Phase 1** | The pages, the cloth (stages A–D), the tab, sewing by hand. **This is launch.** | when §8's checks pass |
| **Phase 2** | The room: a walk through a splat scan of his workspace. | only once he has made a scan |
| **Phase 2b** | Physics in the room. | only if Phase 2 exists and it adds wear, not spectacle |
| **Phase 3** | Shared wear: one garment everyone wears. | only after he decides he wants it |

Gate 0 is the one piece of this that could fail, so it is proved first and in isolation: a page with one photograph and the shader, parameters on sliders, nothing else. If the smear looks like an Instagram filter rather than like his camera, stop and say so. Nothing downstream can rescue it.

---

## 4. Rules

Every decision below follows from these. Where this brief is silent, these decide.

1. **Imperfection is a record, not a style.** Every irregularity on the site must have a cause you can name: a hand passed here, a thread let go, a Dremel, a broken sensor, a phone camera, an image that has not finished loading, a scan the phone could not resolve. If you cannot name the cause, do not add the irregularity. No random rotation, no jittered text, no grunge textures, no "hand-drawn" fonts, no noise overlays, no glitch-on-a-timer. Visible mending is precise work that shows its hand. So is this site.
2. **Nothing is larger than the work.** No type above 20px. The largest thing on any page is a photograph or the cloth.
3. **There are no solid lines.** Every rule, border and divider is a running stitch: `1px dashed`. Browsers draw dashes differently from one another. Accept it, and write down that you accepted it.
4. **One typeface, one ink, one signal.** The signal colour appears in exactly three places sitewide: the current item in the navigation, the focus ring, and a stitch at the moment it is being sewn. Nowhere else.
5. **No instructional text.** Nothing says "move your cursor", "scroll", "click to", "use WASD". If an interaction needs a caption, it is not working.
6. **The photographs are not treated.** No filters, no forced aspect ratios, no rounded corners, no shadows, no hover zoom, no overlays, no text on top of them. What the phone saw is what the page shows. The broken-camera shader is never applied to a photograph on a work page; it exists only under the cloth and in the room.
7. **Only the cloth moves, and the tab records it.** No scroll-triggered animation, no page transitions, no parallax, no cursor followers, no staggered reveals. Hover changes colour and nothing else, in 120ms. The cursor is the browser's own, except while a stitch is being sewn by hand (§6).
8. **Every fallback is a composition.** No JavaScript, no WebGL, a weak device, data saving, reduced motion, Instagram's in-app browser: each produces a finished page, not a stripped one.
9. **Nothing is invented.** No copy, bios, claims, clients, press, awards, taglines. Prose is his, from the content folder, or is a visible placeholder (§0). The only phrases on the site that are not in the content folder are his handle and his bio line, quoted exactly.
10. **Say why.** Comments explain decisions, not syntax. `DECISIONS.md` explains the site.

---

## 5. Pages and content

### Routes

```
/                 the cloth
/work             index of pieces
/work/[slug]      one piece
/about            his line, and how to reach him
/room             Phase 2 only; the route does not exist until the scan does
404               a seam that was not finished
```

**Navigation** is one line of small mono text at the top left of every page: `(mqn)   work   about`, and `room` once it exists. The mark links home. The current item carries a short dashed underline in the signal colour (rule 4). No hamburger, no fixed header, no logo; the line scrolls with the page. On the home page it sits on the cloth.

**The label** is the footer: the piece of cloth sewn inside a garment that says what it is. On every page, one mono line at the bottom: `[EMAIL]   @icraveimperfection   [CITY] HH:MM`. The time is the local time where he is, filled in by a few lines of JavaScript once a minute and absent entirely without it; it is how the site says where he is without saying "based in". The email and handle are real links with 44px targets, each with an inline SVG line icon (envelope, camera), stroke only, 1.4px, no icon library. On the home page the label carries one more word, `wash`, which resets the wear (§6). It is a link like the others and it is not explained.

### Content folder

Everything he will ever edit lives in `content/` and `public/work/`. Nothing under `src/` contains a sentence of copy.

```
content/
  site.ts                 brand, mark, handles, email, city, time zone, domain, the line,
                          which photograph the cloth carries, the optional [PHRASE]
  about.md                the About text; frontmatter: title, summary
  work/
    001-backpack.md       one file per piece, numbered
    002-….md
  room/
    workspace.spz         Phase 2 only: his scan, in whatever format his capture app exports
public/work/
  001-backpack/01.jpg …   the piece's photographs, numbered in the order they show
```

Piece frontmatter:

```yaml
title: Dremeled backpack           # the piece, plainly, in his words
number: "001"                      # three digits; the folder shares it
year: 2026
kind: made | mended                # a new object, or a repair of one that existed
materials: [reclaimed denim, cotton canvas, cotton thread]
tools: [dremel, needle]            # optional
owner: kept | worn | given | sold  # optional: where the piece is now
hours: 40                          # optional
camera: phone | broken             # which camera took the photographs; default phone
cover: 01.jpg                      # the photograph that leads, and the OG image
photos:
  - file: 01.jpg
    alt: A canvas backpack on a table, its front re-faced with layers of blue and grey denim frayed open between rows of white running stitch.
  - file: 02.jpg
    alt: …
---
A paragraph or two in his words. For a repair: what had failed and what was done.
Plain paragraphs, no headings, links as bare URLs.
```

Parse frontmatter with `gray-matter` and render the body with `marked`. Both run at build time and ship no client code, which is why they are allowed.

Image dimensions are read at build with `sharp` (already a dependency of Next) so `next/image` always has width and height and nothing shifts. `alt` is required for every photograph and the build fails without it. Write the first drafts yourself by **looking at each image** and describing what is visibly there: the garment, the material, where it is, the light, and for the broken-camera photographs, that the image is smeared and which way. Never what you assume. A reviewer will open the image next to your sentence.

Ship with the content that exists, as placeholders marked per §0, and list every placeholder in the README under "To confirm".

### `/` — the cloth

One viewport. Nothing below the fold. It does not scroll.

- The cloth fills the viewport behind everything (§6).
- Top left: the nav line. Below it, after a space, `mannequin` in mono at 13px, tracked. Below that, `manipulating fabric, still as a mannequin` at body size. Both sit on plain cloth.
- Bottom: the label.
- A woven photograph (`site.ts` → `cloth.photo`) occupies a region of the cloth about 38% of the viewport width, left edge near 55%, top near 22%: off-axis, like a pocket. Under 40rem it is 72% wide, bottom right, above the label. Text never overlaps it.

### `/work` — index

A spec sheet. An ordered list where each row is a grid: `number · title · materials · year`. Rows are separated by stitched rules (rule 3). Mono throughout, figures tabular. On narrow screens a row becomes two lines: number and title, then materials and year in muted ink. The whole row is the link; the title is underlined on hover. No thumbnails: the list is the index and the photographs are on the piece. Newest first.

### `/work/[slug]` — one piece

From the top: nav; the number and title on one line, the title in italic (the only italic on the site); a stitched rule; the spec as a definition list, two columns on wide screens (`kind`, `materials`, `tools`, `year`, `owner`, `hours`, `camera`, omitting what is absent rather than printing a dash); the body text at reading measure; then the photographs, each full column width in their native aspect ratio, stacked with one `--gap` of cloth between them, the first eager and the rest lazy, with `sizes` that match the layout. Under the last photograph, a stitched rule and two links, previous piece and next piece, by number. Then the label.

The loading placeholder is not a blur. It is the image itself at 16px wide, scaled up with `image-rendering: pixelated`, placed behind the real image. A blur pretends to a smoothness the file does not have; a pixelated thumbnail is the truth about a small image. Next's built-in blur placeholder applies a CSS blur; do not use it. The swap is instant; no fade.

### `/about`

The About text at `--t-lead`, maximum `--measure`, then the label. The label is the contact; there is no contact page. His personal handle `@sammypandolfi` appears here, once, in the label's style, if he wants it. If he takes repairs by arrangement, that is one sentence in `about.md`, written by him, not by you.

### 404

The nav; the words `nothing here` at body size; under them a stitched rule that stops a third of the way across the page, a seam that was not finished; a link home. No illustration.

---

## 6. Visual system

All values live in `src/styles/tokens.css`. Nothing else in the project writes a colour, a size, a duration or an easing. `src/styles/base.css` holds the reset, the typographic primitives (`.print` for mono labels, `.prose`, `.seam` for a stitched rule, `.tap` for inline touch targets, `.sr` for visually hidden text), focus, selection and reduced motion. Components use CSS Modules and read tokens.

### Colour

Sampled from the work. Starting values; verify every ratio with a WCAG formula and write the real number into the file before using the colour.

```css
:root {
  /* Unbleached cotton. The ground of every page. */
  --cloth:     #e9e4d8;

  /* Indigo-black. The only text colour at full strength. ~14:1 on --cloth. */
  --ink:       #16181d;

  /* Washed denim. Metadata, muted rows, the label. ~4.7:1 on --cloth, which is
     the floor for text — do not darken --cloth without rechecking this. */
  --ink-muted: #5f6470;

  /* Thread. The colour of every stitch sewn on the cloth. */
  --thread:    #f6f2e8;

  /* The stitch colour of every rule on the pages. */
  --stitch:    var(--ink);

  /* Signal: the magenta the broken camera leaves. ~3.7:1 on --cloth — enough
     for a ring and a mark, never for text. Three uses only (rule 4). */
  --signal:    #d4219a;

  /* What shows through a hole: the broken camera's picture, cast toward this. */
  --raw-cast:  #ff5fd0;
}
```

There is no dark mode. A garment does not have one. Set `color-scheme: light`, and `theme-color` to the literal value of `--cloth` with a comment tying them together. The room (§10) is whatever colour his scan is.

### Type

One family: **IBM Plex Mono**, weight 400 in upright and italic, loaded with `next/font/google`, which downloads at build and self-hosts so a visitor's browser never contacts Google. Nothing else is loaded. Clean letters are the point: on this site the imperfection is in the cloth, not in the type (rule 1).

```css
  --t-print: 0.6875rem;                                 /* 11px  nav, label, spec keys, numbers */
  --t-mark:  0.8125rem;                                 /* 13px  the name */
  --t-body:  clamp(0.9375rem, 0.9rem + 0.2vw, 1rem);    /* 15 → 16px */
  --t-lead:  clamp(1rem, 0.95rem + 0.3vw, 1.125rem);    /* 16 → 18px, About only */
  --track-print: 0.08em;
  --lh-body:  1.6;
  --lh-print: 1.4;
  --measure:  60ch;
```

Everything is lowercase, as he writes. Labels (`.print`) are tracked slightly; prose is not. No bold anywhere: the weight is not loaded and `font-synthesis: none` stops the browser faking it, so reset heading weights. Tabular figures everywhere. `text-wrap: pretty` on prose, rag left, never justified, `hyphens: manual`.

### Space and layout

```css
  --edge: clamp(1rem, 3vw, 2rem);        /* page margin, all four sides */
  --gap:  clamp(1.25rem, 2.5vw, 2rem);   /* between blocks and photographs */
```

Pages are a single column: `--measure` for prose, full width for the index and the photographs, `--edge` on every side. The spec sheet and definition lists use a two-column grid, `10rem 1fr`, collapsing to one column under 40rem. The grid is quiet: nothing draws it, only stitched rules where sections meet.

### Stitches

```css
.seam { border-top: 1px dashed var(--stitch); }
```

That is the whole ornament system. Use it for every divider. The navigation's current mark is a `2px dashed var(--signal)` text underline, offset 0.35em. Record in `DECISIONS.md` that per-browser dash rendering differs and that this is accepted.

### Motion

```css
  --dur-quick: 120ms;
  --ease-out:  cubic-bezier(0.2, 0.6, 0.2, 1);
```

Those are the only transitions outside the cloth: colour on links and the navigation. Under `prefers-reduced-motion: reduce`, transitions go to 1ms and the cloth draws one frame (§6).

### Focus

`:focus-visible { outline: 1px solid var(--signal); outline-offset: 3px; }`, never removed. A skip link to `#main`. Every link and button is at least 44px tall, met by padding rather than by a visible box (`.tap` grows an inline link's hit area with padding and absorbs it with negative margin so the line box does not move).

---

## 7. The cloth — Three.js

### What Three.js is for here

Not a 3D scene. No model, no orbit controls, no lights, no bloom, no post-processing chain, no particles. Three.js is used as a loom: one orthographic camera, one plane, shaders you write, a pair of render targets, and a texture pipeline. Its render-target and texture plumbing is what you are paying for; everything visible is GLSL. If you find yourself importing from `three/examples` or reaching for `@react-three/*`, stop. WebGL2 only: the first visitor is in Instagram's in-app browser on an iPhone, and WebGPU is not a thing you can count on there.

Import named exports from `'three'` only, in one client component, loaded with `next/dynamic` and `ssr: false`, in its own chunk, on `/` only. Shaders are exported template strings in `shaders.ts`; no loader configuration.

### Gate 0: the broken camera

Before anything else, a throwaway page (`/_gate`, deleted before launch) with one of his photographs and the shader below, parameters on `<input type=range>` sliders, and a velocity slider standing in for the hand. A human looks at it next to his broken-camera photographs and says yes or no.

The shader: the photograph is sampled with each row of pixels displaced horizontally by a per-row offset. The offset is zero for most rows and large across runs of rows: sample a 1D noise by row, threshold it, and scale the run so a tear is tens of rows tall, not one. Inside a tear, rows also bleed downward: a fraction of each row is the row above it, repeated, so the picture stretches as if the sensor stalled. The red channel is read two rows down and the green two rows up, so the fringe goes magenta; the result is pushed 25% toward `--raw-cast`. Amplitude (how far rows move), tear density (how many runs) and bleed (how much the rows stretch) all scale with a single `velocity` uniform, 0 to 1. At 0 the picture is almost clean. At 1 it tears the way his skylines do. Nothing animates on its own: with the velocity held, the image is still.

Build it so that a reviewer can match it against three of his images and name what is wrong. Record in `DECISIONS.md` which of his photographs it was approved against. If it does not pass, stop and report; do not proceed to pages.

### Two layers, always

1. **The still.** In the server-rendered HTML: a container with a CSS weave (the `--cloth` ground plus two `repeating-linear-gradient`s at 0° and 90°, 1px lines of 4% ink at the thread pitch, a faint grid of cloth) and the photograph as an `<img>` with proper alt text, positioned exactly where the woven region will be. This is what no-JS, no-WebGL, data-saving, weak and reduced-motion visitors get, and it is a finished page.
2. **The canvas**, `aria-hidden`, fading in over the still in 600ms once it has proved itself (gating below). The still stays underneath. Nothing is removed.

### Rendering the weave

One fullscreen plane, `ShaderMaterial`, fragment shader:

- **Threads.** Thread pitch `p` in CSS px: 6 above 60rem, 5 down to 40rem, 4 below. Warp index `floor(x / p)`, weft index `floor(y / p)`. A 3/1 twill decides which is on top: `(warp + weft) mod 4 < 3` → warp. Each thread has a rounded cross-profile (brightness falls about 18% toward its edges) and the thread underneath is darkened a further 10% where it dips. That shading alone makes the surface read as cloth.
- **Irregularity with a cause.** From a hash of its index, each thread gets a width within ±8% of pitch and a slub (1.5× width over 3–4 pitches) at one or two positions along its length. That is how spun cotton behaves. Nothing else varies.
- **Colour.** Plain cloth is `--cloth` under the thread shading. Inside the woven region, the photograph is sampled at full resolution and multiplied by the same shading: the picture is printed on the threads and the twill shows through it. Warp threads are 4% cooler and weft 4% warmer, as in denim, which is enough to make the weave legible at arm's length without breaking the image. Do not quantise the photograph to thread pitch; it must stay recognisable on a phone.
- **Output.** `antialias: false`. Device pixel ratio capped at 1.5. Ordered dither under one code value before output, so the flat cloth does not band.

### Wear

A single-channel **wear map** at a quarter of canvas resolution, ping-ponged between two `WebGLRenderTarget`s. Each frame with pointer movement, a soft brush of radius 22 CSS px adds wear along the segment the pointer travelled since the last frame, with strength proportional to **distance moved**, never to time. Rubbing wears; resting does not. A hand held still adds nothing. Wear never decays on its own. This is the Dremel: abrasion, by a hand, where the hand went.

The weave shader reads the wear map and does three things, in order, as wear rises:

| wear | what happens |
|---|---|
| 0.15 – 0.5 | threads **loosen**: width shrinks toward 55% of pitch, each thread shifts sideways by up to 0.3p from its hash, the print desaturates 30% as fibres pull free |
| 0.5 – 0.8 | the weave **opens**: weft threads go first, as they do on real denim; warp remains as bare parallel lines over whatever is beneath |
| > 0.8 | a **hole**: nothing remains, and what is beneath shows through |

Beneath the cloth, everywhere, is **the broken camera's picture**: the same photograph stretched to cover the viewport, drawn through the Gate 0 shader. Its `velocity` uniform is the pointer's speed over the last second, smoothed, normalised so that a brisk rub is 1. Rub fast and the picture under the holes tears magenta; stop, and over a second it settles almost clean. The camera is broken in the same way his is: it cannot hold a moving thing still.

The regions behind the nav, the name, the line and the label **do not wear**: a label sewn into a garment keeps its own surface. Pass their rectangles as a static mask the brush is multiplied by. Text therefore always sits on intact cloth at full contrast.

On touch devices the cloth has `touch-action: pinch-zoom`: a finger dragged across it wears it, and pinch-zoom is never taken away. The home page does not scroll, so nothing is lost. The zone where thumbs rest will wear first on most phones. That is correct.

### Mending by the site

A **mend map** and a short list of **mends** in JavaScript. How you encode the map is yours; the shader needs to know, per pixel, whether it is inside a patch, which patch, and whether a stitch crosses it. Drawing patches and stitches onto a 2D canvas and uploading it as a `CanvasTexture` is the simplest route and the result is identical.

A mend is triggered for a connected area of hole (wear > 0.8, found by a flood fill over the downsampled map, run at most once a second) once the pointer has been outside its bounding box for 8 seconds. The mend covers that box plus one pitch of margin and consists of:

- **A patch.** Inside the mend, the broken camera's picture is replaced by a scrap of a *different* piece's cover photograph, chosen by a hash of the mend's position so it is stable across reloads, scaled so that roughly 300 source pixels span the patch, and woven with the same twill as the ground. It is cloth, not a hole.
- **Stitches.** Rows of running stitch across the patch, perpendicular to its long axis, rows one pitch apart starting half a pitch in from the edge. Each stitch is 4 pitches long with a 2-pitch gap. Each stitch's length varies ±12% and its row position ±0.15p from a hash: a hand, not a machine. Stitches are `--thread`, 1.2px wide.
- **Sewing.** Stitches appear one at a time at six per second, across the patch and back, the stitch currently being sewn in `--signal` for the 160ms it takes to appear, then settling to `--thread`. That is rule 4's third use. Pending mends are sewn one after another, never two at once.
- **Pucker.** A mend pulls the cloth. In the weave shader, offset the thread coordinates by the gradient of a blurred mend coverage, scaled to at most 0.6p, so thread lines bend toward a mend within three or four pitches of its edge. This is the detail that makes it a mend and not a sticker. Build it last; it is the first thing to cut if the frame budget is tight.

Once mended, an area's wear resets to zero and it can wear again. A mend can be mended. Patches on patches are correct.

### Sewing by hand

A visitor can mend too. Pressing the button and dragging lays a running stitch along the path: 4 pitches of thread, 2 of gap, the same ±12% and ±0.15p of hand in it, in `--thread`, each stitch appearing as the pointer passes its end. On touch, pressing and holding for 300ms and then dragging sews; a plain drag wears. Where a hand-sewn stitch crosses a hole, the hole is patched under it with the same hash-chosen scrap, so a visitor's stitches hold a patch the way his do. Stitches over intact cloth are simply stitches; sashiko decorates whole cloth too.

While the button is down, and only then, the cursor is a needle: a 24px inline SVG, one 1px stroke, eye at the top, hotspot at the point, set with `cursor: url(...) 2 22, crosshair` on the cloth's `:active` state. It has a cause: you picked up the needle. When the button comes up, the cursor is the browser's again. There is no trail; the stitches are not a trail, they are stitches, and they stay.

Hand stitches persist with the other mends, marked `hand`. They are never synced to anyone else (§11).

### Persistence

`localStorage`, key `cloth.v1`:

```ts
{
  wear:  string;   // base64 of the Uint8 wear map, stored at 128 × 96, normalised to the viewport
  mends: Array<{ kind: 'site' | 'hand'; x: number; y: number; w: number; h: number; patch: string; path?: number[] }>;
  visits: number;
  at: number;
}
```

Written at most once every 2 seconds and on `visibilitychange` to hidden. On load, the saved map is re-projected to the current viewport and uploaded before the first frame. Any hole that was unmended when the visitor left is mended during the first seconds of the visit: the site was repaired while they were away. Under reduced motion those mends are already complete in the single frame. Instagram's in-app browser may not keep storage between sessions; accept that and do nothing about it.

`wash` in the label clears the key and re-uploads an empty map. The cloth is new. Nothing confirms it.

### The opening

A garment wears even in the drawer. On every load, before any input, one small spot (radius about 30 CSS px, position chosen from a hash of the visit count so it moves each time) is already worn to a hole when the canvas fades in, and is then mended as described, taking about 3 seconds. That is the only thing that moves on an untouched page, and it is the site's entire explanation of itself. After fifty visits there are fifty small mends. After the opening, the cloth is still until touched. There is no ambient motion, no breathing, no drift. *Still as a mannequin.*

### Gating and degradation, in stages

- The canvas does not start until `load` and then `requestIdleCallback`.
- It refuses to start on `navigator.connection.saveData`, `deviceMemory < 4`, `hardwareConcurrency < 4`, or when WebGL2 is unavailable. Under `prefers-reduced-motion: reduce` it draws exactly one frame, with the saved wear and completed mends, and never starts a loop.
- After starting it samples 40 frames. If the mean exceeds 22ms it halves the render-target resolution once; if still over, it removes itself and the still remains. It pauses on `visibilitychange` and tears down on `webglcontextlost`.
- Resize recreates the targets and re-projects the saved map. Nothing is lost on rotation.

### Build it in stages, and commit each

- **A.** The weave: plain cloth and the woven photograph, still. This ships on its own.
- **B.** Wear: brush, map, loosen / open / hole, the broken camera beneath with velocity. Ships on its own.
- **C.** Mending by the site: patches, stitches, sewing, persistence, `wash`, the opening.
- **D.** Sewing by hand, the needle, then pucker, then the tuning pass: thread pitch per viewport, brush radius, thresholds, by eye at 390px and 1440px, and once inside Instagram's in-app browser on a real phone.

Acceptance for the whole: a photograph of a garment stays recognisable through the weave on a phone; rubbing one spot for two seconds opens a hole; rubbing fast tears the picture beneath and stopping settles it; holding still adds nothing; leaving the hole for eight seconds gets it mended with a stitch that visibly runs across it; dragging with the button down lays stitches and the cursor is a needle only while it does; reloading shows the same wear and stitches; `wash` clears it; WebGL disabled in the browser shows a finished page with no console errors; reduced motion shows a single, complete frame.

---

## 8. The tab

The browser tab is part of the garment: the little woven tag at the collar. It reports the cloth's state and does nothing on its own. None of this runs under reduced motion, none of it changes more than once every 5 seconds, and all of it is absent without JavaScript, where a static `favicon.svg` of an intact swatch and the plain title remain.

- **The icon** is the cloth. A 32×32 canvas renders a plain woven swatch from the same twill rules, worn wherever the real cloth is worn (sample the 128×96 map down) and stitched wherever it is mended, and is set as the favicon through a data URL. A visitor who has rubbed the home page to holes has a frayed tab. After `wash` it is whole.
- **The title** is his handle as a sentence: `i crave imperfection`, followed on inner pages by ` · work`, ` · about`, or the piece's title. Each letter of the phrase has a hash threshold between 0.05 and 0.6. When the fraction of the cloth that is loosened or worse passes a letter's threshold, that letter comes loose and is replaced by a space: `i crave imperfecti n`. Letters never turn into other letters; a stitch that lets go leaves a gap, not a different stitch. Because the title is derived from the current map, a mend brings letters back. The space is kept so the words do not close up.
- **When the tab is hidden**, and only if `[PHRASE]` has been given, the title becomes that phrase; when the tab is shown again, the title returns. Without a phrase the title does not change on hide.

The tab is a desktop thing. Instagram's in-app browser shows neither icon nor title, and that is fine.

---

## 9. Technical decisions

- **Next 16.4, App Router, TypeScript, `src/` directory, no Tailwind**, scaffolded with `create-next-app --empty`. The generated `AGENTS.md` is authoritative on Next's current APIs; read the docs it points at before writing a route. Commit `AGENTS.md`, since `next dev` recreates it otherwise.
- **Fully static.** Every route must prerender. The scaffold enables `cacheComponents`; either mark content-loading functions and pages with `'use cache'` so they prerender, or set `cacheComponents: false`. The acceptance test is the route table printed by `next build`: every route static, `generateStaticParams` for `/work/[slug]`, nothing dynamic. Phase 3 is the only thing that ever adds a server route.
- **Server Components everywhere.** The client components are the cloth, the clock in the label, the tab, and in Phase 2 the room. The work and about pages ship no component JavaScript of their own.
- **Styling:** CSS Modules plus `tokens.css` and `base.css`, imported once in the root layout. No CSS-in-JS, no utility framework, no `style=` attributes except for values that genuinely come from data, such as an image's aspect ratio.
- **Dependencies, the complete list for Phase 1:** `next`, `react`, `react-dom`, `three`, `@types/three` (three ships no types of its own), `gray-matter`, `marked`, `sharp`. Dev: `typescript`, `eslint`, `eslint-config-next`, `@types/*`. Nothing else. Phase 2 may add one splat renderer (§10). Phase 2b may add `@dimforge/rapier3d-compat`. Phase 3 may add one KV client (§11). In particular, never: Tailwind, framer-motion, GSAP, Lenis, `@react-three/fiber`, `drei`, `postprocessing`, any icon set, any component library, any analytics.
- **Images:** `next/image`, local files only, AVIF then WebP, `sizes` written to match each layout, `priority` only on the first photograph of a piece and the cloth's still. Never `unoptimized`.
- **Metadata:** `generateMetadata` per route, titles per §8, canonical URLs from `[DOMAIN]`, `app/sitemap.ts`, `app/robots.ts`, an `opengraph-image` per piece built with `ImageResponse` from the cover photograph and the number, and a JSON-LD `Person` on `/about` using only what is in `site.ts`.
- **Headers:** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera, microphone and geolocation. Vercel already serves `/_next/static` as immutable; add no caching headers of your own.
- **Budgets:** on `/`, HTML plus CSS under 30kB gzipped, and the cloth chunk (three plus shaders) under 170kB gzipped, loaded after idle; on every other route, no JavaScript beyond the framework runtime; fonts under 70kB total; LCP under 2.0s on a throttled 4G profile; CLS 0; Lighthouse mobile 95 or better on every route in Performance, Accessibility and Best Practices. If a budget cannot be met, report the number rather than quietly cutting the mend.
- **Scripts:** `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `verify` (`typecheck && lint && build`). `verify` runs before every commit.
- **Deployment:** Vercel, through the GitHub integration. Pushing to `main` is the deploy; every pull request gets a preview URL. No `vercel.json`. No environment variables exist until Phase 3.

---

## 10. Phase 2 — the room

**Precondition: a scan he made himself.** He captures his workspace with his phone (Polycam, Scaniverse, Luma or whatever he has) and exports a Gaussian-splat file. Until `content/room/` holds one, `/room` does not exist, the nav has three words, and nothing in this section is built. Do not fake a scan, do not scan something else, do not build the route against a sample file.

**Why it belongs.** A phone scan of a real room is a broken camera in three dimensions: floaters where the phone guessed, holes where it could not see, edges that smear. The artefacts are kept. Nothing is cleaned up in a 3D editor. The room is his pieces where they actually live, with the imperfection of having been looked at by a machine that could not quite see.

**Rendering.** A splat renderer that plugs into three.js and runs on WebGL2: `@sparkjsdev/spark` or equivalent; confirm its current version, licence and whether it streams by level of detail before choosing. The room is its own route, its own client component and its own chunk; nothing it loads is shared with `/`. The splat file is kept under 25MB and streamed; the full file is never required before the room is usable.

**You are carried.** Nobody drives. The camera moves along a loop through the room at walking pace, starting the moment the room is ready. The pointer looks: moving it turns the head, within a cone, and it comes back to centre. On touch, dragging looks. If arrow keys or WASD are pressed the loop stops and the keys walk; nothing says so (rule 5), and the loop resumes after ten seconds of no input. There is no mini-map, no crosshair, no HUD.

**The broken camera, again.** The Gate 0 shader is the room's only post-pass, with `velocity` driven by the camera's angular and linear speed. Turn your head fast and the room tears magenta. Stand still and it is almost clean. Still as a mannequin.

**His pieces in the room.** Each piece whose photographs were taken in this room stands where it was photographed, as a flat print on a thin stand: a plane with the cover photograph, its real aspect ratio, about 40cm tall in the scan's scale. Walking up to it and clicking or tapping goes to `/work/[slug]` as a hard cut. No glow, no label in space, no hover state beyond the browser's pointer cursor.

**Hard cuts.** `/room` renders a still first: a photograph he takes on his phone of the same room, the nav, the label. When the splat's first level has loaded and the renderer has held 40 frames under 22ms, the still is replaced by the live room in one frame, no fade. If the renderer fails the gate, the still stays and it is a finished page. Under reduced motion, data saving, weak device or no WebGL2, the still is the page.

**Phase 2b, physics, only if there is a reason.** If, and only if, knocking a print over would read as wear rather than spectacle, add `@dimforge/rapier3d-compat`: the prints can be pushed and fall, and stay fallen for that visitor (persisted like wear). Nothing else in the room is physical. If the honest answer is that it would be a toy, write that in `DECISIONS.md` and do not build it.

---

## 11. Phase 3 — one garment, worn by everyone

Only after he decides he wants it. The question for him: should the cloth on his home page be worn by every visitor together, so that the site visibly wears down the more people look at it, and is mended for everyone while nobody is there?

If yes: a KV store on Vercel (Vercel Marketplace: Upstash Redis or Vercel KV), two route handlers, no other server. Every client posts its wear map delta at most every 10 seconds; the server merges by taking the maximum per cell and the client re-downloads the merged map on load and every 60 seconds. Mends made by the site are appended by the server when it mends (a scheduled function runs the same flood fill once an hour and mends anything that has been a hole for an hour). **Hand stitches are never shared**: a visitor's stitches can draw anything, and a shared surface with drawing on it is a moderation problem this site does not want. Shared state is wear and site-mends only. Rate-limit writes per IP. `wash` washes only your own view of the shared cloth for the session; the shared garment is never washed.

If no: `DECISIONS.md` records that it was considered and declined, and why.

---

## 12. Process

Work in this order, committing after each step with a one-line message in the imperative that says what changed and, where it is not obvious, why:

0. **Gate 0** (§7). The shader on one of his photographs, with sliders, shown to a human. Go or stop.
1. `DECISIONS.md`: the idea and the rules from §2 and §4 in your own words, extended as you decide things. Record which photographs Gate 0 was approved against.
2. `tokens.css`, `base.css`, the font. Verify the contrast numbers and write them in.
3. Root layout: nav, main, label, skip link, metadata, headers. The 404.
4. Content loading: `site.ts`, frontmatter parsing, image dimensions, alt enforcement. Placeholder pieces from the photographs you have, with alt text written from the images.
5. `/work`, `/work/[slug]`, `/about`, all static, confirmed in the build table. **Deployable from here.**
6. The still cloth on `/`.
7. The cloth, stages A to D, each its own commit.
8. The tab (§8).
9. Sitemap, robots, OG images, JSON-LD. Delete `/_gate`.
10. README for him: how to add a piece, how to change the cloth's photograph, how to edit About, how to add a scan when he has one, that pushing to `main` is the deploy, and the "To confirm" list.
11. Phases 2, 2b and 3 only when their preconditions in §3 are met, each as its own branch and pull request.

Before claiming anything is done, you have personally confirmed rather than assumed: `npm run verify` passes; every route is static in the build output; the site reads correctly at 360, 390, 768 and 1440px; with JavaScript disabled; with WebGL disabled; with reduced motion on; keyboard only, with the focus ring visible on every interactive element; no console errors or warnings; no layout shift on any page; every photograph's alt text matches it; every text colour meets 4.5:1; the persistence, sewing and `wash` behaviour in §7; the tab in §8; the budgets in §9. If you cannot verify something, say so by name in your final report rather than implying it.

Your final report lists: what was built; what was verified and how; what was not verified; every `[placeholder]` still in the content; and every decision you made that this brief did not.

---

## 13. Do not

These are the defaults you will reach for. None of them belongs here.

- A hero: large heading, subheading, buttons. The home page has a word at 13px and his sentence.
- Cards, rounded corners, shadows, gradients, glass, any border that is not dashed.
- Scroll-triggered fades, slides, staggers, parallax, smooth-scroll libraries, cursor trails, custom cursors other than the needle while sewing, magnetic buttons.
- Hover effects on images, image overlays, lightboxes, carousels, thumbnails on the index.
- Fake imperfection: grunge, paper and noise textures, torn-paper edges, random rotations, jittered or "hand-drawn" type, distressed fonts, stamps, tape, glitch effects on a timer, the broken-camera shader anywhere a hand or a camera is not moving.
- Display type, marquees, text as decoration, uppercase, Inter, Space Grotesk, Syne, Helvetica, any second typeface.
- Dark mode, theme toggles, cookie banners, analytics, chat widgets, newsletter forms, share buttons.
- Three.js clichés: floating blobs, particle fields, orbit controls, glossy PBR, spinning models, bloom, post-processing stacks, "liquid" hover distortion on images, shader backgrounds that move on their own, a 3D world on the home page.
- WebGPU, `three/webgpu`, TSL. The first visitor is in Instagram's browser on a phone.
- A room without his scan. A scan cleaned up to look good.
- Lorem ipsum, invented bios, testimonials, press logos, client lists, "about the artist" prose you wrote, any phrase of his used as copy without him choosing it.
- Emoji, icon libraries, loading spinners, skeleton screens, toasts, "back to top" buttons, a HUD in the room.
- Explaining the cloth, the needle, the tab or the room anywhere on the site. If someone has to be told, it has failed.
