"use client";

import { useEffect } from 'react';

export default function GlobalScrollLock() {
  useEffect(() => {
    const checkScrollLock = () => {
      // Find all modal overlays (modals use .modal-overlay class)
      const overlays = document.querySelectorAll('.modal-overlay');
      
      // If there are any modal overlays present in the DOM, lock the scroll.
      if (overlays.length > 0) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };

    // Use a MutationObserver to detect when modals are added or removed from the DOM
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0 || m.removedNodes.length > 0 || m.attributeName === 'class') {
          shouldCheck = true;
          break;
        }
      }
      
      if (shouldCheck) {
        checkScrollLock();
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class'] 
    });
    
    // Check immediately on mount
    checkScrollLock();

    return () => {
      observer.disconnect();
      document.body.style.overflow = 'unset';
    };
  }, []);

  return null;
}
