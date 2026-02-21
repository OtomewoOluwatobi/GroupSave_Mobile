import { colors } from './colors';

export const semanticColors = {
    // Buttons
    buttonPrimary: colors.primary.purple,
    buttonPrimaryHover: colors.primary.purpleHover,
    buttonPrimaryActive: colors.primary.purpleDeep,
    buttonPrimaryText: colors.backgrounds.card,

    // Cards & containers
    containerBackground: colors.backgrounds.card,
    containerBorder: colors.borders.purpleLight,

    // Input fields
    inputBackground: colors.backgrounds.card,
    inputBorder: colors.borders.purpleLight,
    inputBorderActive: colors.primary.purple,
    inputBorderError: colors.danger.text,
    inputText: colors.text.primary,
    inputPlaceholder: colors.text.placeholder,

    // Text
    textHeading: colors.text.primary,
    textBody: colors.text.muted,
    textSecondary: colors.text.secondary,
    textLabel: colors.text.purpleMedium,
    textPlaceholder: colors.text.placeholder,
    textError: colors.danger.text,

    // Backgrounds
    pageBg: colors.backgrounds.page,
    sectionBg: colors.backgrounds.lavenderSubtle,
    footerBg: colors.backgrounds.footer,

    // States
    successBorder: colors.primary.purple,
    successText: colors.primary.purple,
    warningBg: colors.warning.background,
    warningBorder: colors.warning.border,
    warningText: colors.warning.textDark,
    dangerBg: colors.danger.background,
    dangerBorder: colors.danger.border,
    dangerText: colors.danger.text,

    // Dividers
    divider: colors.borders.grey,

    // Links
    linkColor: colors.primary.purple,
    linkHover: colors.primary.purpleHover,
};
