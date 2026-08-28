'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('portfolio-theme');
        // Default to system preference if no saved value
        if (!saved) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = prefersDark ? 'dark' : 'light';
            setTheme(initial);
            document.documentElement.setAttribute('data-theme', initial);
        } else {
            setTheme(saved as 'light' | 'dark');
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('portfolio-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
                position: 'fixed',
                bottom: '2rem',
                left: '2rem',
                zIndex: 100,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: theme === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: theme === 'dark'
                    ? '1px solid rgba(255,255,255,0.18)'
                    : '1px solid rgba(0,0,0,0.12)',
                color: theme === 'dark' ? '#fbbf24' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: theme === 'dark'
                    ? '0 4px 20px rgba(251,191,36,0.15)'
                    : '0 4px 20px rgba(79,70,229,0.15)',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
