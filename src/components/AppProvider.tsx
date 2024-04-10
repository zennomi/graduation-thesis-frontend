import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export const AppContext = createContext({
    openMainMenu: false,
    toggleMainMenu: () => { }
});

export const useAppContext = () => useContext(AppContext)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [openMainMenu, setOpenMainMenu] = useState(false)

    const toggleMainMenu = useCallback(() => {
        setOpenMainMenu(prev => !prev)
    }, [setOpenMainMenu])

    const memoizedValue = useMemo(
        () => ({
            openMainMenu,
            toggleMainMenu,
        }),
        [openMainMenu, toggleMainMenu]
    );

    return <AppContext.Provider value={memoizedValue}>{children}</AppContext.Provider>
}