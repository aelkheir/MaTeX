import { useCallback, useEffect, useLayoutEffect } from "react";
import {
  ScrollRestorationProps,
  useLocation,
  useMatches,
  useNavigation,
} from "react-router-dom";

const savedScrollPositions: Record<string, number> = {};

export function useElementScrollRestoration({
  scrollElementRef,
  getKey,
}: {
  id?: string;
  scrollElementRef?: React.RefObject<HTMLElement | null>;
} & ScrollRestorationProps = {}) {
  const location = useLocation();
  const matches = useMatches();
  const navigation = useNavigation();

  // const getScrollElement = () => (id && document.getElementById(id)) || window;
  const getScrollElement = () => scrollElementRef?.current;

  const getScrollY = useCallback(() => {
    const el = getScrollElement();
    return el ? el.scrollTop : 0;
    // return 'scrollY' in el ? el.scrollY : el.scrollTop;
  }, [scrollElementRef?.current]);

  // Trigger manual scroll restoration while we're active
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // Save positions on unload
  useEffect(() => {
    return () => {
      const el = scrollElementRef?.current;
      if (navigation.state === "idle" && el) {
        // TODO: key should probably incorporate the ID somehow
        const key = (getKey ? getKey(location, matches) : null) || location.key;
        savedScrollPositions[key] = getScrollY();
      }

      window.history.scrollRestoration = "auto";
    };
  }, [
    location,
    navigation.state,
    matches,
    getScrollY,
    scrollElementRef?.current,
  ]);

  // Restore scrolling when state.restoreScrollPosition changes
  useLayoutEffect(() => {
    const list = getScrollElement();

    const key = (getKey ? getKey(location, matches) : null) || location.key;
    const restoreScrollPosition = savedScrollPositions[key];

    // been here before, scroll to it
    if (list) {
      list.scrollTo(0, restoreScrollPosition);
    }

    // if (location.hash) {
    //   let el = document.getElementById(location.hash.slice(1));
    //   if (el) {
    //     el.focus();
    //     return;
    //   }
    // }
  }, [location, matches, savedScrollPositions]);
}
