import type { ThemeConfig } from 'antd';

/**
 * Ant Design theme configuration with custom color palette and Illustration style
 *
 * Color Palette:
 * - Primary: Navy Blue (#161E54)
 * - Warning: Orange (#F16D34)
 * - Info: Light Blue (#BBE0EF)
 *
 * Style: Illustration - rounded corners, playful spacing, generous whitespace
 */
export const illustrationTheme: ThemeConfig = {
  token: {
    // Custom Color Palette
    colorPrimary: '#161E54',      // Navy Blue
    colorSuccess: '#198754',
    colorWarning: '#F16D34',      // Orange
    colorError: '#B3261E',
    colorInfo: '#BBE0EF',         // Light Blue

    // Backgrounds
    colorBgContainer: '#F8FCFE',
    colorBgLayout: '#F8FCFE',
    colorBgElevated: '#FFFFFF',

    // Text
    colorText: '#0F1419',
    colorTextSecondary: '#3D4F5A',
    colorTextTertiary: '#6B7684',
    colorTextQuaternary: '#9BA3AE',

    // Borders
    colorBorder: '#BBE0EF',
    colorBorderSecondary: '#E3E8ED',

    // Illustration Style - Rounded Everything
    borderRadius: 16,
    borderRadiusLG: 24,
    borderRadiusSM: 12,
    borderRadiusXS: 8,

    // Typography
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Generous Spacing (Illustration style)
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,

    // Control heights
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    // Line heights
    lineHeight: 1.5,
  },

  components: {
    Button: {
      borderRadius: 20,           // Pill-shaped buttons (Illustration style)
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
      paddingContentHorizontal: 24,
    },

    Input: {
      borderRadius: 12,
      controlHeight: 56,          // Keep current 56px height for better UX
      controlHeightLG: 64,
      fontSize: 16,               // Prevent zoom on iOS
      paddingBlock: 16,
      paddingInline: 16,
    },

    InputNumber: {
      borderRadius: 12,
      controlHeight: 56,
      fontSize: 16,
      paddingBlock: 16,
      paddingInline: 16,
    },

    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.08)',
    },

    Alert: {
      borderRadiusLG: 12,
      paddingContentHorizontalLG: 20,
      paddingContentVerticalLG: 16,
    },

    Divider: {
      colorSplit: '#E3E8ED',
    },

    Tooltip: {
      borderRadius: 8,
      colorBgSpotlight: '#161E54',
    },

    Upload: {
      borderRadius: 12,
    },

    Tag: {
      borderRadiusSM: 8,
    },
  },
};
