import React, { RefObject, useCallback, useEffect, useRef } from 'react';
import invariant from 'tiny-invariant';

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
    internalState.current.isDragging = false;
    internalState.current.lastX = null;
    internalState.current.lastY = null;

    if (internalState.current.isScrolling) {
      internalState.current.isScrolling = false;
      onDragEnd();
    }
  }, [onDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    internalState.current.isDragging = true;
    internalState.current.lastX = e.clientX;
    internalState.current.lastY = e.clientY;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startDragging(touch.clientX, touch.clientY);
    },
    [startDragging],
  );

  const onMouseUp = stopDragging;

  const onTouchEnd = stopDragging;

  const onMouseMove = (e: MouseEvent) => {
    if (!internalState.current.isDragging) {
      return;
    }

    if (!internalState.current.isScrolling) {
      internalState.current.isScrolling = true;
      onDragStart();
    }

    // diff is negative because we want to scroll in the opposite direction of the movement
    const dx = -(e.clientX - (internalState.current.lastX ?? 0));
    const dy = -(e.clientY - (internalState.current.lastY ?? 0));
    internalState.current.lastX = e.clientX;
    internalState.current.lastY = e.clientY;

    scroll({ dx, dy });
  };

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!internalState.current.isDragging) return;

      if (!internalState.current.isScrolling) {
        internalState.current.isScrolling = true;
        onDragStart();
      }

      const touch = e.touches[0];
      const dx = -(touch.clientX - (internalState.current.lastX ?? 0));
      const dy = -(touch.clientY - (internalState.current.lastY ?? 0));

      internalState.current.lastX = touch.clientX;
      internalState.current.lastY = touch.clientY;

      scroll({ dx, dy });
    },
    [scroll, onDragStart],
  );

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [onMouseUp, onMouseMove, onTouchEnd, onTouchMove]);

  return {
    events: {
      onMouseDown,
      onTouchStart,
    },
  };
};
