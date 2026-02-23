import { colors } from './colors';

export const semanticColors = {
    // ─── Backgrounds ──────────────────────────────────────────────────────────
    background: "#050508",
    backgroundSecondary: "#0a0a0f",
    containerBackground: "#131318",
    cardBackground: "#1e1c35",
    inputBackground: "#1a1a24",

    // ─── Text ─────────────────────────────────────────────────────────────────
    textPrimary: "#f1f0ff",
    textSecondary: "#8b89a8",
    textDescription: "#9ca3af",
    textMuted: "rgba(255, 255, 255, 0.5)",
    textInverse: "#ffffff",

    // ─── Buttons ──────────────────────────────────────────────────────────────
    buttonPrimary: "#7b6ef6",
    buttonPrimaryHover: "#5b4de0",
    buttonSecondary: "#6366f1",
    buttonSecondaryHover: "#4338ca",
    buttonDisabled: "rgba(123, 110, 246, 0.5)",

    // ─── Borders ──────────────────────────────────────────────────────────────
    border: "rgba(123, 110, 246, 0.15)",
    borderLight: "rgba(123, 110, 246, 0.08)",
    borderFocus: "rgba(123, 110, 246, 0.4)",
    divider: "rgba(255, 255, 255, 0.06)",

    // ─── Status Colors ────────────────────────────────────────────────────────
    success: "#10b981",
    successLight: "rgba(16, 185, 129, 0.12)",
    successText: "#10b981",

    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.12)",
    warningText: "#f59e0b",

    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.1)",
    dangerText: "#ef4444",

    info: "#3b82f6",
    infoLight: "rgba(59, 130, 246, 0.12)",
    infoText: "#3b82f6",

    // ─── Gradients ────────────────────────────────────────────────────────────
    gradientPrimary: ["#7b6ef6", "#5b4de0"] as const,
    gradientSecondary: ["#6366f1", "#4338ca"] as const,
    gradientPurple: ["#8b5cf6", "#6d28d9"] as const,
    gradientSuccess: ["#10b981", "#059669"] as const,
    gradientWarning: ["#f59e0b", "#d97706"] as const,
    gradientDanger: ["#ef4444", "#dc2626"] as const,
    gradientInfo: ["#3b82f6", "#2563eb"] as const,
    gradientHeader: ["#667eea", "#764ba2"] as const,

    // ─── Accents ──────────────────────────────────────────────────────────────
    accent: "#a78bfa",
    accentLight: "rgba(123, 110, 246, 0.2)",
    accentMuted: "rgba(167, 139, 250, 0.5)",

    // ─── Progress & Indicators ────────────────────────────────────────────────
    progressBackground: "rgba(255, 255, 255, 0.1)",
    progressFill: "#7b6ef6",

    // ─── Shadows (iOS) ────────────────────────────────────────────────────────
    shadowColor: "#000",

    // ─── Icons ────────────────────────────────────────────────────────────────
    iconPrimary: "#f1f0ff",
    iconSecondary: "#8b89a8",
    iconMuted: "rgba(255, 255, 255, 0.4)",

    // ─── Tab Bar ──────────────────────────────────────────────────────────────
    tabActive: "#7b6ef6",
    tabInactive: "#8b89a8",
    tabBackground: "#131318",

    // ─── Badge Colors ─────────────────────────────────────────────────────────
    badgePrimary: "#7b6ef6",
    badgeSuccess: "#10b981",
    badgeWarning: "#f59e0b",
    badgeDanger: "#ef4444",
    badgeInfo: "#3b82f6",
    badgePink: "#ec4899",
    badgeNeutral: "#9ca3af",
};

// ─── Type Export ──────────────────────────────────────────────────────────────

export type SemanticColors = typeof semanticColors;
