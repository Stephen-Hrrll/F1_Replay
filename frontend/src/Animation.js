import React, { useState, useEffect, useRef } from 'react';
import { draw_drivers, draw_track, stop_animation, pause_animation } from './animationFunctions';

function Animation({ track_name, year, driver_data, canvas_size, track_data }) {
  const driverCanvasRef = useRef(null);
  const trackCanvasRef = useRef(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const driverCanvas = driverCanvasRef.current;
    const driverCtx = driverCanvas.getContext('2d');

    if (driver_data) {
      setIsDataLoaded(true);
      //draw_drivers(driver_data, driverCtx);
    }

    return () => {
      stop_animation(driverCtx);
    };
  }, [driver_data]);

  useEffect(() => {
    const trackCanvas = trackCanvasRef.current;
    const trackCtx = trackCanvas.getContext('2d');

    if (track_data) {
      draw_track(track_data, trackCtx);
    }

    return () => {
      trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
    };
  }, [track_data]);

  const play_animation = () => {
    draw_drivers(driver_data, driverCanvasRef.current.getContext('2d'));
  };

  const handle_pause_animation = () => {
    pause_animation();
  };

  const handle_stop_animation = () => {
    stop_animation(driverCanvasRef.current.getContext('2d'));
  };

  return (
    <div id="animationContainer">
      <h1 id="anim_title">{track_name + " " + year + " "}Replay</h1>
      {/* the screen width and height passed to the parent element  should be used here */}
      <div id="controls">
        <button id="play" onClick={play_animation} disabled={!isDataLoaded}>
          Play
        </button>
        <button id="pause" onClick={handle_pause_animation} disabled={!isDataLoaded}>
          Pause
        </button>
        <button id="stop" onClick={handle_stop_animation} disabled={!isDataLoaded}>
          Stop
        </button>

      </div>
      <canvas id="driverCanvas" ref={driverCanvasRef} width={canvas_size.width} height={canvas_size.height}></canvas>
      <canvas id="trackCanvas" ref={trackCanvasRef} width={canvas_size.width} height={canvas_size.height}></canvas>
    </div>
  );
}

export default Animation;