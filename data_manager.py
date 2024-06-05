"""
This module contains the functions to manage the data of the F1 Replay Web application.
The functions get the data from FastF1, resample the telemetry, and structures 
it so its json friendly. The driver dictionary these functions will make will be in this form:
{
    "first_name": driver_first,
    "last_name": driver_last,
    "number": driver_number,
    "team": driver_team,
    "session_name": session_name,
    "team_color": team_color,//pulled from results
    "driver_color": driver_color,
    "qualify_pos": qualify_pos,
    "finish_pos": finish_pos,
    "points": points,
    "fastest_lap": 1234,
    "telem_data": {'x':123, 'y':123,'throttle':123,"brake":123,etc,'timestamp':123,
                 'curr_pos':123,},//all telemetry data resampled to 60fps
    "laps": [{lap1},{lap2},lap3]//array of lap dictionarys

}
"""

import logging
import fastf1
import pandas as pd
import numpy as np
import json

logging.basicConfig(level=logging.DEBUG)

DRIVER_DICTS = []

def initials(session):
    """Get the initials of the session type"""
    if session.find("Practice 1") != -1:
        return "FP1"
    elif session.find("Practice 2") != -1:
        return "FP2"
    elif session.find("Practice 3") != -1:
        return "FP3"
    elif session == "Qualifying":
        return "Q"
    elif session == "Race":
        return "R"
    
def pull_data_from_results(session, driver_nums):
    """Pulls data from results and adds them to driver dictionary as described in the module docstring
    """
    results = session.results
    driver_dicts = []

    for num in driver_nums:
        driver_row = results.loc[results['DriverNumber'] == num]#get the row of the driver
        if not driver_row.empty:
            
            driver_dict = {
                "first_name": driver_row['FirstName'].values[0],
                "last_name": driver_row['LastName'].values[0],
                "number": num,
                "teamID": driver_row['TeamId'].values[0],
                "team": driver_row['TeamName'].values[0],
                "team_color": driver_row['TeamColor'].values[0],
                "session_name": initials(session.name),
                "head_shot_URL": driver_row['HeadshotUrl'].values[0],
                "finish_pos": driver_row['Position'].values[0],
                "qualify_pos": driver_row['GridPosition'].values[0],
                "total_seconds_timings": {"fastest_lap": str(pd.to_timedelta(session.laps.pick_driver(num).pick_fastest().LapTime)), #fastest lap time in seconds
                                        "q1": str(pd.to_timedelta(driver_row['Q1'].values[0])),#qualifying times only given if session is "Q"
                                        "q2": str(pd.to_timedelta(driver_row['Q2'].values[0])),
                                        "q3": str(pd.to_timedelta(driver_row['Q3'].values[0]))
                                        },
                "points": driver_row['Points'].values[0],
                "race_status": driver_row['Status'].values[0]#finshed, dnf, crash, etc

            }
            driver_dicts.append(driver_dict)
    return driver_dicts



def make_telemetry_json_friendly(telem_data):
    """Converts the SessionTime objects to strings and remove the Time column"""
    session_time = telem_data.index.total_seconds().astype(str).tolist()
    print("making telemetry json friendly")
    telem_dict = {"SessionTime":session_time}
    for key in telem_data.keys():
        if key != "Time":
            # print("key: ", key, " type: ", type(telem_data[key]), "len: ", len(telem_data[key]))
            telem_dict[key] = telem_data[key].tolist()

    # for key in telem_dict.keys():
    #     print("key: ", key, " type: ", type(telem_dict[key]),
    #         "list: ", telem_dict[key][:10], "len: ", len(telem_dict[key]))  
    return telem_dict

def make_laps_json_friendly(laps):
    #TODO
    return

def get_resampled_telemetry(telemetry, fps):
    telemetry['SessionTime'] = pd.to_timedelta(telemetry['SessionTime'])
    telemetry.set_index('SessionTime', inplace=True)
    numeric_telemetry = telemetry.select_dtypes(include=['number'])
    resampled_telemetry = numeric_telemetry.resample(rule=str(1000//fps)+'ms').ffill()
    return resampled_telemetry

def normalize_data(x, y, width, height):
    """This function normalizeds the x and y points to fit within the window dimensions 
    while maintaining the aspect ratio of the original track."""
    
    if (len(x) > 0 and len(y) > 0)and (width > 0 and height > 0):
        min_x, max_x = min(x), max(x)
        min_y, max_y = min(y), max(y)
        
        
        # calculate the original track's aspect ratio
        track_width = max_x - min_x
        track_height = max_y - min_y
        #once in a while these evalutate to 0, so to avoid division by zero
        if track_height < .5:
            track_height = .0001
        if track_width < .5:
            track_width = .0001
        track_aspect_ratio = track_width / track_height
        
        # calculate the maximum size that can fit within the window while maintaining the aspect ratio
        window_aspect_ratio = width / height
        if track_aspect_ratio > window_aspect_ratio:
            # track is wider than the window's aspect ratio
            norm_width = width
            norm_height = width / track_aspect_ratio
        else:
            # Track is taller than the window's aspect ratio
            norm_height = height
            norm_width = height * track_aspect_ratio
        
        # calculate the normalization factors, ensuring we maintain the aspect ratio
        norm_factor_x = norm_width / track_width
        norm_factor_y = norm_height / track_height
        
        
        # Normalize the points to fit within the calculated dimensions
        norm_x = [(xi - min_x) * norm_factor_x + (width - norm_width) / 2 for xi in x]
        norm_y = [(yi - min_y) * norm_factor_y + (height - norm_height) / 2 for yi in y]
        
        return norm_x, norm_y
    else:#theres no postition data
        print("Driver is missing position telemetry data. Skipping normalization.:",x,y)
        print("Or the scren width and height is 0:", width, height)
        return x, y
    
def get_track_coordinates(session):
    """Get the track coordinates from the session"""
    track_data = session.laps.pick_fastest().get_pos_data()
    # print("track data: ", track_data)
    track_coords = {
        "X": track_data['X'].tolist(),
        "Y": track_data['Y'].tolist()
    }

    # print("track_coords: ", track_coords)
    return track_coords

def pull_data_from_laps(session, driver_dicts):
    """Pulls data from laps and adds them to driver dictionary as described in the module docstring
    Also gets the track coordinates for the session using the fastest driver's telemetry
    """
    # get telemetry for the fastest driver
    print("getting track coords")
    track_coords = get_track_coordinates(session)

    for driver_dict in driver_dicts:
        driver_num = driver_dict['number']
        laps = session.laps.pick_drivers(driver_num)
        fps = 55
        telemetry = get_resampled_telemetry(laps.get_telemetry(), fps)
        # print("telemetry: ", telemetry)
        driver_dict['telem_data'] = make_telemetry_json_friendly(telemetry)
        driver_dict['laps'] = make_laps_json_friendly(laps)
    return (driver_dicts, track_coords)
        

def get_session_results(year, track, event_session,):
    """Get the driver data from FastF1"""
    
    session = fastf1.get_session(int(year), track, event_session)
    session.load()
    driver_nums = session.drivers
    DRIVER_DICTS = pull_data_from_results(session, driver_nums)
    return (DRIVER_DICTS, session)