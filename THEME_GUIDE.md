# Theme System Implementation Guide

## Overview
Your GroupSave Mobile app now uses a centralized, semantic color theme. This ensures consistency across all screens and makes future color updates simple.

## Theme Files Created

### 1. `theme/colors.ts`
Contains all raw color definitions organized by category:
- **Primary Palette**: Purple colors for buttons, accents, and borders
- **Backgrounds**: Page, card, and section backgrounds
- **Borders & Dividers**: Light to medium purple and neutral grey
- **Text**: Primary to muted text colors, including purple variants
- **Warning/Alert**: Amber colors for warnings
- **Danger/Security**: Red colors for errors and security alerts
- **Code Snippet**: Highlight colors for code blocks

### 2. `theme/semanticColors.ts`
Higher-level abstraction mapping raw colors to semantic meanings:
- **Button Styles**: Primary buttons, hover states, text colors
- **Input Fields**: Backgrounds, borders, error states, placeholders
- **Text Styles**: Headings, body text, labels, placeholders
- **Backgrounds**: Pages, sections, footers
- **States**: Success, warning, danger, links
- **Dividers**: Neutral separators

## Updated Components

### Screens
- ✅ **HomeScreen.tsx** - Welcome screen with new purple theme
- ✅ **SigninScreen.tsx** - Login with purple buttons and semantic colors
- ✅ **SignupScreen.tsx** - Registration with consistent styling
- ✅ **DashboardScreen.tsx** - Dashboard with semantic colors for cards, text, and dividers
- ✅ **CreateGroupScreen.tsx** - Form creation with themed inputs
- ✅ **GroupDetailsScreen.tsx** - Group details with semantic styling

### Components
- ✅ **FormInput.tsx** - Text input with themed borders and text
- ✅ **FormTextArea.tsx** - Text area with themed styling
- ✅ **MenuActionSheet.tsx** - Menu with themed icons and text

## Color Mapping

### Primary Actions
Use `semanticColors.buttonPrimary` (#667eea) for:
- Main action buttons
- Key accent colors
- Primary interactive elements

### Text
- **Headings**: `semanticColors.textHeading` (#333333)
- **Body Text**: `semanticColors.textBody` (#666666)
- **Secondary**: `semanticColors.textSecondary` (#555555)
- **Muted**: `semanticColors.textMuted` (derived from `textBody`)
- **Placeholders**: `semanticColors.inputPlaceholder` (#999999)

### Backgrounds
- **Page**: `semanticColors.pageBg` (#f0f0f5)
- **Cards/Containers**: `semanticColors.containerBackground` (#ffffff)
- **Sections**: `semanticColors.sectionBg` (#f9f8ff)
- **Footers**: `semanticColors.footerBg` (#f9f9f9)

### Forms & Inputs
- **Input Background**: `semanticColors.inputBackground` (#ffffff)
- **Input Border**: `semanticColors.inputBorder` (#e0d9f7)
- **Input Border (Active)**: `semanticColors.inputBorderActive` (#667eea)
- **Input Border (Error)**: `semanticColors.inputBorderError` (#c92a2a)

### States
- **Success**: `semanticColors.successBorder` / `semanticColors.successText`
- **Warning**: `semanticColors.warningBg` / `semanticColors.warningBorder` / `semanticColors.warningText`
- **Danger**: `semanticColors.dangerBg` / `semanticColors.dangerBorder` / `semanticColors.dangerText`

## Usage Examples

### In a New Component
```tsx
import { semanticColors } from '../theme/semanticColors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.pageBg,
  },
  title: {
    color: semanticColors.textHeading,
    fontSize: 24,
  },
  button: {
    backgroundColor: semanticColors.buttonPrimary,
  },
  buttonText: {
    color: semanticColors.buttonPrimaryText,
  },
});
```

### Inline Styles
```tsx
<Text style={{ color: semanticColors.textBody }}>
  This text uses semantic color
</Text>
```

## Future Updates

### Changing the Theme
1. Edit `theme/colors.ts` to update raw color values
2. All components automatically reflect the change
3. No need to update individual components

### Adding New Semantic Colors
1. Add the semantic mapping in `theme/semanticColors.ts`
2. Import `{ semanticColors }` in components
3. Use the new semantic color throughout your app

### Example: Adding Dark Mode
1. Create `theme/darkColors.ts` with dark theme colors
2. Update `semanticColors.ts` to conditionally import based on theme preference
3. All components automatically support dark mode

## Color Palette Reference

### Purples (Primary)
- `#667eea` - Primary purple (buttons, accents)
- `#764ba2` - Deep purple (gradient end)
- `#5568d3` - Hover state purple
- `#4a3f6b` - Dark purple text

### Greys (Neutral)
- `#f0f0f5` - Page background
- `#ffffff` - Cards/containers
- `#f9f8ff` to `#f8f7ff` - Subtle sections
- `#e0d9f7` to `#d4c8f8` - Borders
- `#333333` to `#999999` - Text hierarchy

### Alert Colors
- **Amber/Warning**: `#f5c87a` - `#f5a623`
- **Red/Danger**: `#ff6b6b` - `#c92a2a`

## Best Practices

✅ **Do:**
- Always use semantic color names instead of hardcoded hex values
- Keep theme imports at the top of files
- Create style constants at module level
- Document custom color decisions

❌ **Avoid:**
- Hardcoding hex values directly in components
- Mixing raw and semantic color names
- Using colors outside their semantic purpose
- Ignoring accessibility contrast requirements

## Questions?
If you need to add more semantic colors or adjust existing ones, update the `theme/semanticColors.ts` file with clear, self-documenting names that describe the intended use.
