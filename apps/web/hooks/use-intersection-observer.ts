"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for detecting when an element enters/exits the viewport
 * @param param0 {Object} options - Intersection Observer options
 * @param param0.root {Element|string} options.root - The element that is used as the viewport for checking visibility
 * @param param0.rootMargin {string} options.rootMargin - Margin around the root (e.g., "10px 0px")
 * @param param0.threshold {number|Array} options.threshold - Either a single number or array of numbers indicating at what percentage of visibility the callback should be executed
 * @param param0.triggerOnce {boolean} options.triggerOnce - If true, will only trigger once when element becomes visible
 * @param param0.onIntersect {Function} options.onIntersect - Callback when intersection occurs
 * @returns {Object} - Contains ref to attach to element and current intersection state
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  triggerOnce = false,
  onIntersect,
}: {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
} = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const elementRef = useRef<T>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If triggerOnce is true and already triggered, don't observe again
    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [observedEntry] = entries;
        const isElementIntersecting = !!observedEntry?.isIntersecting;

        setIsIntersecting(isElementIntersecting);
        setEntry(observedEntry);

        // Call custom callback if provided
        if (onIntersect && isElementIntersecting) {
          onIntersect(observedEntry);
        }

        // Handle triggerOnce
        if (triggerOnce && isElementIntersecting) {
          hasTriggered.current = true;
          observer.unobserve(element);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, onIntersect]);

  return { ref: elementRef, isIntersecting, entry };
}
