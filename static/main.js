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

        this.polygons = []

        this.outerFace(n, "px");
        this.outerFace(n, "py");
        this.outerFace(n, "pz");
        this.outerFace(n, "nx");
        this.outerFace(n, "ny");
        this.outerFace(n, "nz");

        this.outerface_info = {
            px: false,
            py: false,
            pz: false,
            nx: false,
            ny: false,
            nz: false,
        }
    }

    // In addition, add "layer" objects between which the various polygon objects will be rearranged every time a move is made.

    // In addition, add "camera position" data attributes here.

    outerFace(n, face_string)
    {
        for (let i = -n+1; i < n; i = i+2) {
            for (let j = -n+1; j < n; j = j+2) {
                this.polygons.push(new Polygon(i, j, face_string));
            }
        }
    }

    readVisibility()
    {
    }

    readScaledCoords()
    {
    }
}

class Polygon {
    constructor(n, center1, center2, face_string) {
        this.outer_face = face_string;

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

    readOuterLayer()
    {
        // The coordinate value shared by all four coordinates, gives the outer layer.
        // The other two layers are calcluated by the other two coordinates.
        // This is really only useful for the C++ side of things since we literally know
        // the outer layer since the constructor takes it as an argument, but 
        // incidentally, this is also the easiest start to the readLayers() function
        // just below.

        cands = {
            x: true,
            y: true,
            z: true,
        }

        for (let item of this.coordinates)
        {
            max_abs = Math.max(Math.abs(item.x), Math.abs(item.y), Math.abs(item.z));
            if (Math.abs(item.x) != max_abs) {
                cands.x = false;
            }
            if (Math.abs(item.y) != max_abs) {
                cands.y = false;
            }
            if (Math.abs(item.z) != max_abs) {
                cands.z = false;
            }
            if (Object.values(cands).filter((x) => x == true).length == 1)
            {
                break;
            }
        }

        for (const [key,value] of Object.entries(cands))
        {
            if (value == true)
            {
                return key;
            }
        }
    }

    readLayers()
    {
        local_outerlayer = this.readOuterLayer();
        local_n = this.coordinates[0][local_outerlayer];

        // We can consider the positive faces to be layer "1" and the negative faces to be layer "n"
        // Using this formula
        min_x = local_n;
        min_y = local_n;
        min_z = local_n;
        for (let item of this.coordinates)
        {
            if (item.x < min_x) {
                min_x = item.x;
            }
            if (item.y < min_y) {
                min_y = item.y;
            }
            if (item.z < min_z) {
                min_z = item.z;
            }
        }

        this.x_layer = Math.max(1, (local_n-min_x)/2);
        this.y_layer = Math.max(1, (local_n-min_y)/2);
        this.z_layer = Math.max(1, (local_n-min_z)/2);
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