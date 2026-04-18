import { RefObject, useLayoutEffect, useState } from "react";

interface ElementSize {
  height: number;
  width: number;
}

export function useElementSize<T extends HTMLElement>(ref: RefObject<T>) {
  const [size, setSize] = useState<ElementSize>({
    height: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      const nextHeight = entry.contentRect.height;

      setSize((previous) =>
        previous.width === nextWidth && previous.height === nextHeight
          ? previous
          : {
              width: nextWidth,
              height: nextHeight,
            },
      );
    });

    observer.observe(element);
    setSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
