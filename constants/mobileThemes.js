export const DEFAULT_MOBILE_THEME_ID = 'classic';

export const MOBILE_THEMES = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Warm, refined and familiar — the current Jerur mobile experience.',
    icon: 'bi-stars',
    preview: ['#1B2340', '#D9A441', '#FCFBF7']
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Calm blues and fresh cyan accents for a clear, welcoming feel.',
    icon: 'bi-water',
    preview: ['#0369A1', '#06B6D4', '#F4FAFC']
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Natural greens and soft neutral surfaces inspired by growth.',
    icon: 'bi-tree',
    preview: ['#166534', '#84A98C', '#F7FAF5']
  },
  {
    id: 'royal',
    label: 'Royal',
    description: 'Rich indigo and violet tones with a confident premium character.',
    icon: 'bi-gem',
    preview: ['#5B21B6', '#A78BFA', '#F8F7FC']
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Warm rose accents balanced by light, graceful backgrounds.',
    icon: 'bi-flower1',
    preview: ['#BE185D', '#FDA4AF', '#FFF8FA']
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'A polished dark experience with violet and cyan highlights.',
    icon: 'bi-moon-stars',
    preview: ['#8B5CF6', '#22D3EE', '#111827']
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'A true dark appearance with teal highlights and elevated surfaces.',
    icon: 'bi-circle-half',
    preview: ['#08141A', '#18B7B2', '#17262D']
  }
];

export const MOBILE_THEME_IDS = MOBILE_THEMES.map((theme) => theme.id);

export function isValidMobileThemeId(themeId) {
  return typeof themeId === 'string' && MOBILE_THEME_IDS.includes(themeId);
}

export function resolveMobileThemeId(themeId) {
  return isValidMobileThemeId(themeId) ? themeId : DEFAULT_MOBILE_THEME_ID;
}
