# i crave imperfection

[Open the website](https://dimerize.github.io/pandolfi/)

A single nighttime photograph. Swipe across the “Nothing lasts forever” sign to cut its fabric; the lit doorway opens [@icraveimperfection on Instagram](https://instagram.com/icraveimperfection). Reload to restore the sign. The photograph and doorway still work when WebGL is unavailable or reduced motion is enabled.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

## Publishing

Push to `main`. The **Publish website** GitHub Actions workflow runs type checking, linting, and a static production build before deploying to GitHub Pages. Its deployment summary contains the public URL.

The workflow reads the site's path and address from GitHub Pages, so a custom domain can be configured in the repository's Pages settings and followed by a fresh workflow run.

To verify the GitHub Pages build locally:

```sh
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/pandolfi NEXT_PUBLIC_SITE_URL=https://dimerize.github.io/pandolfi npm run verify
```

The exported site is written to `out/`. No server or private credentials are included in the deployed website.
