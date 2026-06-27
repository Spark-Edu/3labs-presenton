import { Theme } from "../services/api/types";

const DEFAULT_FONT = {
  name: "Inter",
  url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
};

const DEFAULT_STACK = "'Inter', 'Noto Sans', Arial, sans-serif";

function quoteFont(name?: string) {
  return name ? `'${name.replace(/'/g, "\\'")}'` : "'Inter'";
}

export function getThemeFontConfig(theme?: Theme | null) {
  const fonts = (theme?.data?.fonts ?? {}) as Partial<Theme["data"]["fonts"]>;
  const textFont = fonts.textFont ?? DEFAULT_FONT;
  const headingFont = fonts.headingFont ?? textFont;
  const bodyFont = fonts.bodyFont ?? textFont;
  const family = fonts.fontFamily;
  const bodyStack = family?.stack || `${quoteFont(bodyFont.name)}, 'Noto Sans', Arial, sans-serif`;
  const headingStack = `${quoteFont(headingFont.name)}, ${bodyStack || DEFAULT_STACK}`;

  return {
    headingFont,
    bodyFont,
    headingStack,
    bodyStack,
    fontsToLoad: {
      [headingFont.name]: headingFont.url,
      [bodyFont.name]: bodyFont.url,
    },
  };
}

export function applyThemeFontStyles(element: HTMLElement, theme?: Theme | null) {
  const { headingStack, bodyStack } = getThemeFontConfig(theme);
  element.style.setProperty("font-family", bodyStack);
  element.style.setProperty("--theme-font-family", bodyStack);
  element.style.setProperty("--heading-font-family", headingStack);
  element.style.setProperty("--body-font-family", bodyStack);
  document.documentElement.style.setProperty("font-family", bodyStack);
  document.documentElement.style.setProperty("--theme-font-family", bodyStack);
  document.documentElement.style.setProperty("--heading-font-family", headingStack);
  document.documentElement.style.setProperty("--body-font-family", bodyStack);
}
