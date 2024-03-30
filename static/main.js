import "numeric";

// Make all text un-selectable of the following types of tags:
for (let tagname of ["p", "h1", "h2", "h3", "h4", "h5", "h6"])
{
    for (let e of document.getElementsByTagName(tagname))
    {
        e.style.userSelect = "none";
    }
}

// Functions
function mat_mult(A, vec)
{
    // Takes a 3x3 matrix A and 3x1 vectore vec.
    // If the sizes are different, your excuses are your own.

    // Note: also, the inner arrays of the matrix are columns.

    col1 = A[0].map((e) => (e*vec[0]));
    col2 = A[1].map((e) => (e*vec[1]));
    col3 = A[2].map((e) => (e*vec[2]));

    return col1.map((e,i) => (e+col2[i]+col3[i]));
}

function dot(a, b)
{
    // Note: a and b must be lists of the same size.
    sum = 0;
    a.forEach((e, i) => {sum += e*b[i];});
}

// Global variables that are not constant
class Globals {
    constructor() {
        this.mousedownID = -1; //Global ID of mouse down interval
        this.glob_waiting = -1; // If set to anything other than -1, this will prevent the big function from running.


        // Previous positions here
        this.prevX = NaN;
        this.prevY = NaN;

        // Misc
        this.sens = 0.25;
    }
}
let globals = new Globals();

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

        // Orientation data
        this.theta = NaN;
        this.phi = NaN;
        this.gamma = NaN;
        // These are COLUMNS (the matrix would look transposed to this if written on paper)
        // Why? Because it makes more sense to me. Lmk if confusing to you.
        this.V = [
            [-0.7071, 0.35355 , -0.61236],
            [0.7071 , 0.35355 , -0.61236],
            [0      , -0.86602, -0.5    ],
        ]

        // This is the "zoom" factor for isometric mode
        // Note: base is 600 wide for a side-on isometric view
        // This is equivalent to 100 pixels per unit length (radially).
        // Convention in this code is that one square is 2x2 (in terms of unit length).
        this.base_scale = Math.floor(300/n);
        this.zoom = 1;

        // This is the zoom factor for perspective mode. It is not a zoom, but a distance.
        // Note: the initial value will have to be found by trial and error.
        this.rho = 2*n;
    }

    // In addition, add "layer" objects between which the various polygon objects will be rearranged every time a move is made.

    // In addition, add "camera position" data attributes here.

    outerFace(n, face_string)
    {
        for (let i = -n+1; i < n; i = i+2) {
            for (let j = -n+1; j < n; j = j+2) {
                this.polygons.push(new Polygon(n, i, j, face_string));
            }
        }
    }

    readVisibility()
    {
        for (let item of Object.keys(this.outerface_info)) {
            let obs_vec = {
                x: Math.cos(this.phi)*Math.cos(this.theta),
                y: Math.cos(this.phi)*Math.sin(this.theta),
                z: Math.sin(this.phi),
            }
            let normal_vec = {
                x: 0,
                y: 0,
                z: 0,
            }
            if (item[0] == "p") {
                normal_vec[item[1]] = 1;
            }
            else if (item[0] == "n") {
                normal_vec[item[1]] = -1;
            }
            else {
                console.log("error: readVisibility: unrecognized face_string argument");
            }

            // Dot product
            dp = (obs_vec.x*normal_vec.x + obs_vec.y*normal_vec.y + obs_vec.z*normal_vec.z);
            if (dp > 0) {
                this.outerface_info[item] = true;
            }
            else {
                this.outerface_info[item] = false;
            }
        }
    }

    readScaledCoords()
    {
        // Get the inverse of V, useful soon
        V_inv = numeric.inv(this.V);
                
        // Set the scale factor. Since this function is for ISOMETRIC mode, there is no concept
        // of "distance" of the camera from the origin.
        cmp_scale = this.base_scale*this.zoom;

        // Compute C (our location in local coords) and xloc (the global x-axis in local coords)
        C = mat_mult(Vinv, [0,0,-1]);
        xloc = mat_mult(Vinv, [1,0,0]);

        for (let poly of this.polygons) {
            for (let coord of poly.coordinates)
            {
                
            }
        }
    }
}

class Polygon {
    constructor(n, center1, center2, face_string) {
        this.outer_face = face_string;

        let dir1 = ""; let dir2 = "";

        if (face_string[1] == "x")
        {
            dir1 = "y";
            dir2 = "z";
        }
        else if (face_string[1] == "y")
        {
            dir1 = "x";
            dir2 = "z";
        }
        else if (face_string[1] == "z")
        {
            dir1 = "x";
            dir2 = "y";
        }
        else {
            console.log("error: face_string not recognized: ", face_string);
        }

        let center = {x: NaN, y: NaN, z: NaN};
        center[face_string[1]] = n;
        center[dir1] = center1;
        center[dir2] = center2;
        
        if (face_string[0] == "n")
        {
            center[face_string[1]] = center[face_string[1]]*-1;
        }

        let codes = {x: 0, y: 0, z: 0};
        codes[dir1] = 1;
        codes[dir2] = 2;

        this.coordinates = [];
        for (let i of [-1, 1]) {
            for (let j of [-1, 1]) {
                let coords = {x: NaN, y: NaN, z: NaN};
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

        let cands = {
            x: true,
            y: true,
            z: true,
        }

        for (let item of this.coordinates)
        {
            let max_abs = Math.max(Math.abs(item.x), Math.abs(item.y), Math.abs(item.z));
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
        let local_outerlayer = this.readOuterLayer();
        let local_n = this.coordinates[0][local_outerlayer];

        // NOTE: this commented out code is needed in the C++ eventual backend, but
        // not in the javascript. Technically the only purpose of even including these methods
        // in the javascript at all, is to help initialize the cube.

        // // Let the program know which outer_face object this polygon belongs to
        // let pfx = "p";
        // if (local_n < 0) {
        //     pfx = "n";
        // }
        // this.outer_face = pfx + local_outerlayer;

        // Make local_n positive for use in the next algorithm
        local_n = Math.abs(local_n);

        // We can consider the positive faces to be layer "1" and the negative faces to be layer "n"
        // Using this formula
        let min_x = local_n;
        let min_y = local_n;
        let min_z = local_n;
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

let cube_data = new CubeData(3);

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