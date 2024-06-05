import React, { useState, useEffect } from 'react';
import RaceResults from './RaceResults';

function RaceForm(props) {
  const [chosen_year, set_chosen_year] = useState('Select');
  const [chosen_month, set_chosen_month] = useState('Select');
  const [chosen_track, set_chosen_track] = useState('Select');
  const [chosen_session, set_chosen_session] = useState('Select');
  const [returned_tracks, set_returned_tracks] = useState([]);
  const [isDriverDataLoading, setIsDriverDataLoading] = useState(false);
  const [isTrackDataLoading, setIsTrackDataLoading] = useState(false);
  const [isTelemetryDataLoading, setIsTelemetryDataLoading] = useState(false);

  useEffect(() => {
    if (chosen_year && chosen_month) {
      fetch(`/api/tracks?year=${chosen_year}&month=${chosen_month}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_returned_tracks(data || []);//store the returned data in the state
        })
        .catch(error => console.error('Failed to fetch tracks', error));
    }
  }, [chosen_year, chosen_month]);//whenever [year, month] changes, useEffect will run


  const fetchDriverData = async () => {
    
    const formData = { chosen_year, chosen_track };
    const response = await fetch('/get_results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    // the data will be an array of objects, each object will have the driver's name and their session results
    const driver_data = await response.json();
    
    return driver_data;
  };

  const fetchTrackDataDriverCount = async (width, height) => {
    console.log("handleSubmit: fetching track data");
    const count_response = await fetch(`/get_driver_count?width=${width}&height=${height}`);
    const count_response_data = await count_response.json();
    const driver_count = count_response_data.count;
    const track_coords = count_response_data.track_coords;
    console.log("handleSubmit: sending track_coords to parent: ", track_coords);

    props.onTrackData(track_coords);//pass the track data to the parent component
    return driver_count;
  };

  const fetchTelemetryData = async (driver_data, driver_count, width, height) => {
    //once i have the number of drivers, i can start a loop to get the telemetry data for each driver
    console.log("handleSubmit: driver count: ", driver_count);
    for (let i = 0; i < driver_count; i++) {
      console.log("handleSubmit: fetching driver ", i);
      const telemetry_response = await fetch(`/get_driver/${i}?width=${width}&height=${height}`);
      console.log("handleSubmit: fetched driver ", i);
      const telemetry_data = await telemetry_response.json();

      // add the telemetry data to the appropriate driver object in props
      driver_data[i] = telemetry_data;//replace the driver object with the driver the updated driver object
    }
    console.log("handleSubmit: finished fetching data: ", driver_data);
    // pass the data to the parent component, so Animation can have acces to it
    //props.onDriverData(driver_data);
    return driver_data
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit: getting response ");
    // send the chosen year and track to the parent component
    props.onTrackName(chosen_track);
    props.onYear(chosen_year);
    // turn on loading indicator
    setIsDriverDataLoading(true);
    const driver_data = await fetchDriverData();
    props.onDriverData(driver_data);
    //turn off loading indicator
    setIsDriverDataLoading(false);
    
   
    // get the width and height of the canvas from the parent properties
    const { canvas_size } = props;
    const width = canvas_size.width;
    const height = canvas_size.height;
    setIsTrackDataLoading(true);
    // use a different laoding indicator while waiting for the track data
    const driver_count = await fetchTrackDataDriverCount(width, height);
    //turn off loading indicator
    setIsTrackDataLoading(false);

    setIsTelemetryDataLoading(true);
    // use a different laoding indicator while waiting for the telemetry data
    const telem = await fetchTelemetryData(driver_data, driver_count, width, height);
    
    //turn off loading indicator
    setIsTelemetryDataLoading(false);
  };

  const redirectToAnimation = () => {
    props.onShowAnimation();
  };

    return (
      <div>
        {/* If the track or driver data is loading show a loading message */}
        {(isTrackDataLoading || isDriverDataLoading) && (
          <div className="loading">Loading Track Data...</div>
        )}
        
        {/* Show button to View Animation */}
        {!isTrackDataLoading && !isDriverDataLoading && props.driver_data && (
          <button onClick={redirectToAnimation}>View Animation</button>
        )}

        <form id="raceForm" onSubmit={handleSubmit}>
          {/* Year selection */}
          <label htmlFor="year">Year:</label>
          <select id="year" name="year" value={chosen_year} onChange={(e) => set_chosen_year(e.target.value)}>
            <option value="Select">Select</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>

          {/* Month selection */}
          <label htmlFor="month">Month:</label>
          <select id="month" name="month" value={chosen_month} onChange={(e) => set_chosen_month(e.target.value)}>
            <option value="Select">Select</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          {/* Track selection */}
          <label htmlFor="track">Track:</label>
          <select 
              id="track" 
              name="track" 
              value={chosen_track} 
              onChange={(e) => {
                  const trackName = e.target.value;
                  set_chosen_track(e.target.value);
                  // extract session names from the selected track's sessions
                  const keepers = ['Race', 'Qualifying']
                  if (returned_tracks[trackName]) {
                    // Filter and map sessions for the selected track based on "keepers"
                    const sessionsForTrack = returned_tracks[trackName]
                      .filter(session => {
                        console.log(session);
                        return keepers.includes(session)}) // Filter sessions based on keepers
                      .map(session => session); // Then map to get session names

                  } 
              }}>
              <option value="Select" selected>Select</option>
              {
                  Object.keys(returned_tracks).map((track) => (
                      <option key={track} value={track}>{track}</option>
                  ))
              }
          </select>

          <button type="submit" id="results">Results</button>
        </form>
        {/* If the driver data is loading show a loading message, otherwise display the data */}
        {isDriverDataLoading ? (
          <div className="loading">Loading driver data...</div>
        ) : props.driver_data ? (
          <RaceResults driver_data={props.driver_data} />
        ) : null}

      </div>
    );
  }

  export default RaceForm;
