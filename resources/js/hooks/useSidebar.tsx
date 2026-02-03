import { useState, useEffect } from 'react';

export function useSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-collapsed', String(isCollapsed));
        }
    }, [isCollapsed]);

    const toggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const collapse = () => {
        setIsCollapsed(true);
    };

    const expand = () => {
        setIsCollapsed(false);
    };

    return {
        isCollapsed,
        toggle,
        collapse,
        expand,
    };
}
