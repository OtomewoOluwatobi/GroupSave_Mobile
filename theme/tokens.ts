/** Shared dark design tokens — imported by all screens & components */
export const D = {
  // Backgrounds
  bg: '#0e0f17',
  surface: '#161821',
  surfaceCard: '#1e2030',
  surfaceInput: '#1a1c2a',

  // Accent
  accent: '#7c8cff',
  accentSoft: '#4e5bcc',
  accentGlow: 'rgba(124,140,255,0.18)',
  accentGrad: ['#7c8cff', '#4e5bcc'] as string[],

  // Success / Warning / Danger
  success: '#00c896',
  successGrad: ['#00c896', '#008f6b'] as string[],
  warning: '#f5a623',
  danger: '#ff5c7c',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a8cc',
  textMuted: '#5c628a',
  textPlaceholder: '#4a5070',

  // Border
  border: '#252840',
  borderFocus: '#7c8cff',

  // Overlay / scrim
  overlay: 'rgba(14,15,23,0.85)',

  // Radius
  radius: 16,
  radiusSm: 10,
  radiusLg: 24,

  // Shadow helper (android elevation + iOS params)
  shadow: {
    shadowColor: '#7c8cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
