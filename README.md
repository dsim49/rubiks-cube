# rubiks-cube

### This is the main file used for documentation

Note: this was rewritten from scratch and does the same thing as the previous (outdated) rubiks cube repo, but is just better. I am working on this one now as of March 2024.


# Cube Data Structure

### Main heirarchy of elements

1) The overall CubeData structure contains OuterFace structs (x6)
2) OuterFace struct contains n^2 Polygon objects
    - Also contains a boolean variable to indicate whether it is visible or not (javascript side)
3) Polygon struct contains Coordinate structs (x4)
    - Also contains three "layer" attributes so C++ can quickly determine which rotational faces it is a part of.
4) Coordinate struct contains x, y, and z attributes (ints)
    - Additionally contains zero-scales canv_x and canv_y coordinates

### auxiliary information

1) Orientation angles
2) Scaling factors and/or zoom (distance of observer)

### Methods (C++)

1) Method to read the main data (4 heirarchical objects) as well as auxiliary information, and compute additional data (indented attributes under main heirarchy)
    - Will have two modes, perspective and isometric
    - The two modes will also correspond to a slightly different set of auxiliary information
    - Therefore it might make sense to do two derived objects in C++ or whatever you call it

### Stretch Goals

1) Reduce the base class of the cube to only that which javascript cares about (scaled coordinates). Omit more than half the data in this way. To compensate, optimize back end to be able to do the necessary inverse calculations as well as forward calculations, in the same amount of time.