import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Check localStorage first, default to dark for this app
    const stored = localStorage.getItem("restylepro-theme");
    return (stored === "light" || stored === "dark") ? stored : "dark";
  });

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("restylepro-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
