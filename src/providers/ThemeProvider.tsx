import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "dim" | "sunset" | "ocean" | "forest";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = "suise-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove("dark", "dim", "sunset", "ocean", "forest");
    if (newTheme !== "light") {
      document.documentElement.classList.add(newTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
