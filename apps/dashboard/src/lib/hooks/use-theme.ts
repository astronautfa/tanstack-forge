import { useState, useEffect } from "react";

const isClient = typeof window !== "undefined";

export function useTheme() {
    const [theme, setTheme] = useState("light"); // Default to light for SSR
    const [isDark, setIsDark] = useState(false); // Default to false for SSR

    // Initialize theme on component mount (client-side only)
    useEffect(() => {
        if (!isClient) return;

        // Check if dark mode is active
        const checkIsDark = () => {
            return (
                document.documentElement.classList.contains("dark") ||
                (!localStorage.theme &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches)
            );
        };

        // Set initial states
        const initialIsDark = checkIsDark();
        setIsDark(initialIsDark);
        setTheme(initialIsDark ? "dark" : "light");

        // Also monitor for system preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (!localStorage.theme) {
                const newIsDark = mediaQuery.matches;
                setIsDark(newIsDark);
                setTheme(newIsDark ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        if (!isClient) return;

        const newTheme = theme === "dark" ? "light" : "dark";

        // Update DOM
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Save preference
        localStorage.theme = newTheme;

        // Update state
        setTheme(newTheme);
        setIsDark(newTheme === "dark");
    };

    return {
        theme,
        isDark,
        isLight: !isDark,
        toggleTheme,
    };
}