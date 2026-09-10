import path from "node:path";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public/fonts/Inter-Medium.ttf"),
      fontWeight: 500,
    },
    {
      src: path.join(process.cwd(), "public/fonts/Inter-SemiBold.ttf"),
      fontWeight: 600,
    },
    {
      src: path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Source Serif 4",
  fonts: [
    {
      src: path.join(process.cwd(), "public/fonts/SourceSerif4-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public/fonts/SourceSerif4-SemiBold.ttf"),
      fontWeight: 600,
    },
  ],
});

export const fontsRegistered = true;
