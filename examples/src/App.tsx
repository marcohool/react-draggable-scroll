import { RefObject, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useScrollOnDrag from 'react-scroll-ondrag';

const Container = styled.div`
  display: inline-block;
  width: 1000px;
  height: 250px;
  overflow-x: scroll;
  overflow-y: hidden;
  border: 1px solid #000;
  padding: 0 5px;
  white-space: nowrap;
`;

const Box = styled.div`
  display: inline-block;
  height: 300px;
  margin: 5px 10px;
  width: 250px;
  background: linear-gradient(red, yellow);
`;

const ScrollableBox = ({
  runScroll,
}: {
  runScroll?: (
    containerRef: RefObject<HTMLDivElement>,
  ) => (args: { dx: number; dy: number }) => void;
}) => {
  const containerRef = useRef(null);
  const { events } = useScrollOnDrag(containerRef, {
    runScroll: runScroll && runScroll(containerRef),
  });

  return (
    <Container {...events} ref={containerRef}>
      {[...Array.from({ length: 30 }).keys()].map((i) => (
        <Box key={i} />
      ))}
    </Container>
  );
};

ScrollableBox.propTypes = {
  runScroll: PropTypes.func,
};

ScrollableBox.defaultProps = {
  runScroll: undefined,
};


function App() {
  return (
    <>
      <div>Default runScroll, scrolls both x and y directions:</div>
      <ScrollableBox />
      <div>Scrolls only x direction at 5 times the normal speed:</div>
      <ScrollableBox
        runScroll={(containerRef) =>
          ({ dx }: { dx: number }) => {
            if (containerRef.current) {
              containerRef.current.scrollLeft += dx * 5;
            }
          }}
      />
    </>
  )
}

export default App
