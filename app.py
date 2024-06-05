import json
from flask import Flask, jsonify, request, send_from_directory
import requests
from data_manager import *


app = Flask(__name__, static_folder='frontend/build', static_url_path='')
fastf1.Cache.enable_cache('D:\\Programming Projects\\fast_f1\\cache',)
print("directory:", fastf1.Cache._get_cache_file_path)
print("cache enabled:", fastf1.Cache)
print("cache size:", fastf1.Cache._get_size)   

DRIVER_DICTS = []
TRACK_COORDS = []
FAST_SESSION = None
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/tracks')
def get_tracks():
    year = request.args.get('year')
    month = request.args.get('month')
    tracks = fetch_tracks_for_month(year, month)
    return jsonify(tracks)

def fetch_tracks_for_month(year, month):
    apiUrl = f"https://api.openf1.org/v1/sessions?date_start>={year}-{month}-01&date_end<={year}-{month}-30"
    try:
        response = requests.get(apiUrl)
        response.raise_for_status()  # Raise an HTTPError if the response status code is 4XX or 5XX
        responseJSON = response.json()
        # pretty print the JSON response
        # print(json.dumps(responseJSON, indent=2))
        names = {}
        for session in responseJSON: 
            name = session["circuit_short_name"]
            if name not in names:
                names[name] = []
            names[name].append(session["session_name"])
                
        return names
    except requests.RequestException as e:
        print(f"Failed to fetch tracks: {e}")
        return []  # Returning an empty list in case of failure
    

@app.route('/get_results', methods=['POST'])
def get_results():
    data = request.get_json()
    year = data['chosen_year'] 
    track = data['chosen_track']
    global DRIVER_DICTS
    global FAST_SESSION
    DRIVER_DICTS, FAST_SESSION = get_session_results( year, track, 'R')
    return jsonify(DRIVER_DICTS)

@app.route('/get_driver_count', methods=['GET'])
def get_driver_count():
    width = request.args.get('width', type=int)
    height = request.args.get('height', type=int)
    global DRIVER_DICTS
    global FAST_SESSION
    global TRACK_COORDS
    DRIVER_DICTS, TRACK_COORDS = pull_data_from_laps(FAST_SESSION, DRIVER_DICTS)
    print("get_driver_count():track coords X: ", TRACK_COORDS['X'][:5])
    print("get_driver_count():track coords Y: ", TRACK_COORDS['Y'][:5])
    # normalize the data here assign x as norm_x and y as norm_y as new keys
    TRACK_COORDS['X'], TRACK_COORDS['Y'] = normalize_data(TRACK_COORDS['X'], TRACK_COORDS['Y'], width, height)
    print("driver count: ", len(DRIVER_DICTS), "driver_dicts: ", type(DRIVER_DICTS))
    return jsonify({"count": len(DRIVER_DICTS), "track_coords": TRACK_COORDS})

@app.route('/get_driver/<int:index>', methods=['GET'])
def get_driver(index):
    width = request.args.get('width', type=int)
    height = request.args.get('height', type=int)
    global DRIVER_DICTS
    # normalize the data here assign x as norm_x and y as norm_y as new keys 
    # in the DRIVER[ith] dict
    print("Normalizing data for driver:", DRIVER_DICTS[index]['first_name'])
    norm_x, norm_y = normalize_data(DRIVER_DICTS[index]['telem_data']['X'], DRIVER_DICTS[index]['telem_data']['Y'], width, height)
    DRIVER_DICTS[index]['norm_x'] = norm_x
    DRIVER_DICTS[index]['norm_y'] = norm_y
    if index < len(DRIVER_DICTS):
        return jsonify(DRIVER_DICTS[index])
    else:
        return jsonify({"error": "Index out of range"}), 404

@app.route('/get_track/', methods=['GET'])
def get_track():
    global Track_COORDS
    return jsonify(TRACK_COORDS)

    
if __name__ == '__main__':
    app.run(debug=True)
