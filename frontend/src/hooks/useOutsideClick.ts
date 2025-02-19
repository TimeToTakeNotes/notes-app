// Close sidebar when user clicks outside the sidebar

import { useEffect } from "react";

export default function useOutsideClick(
  refs: Array<React.RefObject<HTMLElement>>, // <-- Ensures all refs match the expected type
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refs.every(ref => ref.current && !ref.current.contains(event.target as Node))) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs, callback]);
}

