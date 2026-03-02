/** Shared dark design tokens — imported by all screens & components */
export const D = {
  // Backgrounds
  bg: '#0e0f17',
  surface: '#161821',
  surfaceHi: '#1e2030',
  surfaceCard: '#1e2030',
  surfaceInput: '#1a1c2a',

  // Accent (primary)
  accent: '#7c8cff',
  accentSoft: 'rgba(124,140,255,0.12)',
  accentMed: 'rgba(124,140,255,0.2)',
  accentGlow: 'rgba(124,140,255,0.18)',
  accentGrad: ['#7c8cff', '#4e5bcc'] as const,

  // Accent2 (teal/green)
  accent2: '#38d9a9',
  accent2Soft: 'rgba(56,217,169,0.12)',

  // Purple
  purple: '#c084fc',
  purpleSoft: 'rgba(192,132,252,0.12)',

  // Success
  success: '#00c896',
  successGrad: ['#00c896', '#008f6b'] as const,

  // Warning
  warn: '#ffa94d',
  warnSoft: 'rgba(255,169,77,0.12)',
  warning: '#f5a623',

  // Danger
  danger: '#ff6b6b',
  dangerSoft: 'rgba(255,107,107,0.12)',

  // Text
  text: '#e8eaf6',
  textPrimary: '#ffffff',
  textSub: '#8b8fa8',
  textSecondary: '#a0a8cc',
  textMuted: '#555870',
  textPlaceholder: '#4a5070',

  // Border
  border: '#2a2d3e',
  borderHi: '#3d4160',
  borderFocus: '#7c8cff',

  // Toggle
  toggleBg: '#2a2d3e',

  // Gradients
  gradientHeader: ['#3d4fc7', '#6a3fa5'] as const,
  gradientAccent: ['#7c8cff', '#9b59d4'] as const,
  gradientSuccess: ['#38d9a9', '#20b087'] as const,

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
