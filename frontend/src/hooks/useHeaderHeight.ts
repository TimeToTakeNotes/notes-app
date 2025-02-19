// Custom hook to dynamically set a CSS variable (--header-height) based on the height of a referenced header element.
// Ensures layout adjustments can be made using this variable in styles.

import { useEffect, RefObject } from "react";

const useHeaderHeight = (headerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
    }
  }, [headerRef]);
};

export default useHeaderHeight;
