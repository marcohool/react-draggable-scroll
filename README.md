# react-draggable-scroll

react-draggable-scroll is a React package that provides the ability to scroll by dragging the content. It is largely based on [react-scroll-ondrag](https://github.com/dotcore64/react-scroll-ondrag), but cleaned up and with added functionality to support draggable scroll for mobile.

## Installation

You can install the package using npm or yarn:

```bash
npm install react-draggable-scroll
```

or

```bash
yarn add react-draggable-scroll
```

## Usage

Here is a basic example of how to use `react-draggable-scroll`:

```jsx
import React, { useRef } from "react";
import useScrollOnDrag from "react-draggable-scroll";

const MyComponent = () => {
  const containerRef = useRef(null);
  const { events } = useScrollOnDrag(containerRef);

  return (
    <div {...events} ref={containerRef}>
      Your scrollable content here
    </div>
  );
};
```

## Features

- Easy to use drag-to-scroll functionality.
- Supports both desktop and mobile environments.
- Simple integration with existing React components.

## License

This project is licensed under the MIT License.

For more details, refer to the LICENSE file.

---
