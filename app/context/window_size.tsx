import React, { createContext, useContext, useEffect, useState } from 'react';

interface WindowSizeContextType {
  width: number;
  isMobile: boolean;
}

const WindowSizeContext = createContext<WindowSizeContextType>({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  isMobile: false,
});

const MOBILE_BREAKPOINT = 768; // Standard mobile breakpoint in pixels

export const WindowSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windowSize, setWindowSize] = useState<WindowSizeContextType>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <WindowSizeContext.Provider value={windowSize}>
      {children}
    </WindowSizeContext.Provider>
  );
};

export const useWindowSize = () => useContext(WindowSizeContext);
