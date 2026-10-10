/*
  WCAG 2 contrast ratios for the tokens, against --cloth.
  Run after touching any colour and write the results back into tokens.css.
*/
const cloth = '#e9e4d8';
const colours = { ink: '#16181d', 'ink-muted': '#5f6470', signal: '#d4219a', 'ink-muted (prefers-contrast)': '#3f434c', thread: '#f6f2e8' };

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };

for (const [name, hex] of Object.entries(colours)) console.log(`${name.padEnd(28)} ${hex}  ${ratio(hex, cloth).toFixed(2)}:1`);
