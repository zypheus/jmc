# School branding

`branding.css` is **not** stored in Git (per-school colors and fonts).

After clone or deploy:

```bash
cp public/branding/branding.css.example public/branding/branding.css
```

Edit `public/branding/branding.css` for your institution, or point `.env` at another file:

```env
BRANDING_CSS=branding/usm.css
```

## Typography

Set fonts in `branding.css` using these variables:

| Variable | Purpose |
|----------|---------|
| `--brand-font-family` | Body text, forms, buttons, tables |
| `--brand-font-family-heading` | Headings and school name (defaults to body font) |
| `--brand-font-family-mono` | Barcodes, code, monospace fields |

Default font is **Poppins** (loaded via `@import` at the bottom of `branding.css`).

To use a different font:

1. Change `--brand-font-family` (and heading/mono if needed).
2. Replace the `@import` lines with your font files (e.g. another folder under `public/vendor/fontsource`, or a Google Fonts URL).

`public/css/brand-typography.css` applies these tokens across staff pages, kiosk, OPAC, and legacy Blade screens.
