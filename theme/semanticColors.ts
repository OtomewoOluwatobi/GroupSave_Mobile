/** GroupSave — Semantic colour tokens (used by components that reference contextual roles) */

export const semanticColors = {
    // ── Backgrounds ──────────────────────────────────────────────────────────────
    background: '#000f2e',
    backgroundSecondary: '#000a1f',
    containerBackground: 'rgba(0,20,60,0.90)',
    cardBackground: 'rgba(0,20,60,0.90)',
    inputBackground: 'rgba(255,255,255,0.04)',

    // ── Text ──────────────────────────────────────────────────────────────────────
    textPrimary: '#e8f0fd',
    textSecondary: 'rgba(232,240,253,0.45)',
    textDescription: 'rgba(232,240,253,0.45)',
    textMuted: 'rgba(232,240,253,0.22)',
    textInverse: '#ffffff',

    // ── Buttons ───────────────────────────────────────────────────────────────────
    buttonPrimary: '#CADCFC',
    buttonPrimaryHover: '#a8c4f8',
    buttonSecondary: '#2a52a0',
    buttonSecondaryHover: '#1a3a7a',
    buttonDisabled: 'rgba(202,220,252,0.40)',

    // ── Borders ───────────────────────────────────────────────────────────────────
    border: 'rgba(255,255,255,0.07)',
    borderLight: 'rgba(255,255,255,0.05)',
    borderFocus: 'rgba(202,220,252,0.50)',
    divider: 'rgba(255,255,255,0.07)',

    // ── Status — unchanged (accessible on dark bg) ───────────────────────────────
    success: '#10b981',
    successLight: 'rgba(16,185,129,0.12)',
    successText: '#10b981',

    warning: '#f59e0b',
    warningLight: 'rgba(245,158,11,0.12)',
    warningText: '#f59e0b',

    danger: '#ef4444',
    dangerLight: 'rgba(239,68,68,0.10)',
    dangerText: '#ef4444',

    info: '#3b82f6',
    infoLight: 'rgba(59,130,246,0.12)',
    infoText: '#3b82f6',

    // ── Gradients ─────────────────────────────────────────────────────────────────
    gradientPrimary: ['#2a52a0', '#CADCFC'] as const,
    gradientSecondary: ['#00246B', '#1a3a7a'] as const,
    gradientPurple: ['#2a52a0', '#CADCFC'] as const,   // mapped to brand for compat
    gradientSuccess: ['#10b981', '#059669'] as const,
    gradientWarning: ['#f59e0b', '#d97706'] as const,
    gradientDanger: ['#ef4444', '#dc2626'] as const,
    gradientInfo: ['#3b82f6', '#2563eb'] as const,
    gradientHeader: ['#00246B', '#1a3a7a'] as const,

    // ── Accents ───────────────────────────────────────────────────────────────────
    accent: '#CADCFC',
    accentLight: 'rgba(202,220,252,0.15)',
    accentMuted: 'rgba(202,220,252,0.45)',

    // ── Progress & Indicators ────────────────────────────────────────────────────
    progressBackground: 'rgba(255,255,255,0.07)',
    progressFill: '#CADCFC',

    // ── Shadows ───────────────────────────────────────────────────────────────────
    shadowColor: '#000000',

    // ── Icons ─────────────────────────────────────────────────────────────────────
    iconPrimary: '#e8f0fd',
    iconSecondary: 'rgba(232,240,253,0.45)',
    iconMuted: 'rgba(232,240,253,0.30)',

    // ── Tab Bar ───────────────────────────────────────────────────────────────────
    tabActive: '#CADCFC',
    tabInactive: 'rgba(232,240,253,0.40)',
    tabBackground: 'rgba(0,15,46,0.85)',

    // ── Badge Colors ──────────────────────────────────────────────────────────────
    badgePrimary: '#CADCFC',
    badgeSuccess: '#10b981',
    badgeWarning: '#f59e0b',
    badgeDanger: '#ef4444',
    badgeInfo: '#3b82f6',
    badgePink: '#ec4899',
    badgeNeutral: 'rgba(232,240,253,0.45)',
};

// ── Type Export ───────────────────────────────────────────────────────────────
export type SemanticColors = typeof semanticColors;
