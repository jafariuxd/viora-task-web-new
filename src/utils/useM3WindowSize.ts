import { useState, useEffect } from 'react';

/**
 * Material Design 3 Window Size Classes & Adaptive Breakpoints:
 * - Compact: Width < 600dp (Mobile phones portrait)
 *   -> Grid: 4 columns | Margins: 16dp | Navigation: Bottom Navigation Bar | Single-pane
 * - Medium: 600dp <= Width < 840dp (Foldables, small tablets in portrait)
 *   -> Grid: 8 columns | Margins: 24dp | Navigation: Navigation Rail (72-80dp)
 * - Expanded: 840dp <= Width < 1200dp (Tablets landscape, small desktops, laptops)
 *   -> Grid: 12 columns | Margins: 24dp | Navigation: Navigation Drawer (modal/persistent)
 * - Large: 1200dp <= Width < 1600dp (Standard desktop monitors)
 *   -> Grid: 12 columns | Margins: 24-32dp | Navigation: Permanent Navigation Drawer | Multi-pane / Fluid Board
 * - ExtraLarge: Width >= 1600dp (Ultra-wide desktop screens)
 *   -> Grid: 12 columns | Margins: 32dp | Navigation: Permanent Navigation Drawer | Expanded split-view
 */
export type M3WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large';

export function useM3WindowSize() {
  const [windowWidth, setWindowWidth] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sizeClass: M3WindowSizeClass =
    windowWidth < 600
      ? 'compact'
      : windowWidth < 840
      ? 'medium'
      : windowWidth < 1200
      ? 'expanded'
      : windowWidth < 1600
      ? 'large'
      : 'extra-large';

  const isCompact = sizeClass === 'compact';
  const isMedium = sizeClass === 'medium';
  const isExpanded = sizeClass === 'expanded';
  const isLarge = sizeClass === 'large';
  const isExtraLarge = sizeClass === 'extra-large';

  const isAtLeastMedium = windowWidth >= 600;
  const isAtLeastExpanded = windowWidth >= 840;
  const isAtLeastLarge = windowWidth >= 1200;

  // M3 Grid and Spacing Tokens
  const gridColumns = isCompact ? 4 : isMedium ? 8 : 12;
  const marginPx = isCompact ? 16 : isMedium ? 24 : isExpanded ? 24 : 32;
  const gutterPx = isCompact ? 16 : 24;

  return {
    windowWidth,
    sizeClass,
    isCompact,
    isMedium,
    isExpanded,
    isLarge,
    isExtraLarge,
    isAtLeastMedium,
    isAtLeastExpanded,
    isAtLeastLarge,
    gridColumns,
    marginPx,
    gutterPx,
  };
}
