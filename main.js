// Make all text un-selectable of the following types of tags:
for (let tagname of ["p", "h1", "h2", "h3", "h4", "h5", "h6"])
{
    for (let e of document.getElementsByTagName(tagname))
    {
        e.style.userSelect = "none";
    }
}

const canv_container = document.getElementsByClassName("canvas-container")[0];
const canv = document.getElementById("main-canvas");
const debug_blocks = document.getElementsByClassName("debug-block");

canv.width = canv_container.clientWidth
canv.height = canv_container.clientHeight

console.log(canv_container.clientWidth);
console.log(canv_container.clientHeight);

canv.addEventListener("mousedown", mouse_function);
document.addEventListener("mouseup", mouse_function);
canv.addEventListener("mousemove", mousemove_function);

// Global variables that are not constant
let mousedownID = -1;  //Global ID of mouse down interval
let waiting = -1; // If set to anything other than -1, this will prevent the big function from running.

function mouse_function(event)
{
    if (event.type == "mousedown")
    {
        mousedownID = 1;
    }
    else if (event.type == "mouseup")
    {
        mousedownID = -1;
    }

    // disp_debug(event)
}

function mousemove_function(event)
{
    if (mousedownID != -1 && waiting == -1)
    {
        // Test async code here
        asdf();
        // Big function here
        disp_debug(event);
    }
}

function disp_debug(event)
{
    // The first debug box is the event type
    debug_blocks[0].getElementsByTagName("p")[0].textContent = event.type;

    // The second debug box is the coordinates
    debug_blocks[1].getElementsByTagName("p")[0].textContent = "X: " + event.clientX;
    debug_blocks[1].getElementsByTagName("p")[1].textContent = "Y: " + event.clientY;

    // The third debug box is the miscellaneous message
    // debug_blocks[2].textContent = 
}

// Debug
async function asdf()
{
    count = 0
    while (count < 10e7)
    {
        count = count + 1;
    }
    alert("Done!");
}
