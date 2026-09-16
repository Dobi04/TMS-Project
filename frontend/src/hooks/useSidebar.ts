import { useEffect, useState } from 'react';

function getInitalCollapsed() {
    return localStorage.getItem('sidebarCollapsed') === 'true';
}

export function useSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(getInitalCollapsed);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }, [isCollapsed])
    
    return {
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),

        isCollapsed,
        toggleCollapsed: () => setIsCollapsed((prevCollapsed) => !prevCollapsed),
    }
}