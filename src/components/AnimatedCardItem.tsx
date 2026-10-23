import React, { useEffect, useRef, useState } from 'react';

// Global session cache to ensure cards animate strictly once per session
// When scrolling back up, previously loaded cards MUST NOT replay animation.
const cardEntranceSessionCache = new Set<string>();

interface AnimatedCardItemProps {
  cardId: string;
  children: React.ReactNode;
  className?: string;
  delayIndex?: number;
}

/**
 * AnimatedCardItem satisfies Section 3:
 * - On initial screen load or when new cards scroll into viewport:
 *   animate with entrance fade-in & subtle spring scale (opacity: 0, translateY: 40px -> opacity: 1, translateY: 0px)
 * - CRITICAL: Once entered, state is memorized in cardEntranceSessionCache.
 *   When scrolling back UP, previously loaded cards DO NOT replay entrance animation.
 */
export const AnimatedCardItem: React.FC<AnimatedCardItemProps> = ({
  cardId,
  children,
  className = '',
  delayIndex = 0,
}) => {
  const isAlreadyLoaded = cardEntranceSessionCache.has(cardId);
  const [isVisible, setIsVisible] = useState(isAlreadyLoaded);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAlreadyLoaded) return;

    const el = domRef.current;
    if (!el) return;

    // Use IntersectionObserver for scroll-reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Mark as viewed in session cache immediately
            cardEntranceSessionCache.add(cardId);
            setIsVisible(true);
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 50px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [cardId, isAlreadyLoaded]);

  // If already rendered previously, render static with zero animation overhead
  if (isAlreadyLoaded) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  const delayMs = Math.min(delayIndex * 60, 240);

  return (
    <div
      ref={domRef}
      className={`w-full ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(40px) scale(0.98)',
        transition: `opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
