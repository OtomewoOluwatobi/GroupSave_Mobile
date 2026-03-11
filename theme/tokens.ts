/** GroupSave — Shared dark design tokens — imported by all screens & components */
export const D = {
  // ── Backgrounds ──────────────────────────────────────────────────────────────
  bg: '#000f2e',               // Root screen background
  surface: 'rgba(255,255,255,0.04)',// List items, section containers
  surfaceHi: 'rgba(0,20,60,0.90)',    // Elevated card / modal
  surfaceCard: 'rgba(0,20,60,0.90)',    // Card background
  surfaceInput: 'rgba(255,255,255,0.04)',// Text input background

  // ── Accent (primary brand) ────────────────────────────────────────────────────
  accent: '#CADCFC',              // Periwinkle — primary accent
  accentSoft: 'rgba(202,220,252,0.15)',// Subtle fills, badge tints
  accentMed: 'rgba(202,220,252,0.25)',// Step circles, focused borders
  accentGlow: 'rgba(202,220,252,0.18)',// Button glow, shadow
  accentGrad: ['#2a52a0', '#CADCFC'] as const, // Progress bar, primary btn gradient

  // ── Brand blues ───────────────────────────────────────────────────────────────
  primary: '#00246B',              // Deep Navy — on-accent text, icon bg
  primaryMid: '#1a3a7a',              // Dark Navy — hover / pressed states
  blueMid: '#2a52a0',              // Mid Blue — secondary elements, avatars
  accentLight: '#a8c4f8',             // Light Blue — chips, tag backgrounds

  // ── Backward-compat aliases (replace old purple / teal palette) ────────────────
  /** @deprecated use D.success — mapped to GroupSave success green */
  accent2: '#00c896',
  /** @deprecated use D.successGrad — mapped to GroupSave success soft */
  accent2Soft: 'rgba(0,200,150,0.12)',
  /** @deprecated use D.blueMid — mapped to GroupSave Mid Blue */
  purple: '#2a52a0',
  /** @deprecated use D.accentSoft — mapped to GroupSave Periwinkle soft */
  purpleSoft: 'rgba(202,220,252,0.15)',

  // ── Status — unchanged (accessible on dark bg) ───────────────────────────────
  success: '#00c896',
  successGrad: ['#00c896', '#008f6b'] as const,

  warn: '#ffa94d',
  warnSoft: 'rgba(255,169,77,0.12)',
  warning: '#f5a623',

  danger: '#ff6b6b',
  dangerSoft: 'rgba(255,107,107,0.12)',

  // ── Text ──────────────────────────────────────────────────────────────────────
  text: '#e8f0fd',                   // Primary text
  textPrimary: '#e8f0fd',
  textSub: 'rgba(232,240,253,0.45)',    // Subtitles, supporting text
  textSecondary: 'rgba(232,240,253,0.45)',
  textMuted: 'rgba(232,240,253,0.22)',    // Disabled, timestamps
  textPlaceholder: 'rgba(232,240,253,0.30)',    // Input placeholders

  // ── Borders ───────────────────────────────────────────────────────────────────
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.12)',
  borderFocus: 'rgba(202,220,252,0.50)',
  borderAccent: 'rgba(202,220,252,0.45)',

  // ── Toggle ────────────────────────────────────────────────────────────────────
  toggleBg: 'rgba(255,255,255,0.07)',

  // ── Gradients ─────────────────────────────────────────────────────────────────
  gradientHeader: ['#00246B', '#1a3a7a'] as const,
  gradientAccent: ['#2a52a0', '#CADCFC'] as const,
  gradientSuccess: ['#00c896', '#008f6b'] as const,

  // ── Overlay / scrim ───────────────────────────────────────────────────────────
  overlay: 'rgba(0,9,30,0.85)',

  // ── Radius ────────────────────────────────────────────────────────────────────
  radius: 16,
  radiusSm: 10,
  radiusLg: 24,

  // ── Shadow (android elevation + iOS params) ───────────────────────────────────
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
