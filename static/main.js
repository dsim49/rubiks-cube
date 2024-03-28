// Make all text un-selectable of the following types of tags:
for (let tagname of ["p", "h1", "h2", "h3", "h4", "h5", "h6"])
{
    for (let e of document.getElementsByTagName(tagname))
    {
        e.style.userSelect = "none";
    }
}

// Global variables that are not constant
class Globals {
    constructor() {
        this.mousedownID = -1; //Global ID of mouse down interval
        this.glob_waiting = -1; // If set to anything other than -1, this will prevent the big function from running.


        // Previous positions here
        this.prevX = NaN;
        this.prevY = NaN;
    }
}

class CubeData {
    constructor(n) {
        this.num_sides = n;

        this.faces = [
            new outerFace(n, "px"),
            new outerFace(n, "py"),
            new outerFace(n, "pz"),
            new outerFace(n, "nx"),
            new outerFace(n, "ny"),
            new outerFace(n, "nz"),
        ]
    }

    // In addition, add "layer" objects between which the various polygon objects will be rearranged every time a move is made.

    // In addition, add "camera position" data attributes here.
}

class outerFace {
    constructor(n, face_string) {
        // Face string is px, py, pz, nx, ny, or nz
        this.polygons = []
        for (let i = -n+1; i < n; i = i+2) {
            for (let j = -n+1; j < n; j = j+2) {
                this.polygons.push(new Polygon(i, j, face_string));
            }
        }

        this.isVisible = false;
    }
}

class Polygon {
    constructor(n, center1, center2, face_string) {
        if (face_string[1] == "x")
        {
            let dir1 = "y";
            let dir2 = "z";
        }
        else if (face_string[1] == "y")
        {
            let dir1 = "x";
            let dir2 = "z";
        }
        else if (face_string[1] == "z")
        {
            let dir1 = "x";
            let dir2 = "y";
        }

        let center = {x: NaN, y: NaN, z: NaN};
        center[face_string[1]] = n;
        center[dir1] = center1;
        center[dir2] = center2;
        
        if (face_string[0] == "n")
        {
            center[face_string[1]] = center[face_string[1]]*-1;
        }

        codes = {x: 0, y: 0, z: 0};
        codes[dir1] = 1;
        codes[dir2] = 2;

        this.coordinates = [];
        for (let i of [-1, 1]) {
            for (let j of [-1, 1]) {
                coords = {x: NaN, y: NaN, z: NaN};
                for (let l of ["x", "y", "z"]) {
                    if (codes[l] == 0) {
                        coords[l] = center[l];
                    }
                    else if (codes[l] == 1) {
                        coords[l] = center[l] + i;
                    }
                    else {
                        coords[l] = center[l] + j;
                    }
                }
                this.coordinates.push(new Coordinate(coords['x'], coords['y'], coords['z']));
            }
        }
    }
}

class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class CommandData {
    constructor(type, xmov, ymov) {
        this.type = type;
        this.movement_amountX = xmov;
        this.movement_amountY = ymov;
    }
}

const canv_container = document.getElementsByClassName("canvas-container")[0];
const canv = document.getElementById("main-canvas");
const ctx = canv.getContext("2d");
const debug_blocks = document.getElementsByClassName("debug-block");

canv.width = canv_container.clientWidth
canv.height = canv_container.clientHeight

console.log(canv_container.clientWidth);
console.log(canv_container.clientHeight);

canv.addEventListener("mousedown", switch_mouse_id);
document.addEventListener("mouseup", switch_mouse_id); // We want it to register a mouseup ANYWHERE on the screen
canv.addEventListener("mousemove", mousemove_function);

let globals = new Globals();
let cube_data = new CubeData(canv.width / 2, canv.height / 2);

async function switch_mouse_id(event)
{
    if (event.type == "mousedown")
    {
        globals.mousedownID = 1;
    }
    else if (event.type == "mouseup")
    {
        globals.mousedownID = -1;
        globals.prevX = NaN;
        globals.prevY = NaN;
    }
}

function mousemove_function(event)
{
    if (globals.mousedownID != -1 && globals.glob_waiting == -1)
    {
        wait_30hz();
        // Big function here
        generate_cmd(event);
    }
}

function generate_cmd(event)
{
    // The first debug box is the event type
    debug_blocks[0].getElementsByTagName("p")[0].textContent = event.type;

    // The second debug box is the difference in coordinates calculated by subraction
    if (isNaN(globals.prevX))
    {
        movement_amountX = 0;
        movement_amountY = 0;
    }
    else
    {
        movement_amountX = event.clientX - globals.prevX;
        movement_amountY = event.clientY - globals.prevY;
    }

    // Debug
    debug_blocks[1].getElementsByTagName("p")[0].textContent = "X: " + movement_amountX;
    debug_blocks[1].getElementsByTagName("p")[1].textContent = "Y: " + movement_amountY;

    // Form the command (use JSON format)
    the_cmd = new CommandData(event.type, movement_amountX, movement_amountY);

    // Call the command (use JSON format)
    fetch('/process_json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: cube_data, command: the_cmd}),
    })
    .then(response => {
        
        // Debug
        console.log("Raw response: ", response)

        // Convert response to json, i THINK
        return response.json()
    })
    .then(data => {
        
        // Debug
        console.log('Response from server:', data);
        
        // Set the data back to the cube_data object
        cube_data = JSON.parse(JSON.stringify(data));

        // If you're feeling lucky:
        // cube_data = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    // Draw the returned data from the command call
    drawCube();

    // This is done after everything else in generate_cmd
    globals.prevX = event.clientX;
    globals.prevY = event.clientY;

    // The third debug box is the miscellaneous message
    // debug_blocks[2].textContent = 
}

async function wait_30hz() 
{
    globals.glob_waiting = 1;
    setTimeout(() => {globals.glob_waiting = -1;}, 1000/60);
}

function drawCube()
{
    // Get real coordinates
    realX = (canv.width / 2) + cube_data.posX;
    realY = (canv.height / 2) + cube_data.posY;

    // Draw a "cube"
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.beginPath();
    ctx.arc(realX, realY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}