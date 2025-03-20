import { type RefObject, useEffect, useRef } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const scrollToBottom = () => {
        const shouldAutoScroll = container.scrollTop + container.clientHeight >=
          container.scrollHeight - 300;

        if (shouldAutoScroll) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      };

      const observer = new MutationObserver(scrollToBottom);

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [
    containerRef as RefObject<T>,
    endRef as RefObject<T>,
  ];
}
