import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Theme Definitions ─────────────────────────────────────────────────────────
export const LIGHT: Theme = {
    dark: false,
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: '#1e293b',
    subtext: '#64748b',
    muted: '#94a3b8',
    primary: '#6B5BFF',
    header: '#6B5BFF',
    headerText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    chipBg: '#f1f5f9',
    chipText: '#64748b',
    tabBar: '#ffffff',
    shadow: '#000',
};

export const DARK: Theme = {
    dark: true,
    bg: '#0f0f1a',
    card: '#1e1e2e',
    border: '#2d2d3f',
    text: '#f1f5f9',
    subtext: '#94a3b8',
    muted: '#64748b',
    primary: '#7c6fff',
    header: '#1a1a2e',
    headerText: '#ffffff',
    inputBg: '#1e1e2e',
    inputBorder: '#2d2d3f',
    chipBg: '#2d2d3f',
    chipText: '#94a3b8',
    tabBar: '#1a1a2e',
    shadow: '#000',
};

export type Theme = {
    dark: boolean;
    bg: string; card: string; border: string;
    text: string; subtext: string; muted: string;
    primary: string; header: string; headerText: string;
    inputBg: string; inputBorder: string;
    chipBg: string; chipText: string;
    tabBar: string; shadow: string;
};

// ── Context ───────────────────────────────────────────────────────────────────
type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: LIGHT, isDark: false,
    toggleTheme: () => { }, setDark: () => { },
});

export const useTheme = () => useContext(ThemeContext);

// ── Provider ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'app_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState<boolean>(systemScheme === 'dark');

    // Load user preference on mount
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val !== null) setIsDark(val === 'dark');
        });
    }, []);

    const setDark = (v: boolean) => {
        setIsDark(v);
        AsyncStorage.setItem(STORAGE_KEY, v ? 'dark' : 'light');
    };

    const toggleTheme = () => setDark(!isDark);

    return (
        <ThemeContext.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme, setDark }}>
            {children}
        </ThemeContext.Provider>
    );
}
