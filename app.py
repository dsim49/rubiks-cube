from flask import Flask, render_template, request, jsonify

import subprocess
import json

app = Flask(__name__)

# Serve index.html from the templates folder
@app.route('/')
def index():
    return render_template('index.html')

# Route for processing JSON data
@app.route('/process_json', methods=['POST'])
def process_json():
    # Receive JSON data from the client
    current_state = request.json['state']
    command = request.json['command']
    
    # Return the new state (use the command and original state to calculate this)
    def update_state(curr_state, cmd):
            # new_state = curr_state.copy()
            # new_state_X = new_state['posX']
            # new_state_Y = new_state['posY']

            # new_state_X += command['movement_amountX']
            # new_state_Y += command['movement_amountY']
            
            # # Keep within the bounds
            # if new_state_X < -1*new_state['xbound']:
            #     new_state_X = -1*new_state['xbound']
            # if new_state_X > new_state['xbound']:
            #     new_state_X = new_state['xbound']
            # if new_state_Y < -1*new_state['ybound']:
            #     new_state_Y = -1*new_state['ybound']
            # if new_state_Y > new_state['ybound']:
            #     new_state_Y = new_state['ybound']

            # # Update new_state values
            # new_state['posX'] = new_state_X
            # new_state['posY'] = new_state_Y
            # return new_state
        curr_state_str = json.dumps(curr_state)
        cmd_str = json.dumps(cmd)
        print(curr_state_str)
        args = ['.\src\main.exe ', curr_state_str, cmd_str]
        print("Length: " + str(len(args)))
        completed_process = subprocess.run(args, capture_output=True)
        output = completed_process.stdout.decode('utf-8')
        error = completed_process.stderr.decode('utf-8')
        print(output)
        print(error)
        return curr_state

        

    new_state = update_state(current_state, command)
    
    # Send back the edited JSON data to the client
    return jsonify(new_state)

if __name__ == '__main__':
    app.run(debug=True)
