import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import RaceForm from './RaceForm';
import Animation from './Animation';
import RaceResults from './RaceResults';

function App() {
  const [driver_data, setDriverData] = useState(null);
  const [track_coords, setTrackCoords] = useState(null);
  const [track_name, setTrackName] = useState(null);
  const [year, setYear] = useState(null);
  const [canvas_size, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef(null);

  const handleTrackData = (track_data) => {
    setTrackCoords(track_data);
  };

  const handleDriverData = (driver_data) => {
    setDriverData(driver_data);
  };

  const handleTrackName = (track_name) => {
    setTrackName(track_name);
  };

  const handleYear = (year) => {
    setYear(year);
  };

  const handleShowAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => {
      animationRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <div className="App">
      <RaceForm
        driver_data={driver_data}
        onTrackData={handleTrackData}
        onDriverData={handleDriverData}
        onTrackName={handleTrackName}
        onYear={handleYear}
        canvas_size={canvas_size}
        onShowAnimation={handleShowAnimation}
      />
      {showAnimation && (
        <>
          <div className="dead-space"></div>
          <div ref={animationRef}> {/* Wrap the Animation component with a div */}
            <Animation
              track_name={track_name}
              year={year}
              driver_data={driver_data}
              canvas_size={canvas_size}
              track_data={track_coords}
              id="animation"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;