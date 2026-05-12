import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: frauncesFamily } = loadFraunces("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const { fontFamily: geistFamily } = loadGeist("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const { fontFamily: monoFamily } = loadMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const fonts = {
  display: frauncesFamily,
  sans: geistFamily,
  mono: monoFamily,
};
