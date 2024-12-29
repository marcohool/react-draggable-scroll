import React, { RefObject, useCallback, useEffect, useRef } from "react";
import invariant from "tiny-invariant";

type RunScrollParams = {
  dx: number;
  dy: number;
};

const maxHorizontalScroll = (dom: HTMLElement) =>
  dom.scrollWidth - dom.clientWidth;

const maxVerticalScroll = (dom: HTMLElement) =>
  dom.scrollHeight - dom.clientHeight;

export default (
  domRef: RefObject<HTMLElement | null>,
  {
    onDragStart = () => {},
    onDragEnd = () => {},
    onSingleClick = () => {},
    runScroll = ({ dx, dy }: RunScrollParams) => {
      const element = domRef.current;

      if (element) {
        element.scrollLeft = Math.min(
          maxHorizontalScroll(element),
          element.scrollLeft + dx,
        );

        element.scrollTop = Math.min(
          maxVerticalScroll(element),
          element.scrollTop + dy,
        );
      }
    },
  } = {},
) => {
  const internalState = useRef<{
    lastX: number | null;
    lastY: number | null;
    isDragging: boolean;
    isScrolling: boolean;
  }>({
    lastX: null,
    lastY: null,
    isDragging: false,
    isScrolling: false,
  });

  const scroll = useCallback(
    ({ dx, dy }: RunScrollParams) => {
      invariant(
        domRef.current !== null,
        `Trying to scroll to the bottom, but no element was found.
      Did you call this scrollBottom before the component with this hook finished mounting?`,
      );

      runScroll({ dx, dy });
    },
    [runScroll],
  );

  const startDragging = useCallback((x: number, y: number) => {
    internalState.current.isDragging = true;
    internalState.current.lastX = x;
    internalState.current.lastY = y;
  }, []);

  const stopDragging = useCallback(() => {
    if (!internalState.current.isDragging) return;

    internalState.current.isDragging = false;
    internalState.current.lastX = null;
    internalState.current.lastY = null;

    if (internalState.current.isScrolling) {
      internalState.current.isScrolling = false;
      onDragEnd();
    } else {
      onSingleClick();
    }
  }, [onDragEnd, onSingleClick]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startDragging(e.clientX, e.clientY);
    },
    [startDragging],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startDragging(touch.clientX, touch.clientY);
    },
    [startDragging],
  );

  const onMouseUp = () => {
    stopDragging();
  };
  const onTouchEnd = () => {
    internalState.current.isDragging = false;
    internalState.current.lastX = null;
    internalState.current.lastY = null;
  };

  const onMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!internalState.current.isDragging) {
        return;
      }

      if (!internalState.current.isScrolling) {
        internalState.current.isScrolling = true;
        onDragStart();
      }

      const event = e instanceof TouchEvent ? e.touches[0] : e;

      const dx = -(event.clientX - (internalState.current.lastX ?? 0));
      const dy = -(event.clientY - (internalState.current.lastY ?? 0));
      internalState.current.lastX = event.clientX;
      internalState.current.lastY = event.clientY;

      scroll({ dx, dy });
    },
    [scroll, onDragStart],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      onMove(e);
    },
    [onMove],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      onMove(e);
    },
    [onMove],
  );

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchmove", onTouchMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [onMouseUp, onMouseMove, onTouchEnd, onTouchMove]);

  return {
    events: {
      onMouseDown,
      onTouchStart,
    },
  };
};
