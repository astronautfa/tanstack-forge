import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme-mode');
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme-mode', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="sidebar-item">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-4 py-2 text-sm transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>Theme</span>
                <span className="flex items-center">
                    {theme === 'light' ? (
                        <Sun size={16} />
                    ) : (
                        <Moon size={16} />
                    )}
                </span>
            </button>
        </div>
    );
};