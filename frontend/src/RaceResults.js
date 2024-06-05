import React, { useState, useEffect } from 'react';
import DriverCard from './DriverCard'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 


function RaceResults(props) {

    if (!props.driver_data) {
        return null;
    }
  
    const formatDuration = (durationStr) => {
        if (durationStr != "NaT"){
            const regex = /(\d+)\sdays\s(\d+):(\d+):(\d+\.\d+)/;
            const matches = durationStr.match(regex);
    
            if (matches) {
                const days = parseInt(matches[1], 10);
                const hours = parseInt(matches[2], 10);
                const minutes = parseInt(matches[3], 10);
                const seconds = parseFloat(matches[4]);
                // accurate to three decimal places
                return ((((days * 24 + hours) * 60 + minutes) * 60) + seconds).toFixed(3);
            } else {
                console.error('Invalid duration format');
                return 0;
            }
        }else{
            return "No Time";
        }
    }

    return (
        <div id="resultsContainer">
            {props.driver_data.map(driver => (
                <DriverCard
                    key={driver.id}
                    headshot={driver.head_shot_URL}
                    finishPos={driver.finish_pos}
                    firstName={driver.first_name}
                    lastName={driver.last_name}
                    team={driver.team}
                    qualifyPos={driver.qualify_pos}
                    points={driver.points}
                    fastestLap={formatDuration(driver.total_seconds_timings.fastest_lap)}
                />
            ))}
        </div>
    );
}

export default RaceResults;