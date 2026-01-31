import { Platform } from "react-native";

const primaryLight = "#0066CC";
const primaryDark = "#0A84FF";
const accentRed = "#FF3B30";
const successGreen = "#34C759";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#6C6C70",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryLight,
    accent: accentRed,
    success: successGreen,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F7",
    backgroundSecondary: "#E5E5EA",
    backgroundTertiary: "#D1D1D6",
    border: "#E5E5EA",
    cardBackground: "#FFFFFF",
    liveIndicator: accentRed,
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryDark,
    link: primaryDark,
    primary: primaryDark,
    accent: accentRed,
    success: successGreen,
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    border: "#38383A",
    cardBackground: "#1C1C1E",
    liveIndicator: accentRed,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const LaneColors = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#30B0C7",
  "#0066CC",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
];
