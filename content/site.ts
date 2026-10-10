/*
  Site-wide facts. Everything here is his, or is a placeholder in square
  brackets that the pages render in the signal colour until he confirms it.
  Change a value once here and it changes everywhere.
*/

export const site = {
  /* As he writes them. Lowercase, exactly. */
  brand: 'mannequin',
  mark: '(mqn)',
  handle: 'icraveimperfection',
  /* His personal handle, shown once on /about. */
  personalHandle: 'sammypandolfi',
  /* His bio, in full. */
  line: 'manipulating fabric, still as a mannequin',
  /* The tab title is his handle as a sentence. */
  phrase: 'i crave imperfection',

  /* Unconfirmed. Square brackets make these render as defects. */
  email: '[email]',
  city: '[city]',
  /* The skylines in his photographs are New York. Confirm. */
  timeZone: 'America/New_York',
  /*
    The live address. Drives canonical URLs, the sitemap and link previews.
    Vercel assigns <project>.vercel.app until a domain is attached; replace
    this with the real domain when there is one.
  */
  url: 'https://pandolfi.vercel.app',

  /* Optional: a phrase of his for the tab title while the tab is hidden. */
  hiddenPhrase: null as string | null,

  /* The photograph the cloth on the home page carries. */
  cloth: { piece: '001-backpack', file: '01.jpg' },

  get instagramUrl() {
    return `https://instagram.com/${this.handle}`;
  },
  get personalUrl() {
    return `https://instagram.com/${this.personalHandle}`;
  },
} as const;

/** Top-left navigation. The mark links home; these follow it. */
export const nav = [
  { label: 'work', href: '/work', match: /^\/work/ },
  { label: 'about', href: '/about', match: /^\/about/ },
] as const;

/** True for a value he has not confirmed yet. */
export function isPlaceholder(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^\[.*\]$/.test(value.trim());
}
