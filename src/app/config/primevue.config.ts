import Lara from "@primeuix/themes/lara";
import { definePreset } from "@primeuix/themes";

export default function primeVueConfig() {
  const preset = definePreset(Lara, {
    semantic: {
      primary: {
        50: "#EEF3FB",
        100: "#D2DFF4",
        200: "#9CBAE8",
        300: "#6F9ADD",
        400: "#3974D0",
        500: "#285BAA",
        600: "#204988",
        700: "#19396B",
        800: "#0E1F3A",
        900: "#091425",
        950: "#020408"
      }
    }
  });

  return {
    ripple: true,
    theme: {
      preset: preset,
      options: {
        prefix: "p",
        cssLayer: {
          name: "primevue",
          order: "theme, base, primevue"
        },
        darkModeSelector: ".dark"
      }
    }
  };
}
