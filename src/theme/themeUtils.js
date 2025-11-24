import { colors } from "./colors";

export const getTheme = (mode, accentColor) => {
  // Determine the base colors based on the mode
  const isDark = mode === "dark";

  // Create the theme object
  const theme = {
    ...colors,
    // Override primary colors if an accent color is provided
    primary: accentColor
      ? {
          ...colors.primary,
          main: accentColor,
          // Generate light/dark variants or gradients if needed,
          // for now we'll keep the gradient consistent or just use the main color
          gradient: [accentColor, adjustColor(accentColor, 20)],
        }
      : colors.primary,

    // Dynamic background and text colors based on mode
    background: isDark ? colors.background.dark : colors.background.light,
    text: isDark ? colors.text.dark : colors.text.light,

    // Helper to check if dark mode is active
    isDark,
    mode,
  };

  return theme;
};

// Simple helper to lighten/darken color (for gradient generation)
// This is a basic implementation. For production, use a library like 'tinycolor2' or 'color'
const adjustColor = (color, amount) => {
  return color; // Placeholder: In a real app, you'd manipulate the hex/rgb here
};
