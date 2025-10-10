import { useEffect, useRef, useCallback } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  ignoreElements?: HTMLElement[]
): React.RefObject<T> {
  const ref = useRef<T>(null);

  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    // Check if the clicked element is inside the ref
    if (ref.current && !ref.current.contains(event.target as Node)) {
      // Check if the clicked element should be ignored
      const shouldIgnore = ignoreElements?.some(element => 
        element.contains(event.target as Node)
      );
      
      if (!shouldIgnore) {
        handler();
      }
    }
  }, [handler, ignoreElements]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);

  return ref as React.RefObject<T>;
}