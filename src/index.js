import { useCallback, useEffect, useRef } from 'react';
import invariant from 'tiny-invariant';

const maxHorizontalScroll = (dom) => dom.scrollWidth - dom.clientWidth;
const maxVerticalScroll = (dom) => dom.scrollHeight - dom.clientHeight;

export default (
  domRef,
  {
    onDragStart = () => {},
    onDragEnd = () => {},
    runScroll = ({ dx, dy }) => {
      // eslint-disable-next-line no-param-reassign
      domRef.current.scrollLeft = Math.min(
        maxHorizontalScroll(domRef.current),
        domRef.current.scrollLeft + dx,
      );

      // eslint-disable-next-line no-param-reassign
      domRef.current.scrollTop = Math.min(
        maxVerticalScroll(domRef.current),
        domRef.current.scrollTop + dy,
      );
    },
  } = {},
) => {
  const internalState = useRef({
    lastMouseX: null,
    lastMouseY: null,
    isMouseDown: false,
    isScrolling: false,
  });

  const scroll = useCallback(
    ({ dx, dy }) => {
      invariant(
        domRef.current !== null,
        `Trying to scroll to the bottom, but no element was found.
      Did you call this scrollBottom before the component with this hook finished mounting?`,
      );

      runScroll({ dx, dy });
    },
    [runScroll],
  );

  const startDragging = useCallback((x, y) => {
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

  const onMouseDown = useCallback((e) => {
    internalState.current.isMouseDown = true;
    internalState.current.lastMouseX = e.clientX;
    internalState.current.lastMouseY = e.clientY;
  }, []);

  const onTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      startDragging(touch.clientX, touch.clientY);
    },
    [startDragging],
  );

  const onMouseUp = stopDragging;

  const onTouchEnd = stopDragging;

  const onMouseMove = (e) => {
    if (!internalState.current.isMouseDown) {
      return;
    }

    if (!internalState.current.isScrolling) {
      internalState.current.isScrolling = true;
      onDragStart();
    }

    // diff is negative because we want to scroll in the opposite direction of the movement
    const dx = -(e.clientX - internalState.current.lastMouseX);
    const dy = -(e.clientY - internalState.current.lastMouseY);
    internalState.current.lastMouseX = e.clientX;
    internalState.current.lastMouseY = e.clientY;

    scroll({ dx, dy });
  };

  const onTouchMove = useCallback(
    (e) => {
      if (!internalState.current.isDragging) return;

      if (!internalState.current.isScrolling) {
        internalState.current.isScrolling = true;
        onDragStart();
      }

      const touch = e.touches[0];
      const dx = -(touch.clientX - internalState.current.lastX);
      const dy = -(touch.clientY - internalState.current.lastY);

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
