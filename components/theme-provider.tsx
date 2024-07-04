"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import useMediaQuery from "@mui/material/useMediaQuery";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <NextThemesProvider {...props}>
        <MUIThemeProviderComponent>{children}</MUIThemeProviderComponent>
      </NextThemesProvider>
    </>
  );
}

function MUIThemeProviderComponent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  const MUITheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme == "dark" ? "dark" : "light",
        },
      }),
    [theme]
  );
  return <MUIThemeProvider theme={MUITheme}>{children}</MUIThemeProvider>;
}
